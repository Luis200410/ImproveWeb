import * as jose from "npm:jose@^5.9.6";
import { decode as cborDecode } from "npm:cbor-x@1.6.0";
import * as x509 from "npm:@peculiar/x509@1.12.3";
import { p256 } from "npm:@noble/curves@1.4.0/p256";
import { p384 } from "npm:@noble/curves@1.4.0/p384";

x509.cryptoProvider.set(crypto);

// CORS Headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

// Response helper
function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

// Logging helper (STRICT: only action name, HTTP status, and Plaid error_code. NEVER log payloads/tokens/transactions)
function logAction(action: string, status: number, errorCode?: string) {
  if (errorCode) {
    console.log(`[plaid] action=${action} status=${status} error_code=${errorCode}`);
  } else {
    console.log(`[plaid] action=${action} status=${status}`);
  }
}

// A bank site's apple-touch-icon as base64 PNG (≤ 256 KB), or null. Never throws.
async function siteIcon(siteUrl: string): Promise<string | null> {
  let origin: string;
  try {
    origin = new URL(siteUrl).origin;
  } catch {
    return null;
  }
  for (const path of ["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png"]) {
    try {
      const res = await fetch(origin + path, { redirect: "follow", signal: AbortSignal.timeout(4000) });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.startsWith("image/png")) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.length < 200 || bytes.length > 256 * 1024) continue;
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(binary);
    } catch {
      // try the next path
    }
  }
  return null;
}

// In-memory Apple JWKS cache
const APPLE_JWKS = jose.createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));


// ========================================================
// App Attest (Money bank sync — no accounts)
// The app proves it is the real Money app on a real Apple device: Apple signs an attestation of a
// Secure Enclave key; we check it here and mint the usual 90-day session. Stateless: the challenge is a
// short-lived JWT, nothing is stored. Steps follow Apple's "Validating apps that connect to your server".
// ========================================================

// Apple App Attestation Root CA — https://www.apple.com/certificateauthority/Apple_App_Attestation_Root_CA.pem
// SHA-256 fingerprint 1C:B9:82:3B:A2:8B:A6:AD:2D:33:A0:06:94:1D:E2:AE:4F:51:3E:F1:D4:E8:31:B9:F7:E0:FA:7B:62:42:C9:32
const APPLE_APP_ATTEST_ROOT = new x509.X509Certificate(`-----BEGIN CERTIFICATE-----
MIICITCCAaegAwIBAgIQC/O+DvHN0uD7jG5yH2IXmDAKBggqhkjOPQQDAzBSMSYw
JAYDVQQDDB1BcHBsZSBBcHAgQXR0ZXN0YXRpb24gUm9vdCBDQTETMBEGA1UECgwK
QXBwbGUgSW5jLjETMBEGA1UECAwKQ2FsaWZvcm5pYTAeFw0yMDAzMTgxODMyNTNa
Fw00NTAzMTUwMDAwMDBaMFIxJjAkBgNVBAMMHUFwcGxlIEFwcCBBdHRlc3RhdGlv
biBSb290IENBMRMwEQYDVQQKDApBcHBsZSBJbmMuMRMwEQYDVQQIDApDYWxpZm9y
bmlhMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAERTHhmLW07ATaFQIEVwTtT4dyctdh
NbJhFs/Ii2FdCgAHGbpphY3+d8qjuDngIN3WVhQUBHAoMeQ/cLiP1sOUtgjqK9au
Yen1mMEvRq9Sk3Jm5X8U62H+xTD3FE9TgS41o0IwQDAPBgNVHRMBAf8EBTADAQH/
MB0GA1UdDgQWBBSskRBTM72+aEH/pwyp5frq5eWKoTAOBgNVHQ8BAf8EBAMCAQYw
CgYIKoZIzj0EAwMDaAAwZQIwQgFGnByvsiVbpTKwSga0kP0e8EeDS4+sQmTvb7vn
53O5+FRXgeLhpJ06ysC5PrOyAjEAp5U4xDgEgllF7En3VcE3iexZZtKeYnpqtijV
oyFraWVIyd/dganmrduC1bmTBGwD
-----END CERTIFICATE-----`);

const APP_ATTEST_NONCE_OID = "1.2.840.113635.100.8.2";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// DER: the full TLV at `offset` → [start, end).
function derElement(der: Uint8Array, offset: number): [number, number] {
  let len = der[offset + 1];
  let header = 2;
  if (len & 0x80) {
    const n = len & 0x7f;
    len = 0;
    for (let i = 0; i < n; i++) len = (len << 8) | der[offset + 2 + i];
    header = 2 + n;
  }
  return [offset, offset + header + len];
}

// `cert` was signed by `issuer`. Checked with @noble/curves, not WebCrypto: Apple signs the App Attest
// credential certificate with a P-384 key over SHA-256, a curve/hash pair Deno's WebCrypto doesn't
// implement ("Not implemented") — every device failed verification.
async function signedBy(cert: x509.X509Certificate, issuer: x509.X509Certificate, now: Date): Promise<boolean> {
  if (now < cert.notBefore || now > cert.notAfter) return false;
  const der = new Uint8Array(cert.rawData);
  // Certificate ::= SEQUENCE { tbsCertificate, signatureAlgorithm, signatureValue BIT STRING }
  const outerHeader = der[1] & 0x80 ? 2 + (der[1] & 0x7f) : 2;
  const [tbsStart, tbsEnd] = derElement(der, outerHeader);
  const [, algEnd] = derElement(der, tbsEnd);
  const [bitStart, bitEnd] = derElement(der, algEnd);
  const bitHeader = der[bitStart + 1] & 0x80 ? 2 + (der[bitStart + 1] & 0x7f) : 2;
  const tbs = der.slice(tbsStart, tbsEnd);
  const sig = der.slice(bitStart + bitHeader + 1, bitEnd);   // skip the unused-bits byte → DER ECDSA signature
  const hashName = (cert.signatureAlgorithm as { hash?: { name?: string } }).hash?.name ?? "SHA-256";
  const digest = new Uint8Array(await crypto.subtle.digest(hashName, tbs));
  const spki = new Uint8Array(issuer.publicKey.rawData);
  // Uncompressed point at the end of the SubjectPublicKeyInfo: 97 bytes (P-384) or 65 (P-256).
  const p384Point = spki.slice(spki.length - 97);
  if (spki.length >= 120 && p384Point[0] === 0x04) {
    return p384.verify(sig, digest, p384Point, { lowS: false, prehash: false });
  }
  return p256.verify(sig, digest, spki.slice(spki.length - 65), { lowS: false, prehash: false });
}

// Throws (with a short reason) unless `attestationB64` is Apple's attestation of `keyIdB64` for `appId`
// over `challenge`.
async function verifyAppAttestation(attestationB64: string, keyIdB64: string, challenge: string, appId: string) {
  const att = cborDecode(b64ToBytes(attestationB64)) as {
    fmt?: string;
    attStmt?: { x5c?: Uint8Array[] };
    authData?: Uint8Array;
  };
  if (att?.fmt !== "apple-appattest") throw new Error("fmt");
  const x5c = att.attStmt?.x5c ?? [];
  const authData = att.authData ? new Uint8Array(att.authData) : null;
  if (x5c.length < 2 || !authData || authData.length < 55) throw new Error("shape");

  // 1. Certificate chain: credential cert ← intermediate ← Apple App Attestation Root CA.
  const cred = new x509.X509Certificate(new Uint8Array(x5c[0]));
  const inter = new x509.X509Certificate(new Uint8Array(x5c[1]));
  const now = new Date();
  if (!(await signedBy(inter, APPLE_APP_ATTEST_ROOT, now))) throw new Error("chain-root");
  if (!(await signedBy(cred, inter, now))) throw new Error("chain-inter");

  // 2–4. nonce = SHA256(authData ‖ SHA256(challenge)) must equal the credential cert's nonce extension.
  const clientDataHash = await sha256(new TextEncoder().encode(challenge));
  const nonce = await sha256(concatBytes(authData, clientDataHash));
  const ext = cred.getExtension(APP_ATTEST_NONCE_OID);
  if (!ext) throw new Error("nonce-ext");
  const extValue = new Uint8Array(ext.value);
  // DER: SEQUENCE { [1] { OCTET STRING (32) nonce } } — the nonce is the trailing 32 bytes.
  if (extValue.length < 34 || extValue[extValue.length - 34] !== 0x04 || extValue[extValue.length - 33] !== 0x20) {
    throw new Error("nonce-der");
  }
  if (!sameBytes(extValue.slice(extValue.length - 32), nonce)) throw new Error("nonce");

  // 5. keyId = SHA256(the credential public key, uncompressed P-256 point).
  const spki = new Uint8Array(cred.publicKey.rawData);
  const point = spki.slice(spki.length - 65);
  const keyId = b64ToBytes(keyIdB64);
  if (point[0] !== 0x04 || !sameBytes(await sha256(point), keyId)) throw new Error("key-id");

  // 6. rpIdHash = SHA256(TEAMID.bundleid).
  if (!sameBytes(authData.slice(0, 32), await sha256(new TextEncoder().encode(appId)))) throw new Error("app-id");

  // 7. A fresh key: counter 0.
  const counter = (authData[33] << 24) | (authData[34] << 16) | (authData[35] << 8) | authData[36];
  if (counter !== 0) throw new Error("counter");

  // 8. aaguid: production ("appattest" + 7 zero bytes) or development ("appattestdevelop").
  const aaguid = authData.slice(37, 53);
  const prod = concatBytes(new TextEncoder().encode("appattest"), new Uint8Array(7));
  const dev = new TextEncoder().encode("appattestdevelop");
  if (!sameBytes(aaguid, prod) && !sameBytes(aaguid, dev)) throw new Error("aaguid");

  // 9. credentialId = keyId.
  const credIdLength = (authData[53] << 8) | authData[54];
  if (!sameBytes(authData.slice(55, 55 + credIdLength), keyId)) throw new Error("cred-id");
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // 2. Reject non-POST methods
  if (req.method !== "POST") {
    return jsonResponse(
      { error_code: "METHOD_NOT_ALLOWED", error_message: "Only POST requests are accepted." },
      405
    );
  }

  // 3. Load Environment Variables
  const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID") || "";
  const PLAID_SECRET = Deno.env.get("PLAID_SECRET") || "";
  const PLAID_ENV = (Deno.env.get("PLAID_ENV") || "sandbox").toLowerCase();
  const PLAID_REDIRECT_URI = Deno.env.get("PLAID_REDIRECT_URI");
  const SESSION_SIGNING_KEY = Deno.env.get("SESSION_SIGNING_KEY") || "";
  const APPLE_BUNDLE_ID = Deno.env.get("APPLE_BUNDLE_ID") || "com.improve.money";
  const APPLE_TEAM_ID = Deno.env.get("APPLE_TEAM_ID") || "RCSLHHHTU3";
  const APPLE_KEY_ID = Deno.env.get("APPLE_KEY_ID") || "";
  const APPLE_PRIVATE_KEY = Deno.env.get("APPLE_PRIVATE_KEY") || "";

  const PLAID_BASE_URL =
    PLAID_ENV === "production" ? "https://production.plaid.com" : "https://sandbox.plaid.com";

  // Session tokens are bound to the Plaid environment, so sandbox sessions
  // (including ones minted by `sandbox_session`) are rejected in production.
  const SESSION_ISSUER = `improve-money:${PLAID_ENV}`;

  // Helper to call Plaid API
  async function callPlaid(endpoint: string, payload: Record<string, unknown>) {
    const url = `${PLAID_BASE_URL}${endpoint}`;
    const body = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      ...payload,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // Parse JSON Body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    logAction("unknown", 400);
    return jsonResponse({ error_code: "INVALID_JSON", error_message: "Malformed JSON body." }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!action) {
    logAction("missing_action", 400);
    return jsonResponse({ error_code: "MISSING_ACTION", error_message: "Field 'action' is required." }, 400);
  }

  try {
    // ==========================================
    // ACTION: session (No session token required)
    // LEGACY: Money builds from before sign-in was removed (Apple identity token). New builds use
    // attest_challenge + session_attest. Remove once those old builds are gone.
    // ==========================================
    if (action === "session") {
      const appleIdentityToken = typeof body.apple_identity_token === "string" ? body.apple_identity_token : "";
      if (!appleIdentityToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'apple_identity_token' is required." },
          400
        );
      }

      if (!SESSION_SIGNING_KEY) {
        logAction(action, 500);
        return jsonResponse({ error_code: "CONFIGURATION_ERROR", error_message: "Server configuration error." }, 500);
      }

      // Verify Apple Identity Token with Apple JWKS
      let appleSub: string;
      try {
        const { payload } = await jose.jwtVerify(appleIdentityToken, APPLE_JWKS, {
          issuer: "https://appleid.apple.com",
          audience: APPLE_BUNDLE_ID,
        });
        if (!payload.sub) {
          throw new Error("Missing sub in Apple token");
        }
        appleSub = payload.sub;
      } catch {
        logAction(action, 401);
        return jsonResponse({ error_code: "INVALID_APPLE_TOKEN", error_message: "Invalid Apple identity token." }, 401);
      }

      // Calculate hex SHA-256(apple sub)
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(appleSub));
      const sub = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Sign our own session JWT with HS256 (expires in 90 days)
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = nowSeconds + 90 * 24 * 60 * 60;
      const keyBytes = new TextEncoder().encode(SESSION_SIGNING_KEY);

      const session_token = await new jose.SignJWT({ sub })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(SESSION_ISSUER)
        .setIssuedAt(nowSeconds)
        .setExpirationTime(expiresAt)
        .sign(keyBytes);

      logAction(action, 200);
      return jsonResponse({ session_token, expires_at: expiresAt }, 200);
    }

    // ========================================================
    // ACTION: attest_challenge (No session token required)
    // A one-time challenge for App Attest — a 5-minute signed token, so nothing is stored.
    // ========================================================
    if (action === "attest_challenge") {
      if (!SESSION_SIGNING_KEY) {
        logAction(action, 500);
        return jsonResponse({ error_code: "CONFIGURATION_ERROR", error_message: "Server configuration error." }, 500);
      }
      const random = crypto.getRandomValues(new Uint8Array(32));
      const challenge = await new jose.SignJWT({ typ: "attest", n: btoa(String.fromCharCode(...random)) })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(SESSION_ISSUER)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(new TextEncoder().encode(SESSION_SIGNING_KEY));
      logAction(action, 200);
      return jsonResponse({ challenge });
    }

    // ========================================================
    // ACTION: session_attest (No session token required)
    // App Attest attestation → our 90-day session (replaces the Apple-identity-token `session`).
    // ========================================================
    if (action === "session_attest") {
      const keyId = typeof body.key_id === "string" ? body.key_id : "";
      const attestation = typeof body.attestation === "string" ? body.attestation : "";
      const challenge = typeof body.challenge === "string" ? body.challenge : "";
      if (!keyId || !attestation || !challenge) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Fields 'key_id', 'attestation' and 'challenge' are required." },
          400
        );
      }
      if (!SESSION_SIGNING_KEY) {
        logAction(action, 500);
        return jsonResponse({ error_code: "CONFIGURATION_ERROR", error_message: "Server configuration error." }, 500);
      }
      const keyBytes = new TextEncoder().encode(SESSION_SIGNING_KEY);

      // The challenge must be one we issued in the last 5 minutes.
      try {
        const { payload } = await jose.jwtVerify(challenge, keyBytes, { issuer: SESSION_ISSUER });
        if (payload.typ !== "attest") throw new Error("typ");
      } catch {
        logAction(action, 401, "CHALLENGE_INVALID");
        return jsonResponse({ error_code: "CHALLENGE_INVALID", error_message: "The challenge expired — try again." }, 401);
      }

      try {
        await verifyAppAttestation(attestation, keyId, challenge, `${APPLE_TEAM_ID}.${APPLE_BUNDLE_ID}`);
      } catch (e) {
        logAction(action, 401, `ATTESTATION_INVALID:${e instanceof Error ? e.message : "unknown"}`);
        return jsonResponse({ error_code: "ATTESTATION_INVALID", error_message: "This device couldn't be verified." }, 401);
      }

      // The session subject: SHA-256 of the attested key id (anonymous, per install).
      const subBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyId));
      const sub = Array.from(new Uint8Array(subBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = nowSeconds + 90 * 24 * 60 * 60;
      const session_token = await new jose.SignJWT({ sub })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(SESSION_ISSUER)
        .setIssuedAt(nowSeconds)
        .setExpirationTime(expiresAt)
        .sign(keyBytes);

      logAction(action, 200);
      return jsonResponse({ session_token, expires_at: expiresAt }, 200);
    }

    // ========================================================
    // ACTION: sandbox_session (Sandbox test helper, NO iPhone)
    // Refuses to run if PLAID_ENV == "production"
    // ========================================================
    if (action === "sandbox_session") {
      if (PLAID_ENV === "production") {
        logAction(action, 403);
        return jsonResponse(
          { error_code: "FORBIDDEN", error_message: "Sandbox test session is disabled in production." },
          403
        );
      }

      if (!SESSION_SIGNING_KEY) {
        logAction(action, 500);
        return jsonResponse({ error_code: "CONFIGURATION_ERROR", error_message: "Server configuration error." }, 500);
      }

      const testUser = typeof body.test_user_id === "string" ? body.test_user_id : "sandbox_test_user";
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(testUser));
      const sub = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = nowSeconds + 90 * 24 * 60 * 60;
      const keyBytes = new TextEncoder().encode(SESSION_SIGNING_KEY);

      const session_token = await new jose.SignJWT({ sub })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(SESSION_ISSUER)
        .setIssuedAt(nowSeconds)
        .setExpirationTime(expiresAt)
        .sign(keyBytes);

      logAction(action, 200);
      return jsonResponse({ session_token, expires_at: expiresAt }, 200);
    }

    // ========================================================
    // ACTION: fx_rates (public — no user data; ECB daily reference rates)
    // The app converts foreign-currency transactions into the user's home currency.
    // ========================================================
    if (action === "fx_rates") {
      const base = typeof body.base === "string" && /^[A-Z]{3}$/.test(body.base) ? body.base : "USD";
      const fxRes = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`);
      if (!fxRes.ok) {
        logAction(action, fxRes.status);
        return jsonResponse(
          { error_code: "FX_UNAVAILABLE", error_message: "Exchange rates are unavailable right now." },
          502
        );
      }
      const fx = await fxRes.json().catch(() => ({}));
      logAction(action, 200);
      return jsonResponse({ base: fx.base ?? base, date: fx.date ?? "", rates: fx.rates ?? {} });
    }

    // ========================================================
    // AUTHENTICATION CHECK FOR ALL OTHER ACTIONS
    // Requires Authorization: Bearer <session_token>
    // ========================================================
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      logAction(action, 401);
      return jsonResponse({ error_code: "SESSION_INVALID" }, 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token || !SESSION_SIGNING_KEY) {
      logAction(action, 401);
      return jsonResponse({ error_code: "SESSION_INVALID" }, 401);
    }

    let sessionSub: string;
    try {
      const keyBytes = new TextEncoder().encode(SESSION_SIGNING_KEY);
      const { payload } = await jose.jwtVerify(token, keyBytes, {
        issuer: SESSION_ISSUER,
      });
      if (typeof payload.sub !== "string" || !payload.sub) {
        throw new Error("Invalid sub");
      }
      sessionSub = payload.sub;
    } catch {
      logAction(action, 401);
      return jsonResponse({ error_code: "SESSION_INVALID" }, 401);
    }

    // ========================================================
    // ACTION: create_link_token
    // ========================================================
    if (action === "create_link_token") {
      const accessToken = typeof body.access_token === "string" ? body.access_token : undefined;

      const plaidPayload: Record<string, unknown> = {
        client_name: "IMPROVE Money",
        country_codes: ["US"],
        language: "en",
        user: { client_user_id: sessionSub },
      };

      if (accessToken) {
        // UPDATE MODE: omit products, pass access_token
        plaidPayload.access_token = accessToken;
      } else {
        // NEW ITEM MODE
        plaidPayload.products = ["transactions"];
        // Debts (cards, student loans, mortgages) when the bank supports them — never blocks Link.
        plaidPayload.optional_products = ["liabilities"];
        plaidPayload.transactions = { days_requested: 730 };
      }

      if (PLAID_REDIRECT_URI) {
        plaidPayload.redirect_uri = PLAID_REDIRECT_URI;
      }

      const plaidRes = await callPlaid("/link/token/create", plaidPayload);
      if (!plaidRes.ok) {
        logAction(action, plaidRes.status, plaidRes.data?.error_code);
        return jsonResponse(
          {
            error_type: plaidRes.data?.error_type,
            error_code: plaidRes.data?.error_code,
            error_message: plaidRes.data?.error_message,
            display_message: plaidRes.data?.display_message,
          },
          plaidRes.status
        );
      }

      logAction(action, 200);
      return jsonResponse({
        link_token: plaidRes.data?.link_token,
        expiration: plaidRes.data?.expiration,
      });
    }

    // ========================================================
    // ACTION: exchange_public_token
    // ========================================================
    if (action === "exchange_public_token") {
      const publicToken = typeof body.public_token === "string" ? body.public_token : "";
      if (!publicToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'public_token' is required." },
          400
        );
      }

      const plaidRes = await callPlaid("/item/public_token/exchange", {
        public_token: publicToken,
      });

      if (!plaidRes.ok) {
        logAction(action, plaidRes.status, plaidRes.data?.error_code);
        return jsonResponse(
          {
            error_type: plaidRes.data?.error_type,
            error_code: plaidRes.data?.error_code,
            error_message: plaidRes.data?.error_message,
            display_message: plaidRes.data?.display_message,
          },
          plaidRes.status
        );
      }

      logAction(action, 200);
      return jsonResponse({
        access_token: plaidRes.data?.access_token,
        item_id: plaidRes.data?.item_id,
      });
    }

    // ========================================================
    // ACTION: sync_transactions
    // ========================================================
    if (action === "sync_transactions") {
      const accessToken = typeof body.access_token === "string" ? body.access_token : "";
      if (!accessToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'access_token' is required." },
          400
        );
      }

      const originalCursor = typeof body.cursor === "string" ? body.cursor : "";
      let currentCursor = originalCursor;
      let added: unknown[] = [];
      let modified: unknown[] = [];
      let removed: unknown[] = [];
      let latestNextCursor = originalCursor;
      let latestAccounts: unknown[] = [];
      let restarts = 0;
      const MAX_RESTARTS = 3;

      while (true) {
        const syncPayload: Record<string, unknown> = {
          access_token: accessToken,
          count: 500,
          // The bank's raw statement text (what a dispute quotes) — shown on the transaction page.
          options: { include_original_description: true },
        };
        if (currentCursor) {
          syncPayload.cursor = currentCursor;
        }

        const plaidRes = await callPlaid("/transactions/sync", syncPayload);
        if (!plaidRes.ok) {
          // Check for mutation during pagination
          if (
            plaidRes.data?.error_code === "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION" &&
            restarts < MAX_RESTARTS
          ) {
            restarts++;
            currentCursor = originalCursor;
            added = [];
            modified = [];
            removed = [];
            continue;
          }

          logAction(action, plaidRes.status, plaidRes.data?.error_code);
          return jsonResponse(
            {
              error_type: plaidRes.data?.error_type,
              error_code: plaidRes.data?.error_code,
              error_message: plaidRes.data?.error_message,
              display_message: plaidRes.data?.display_message,
            },
            plaidRes.status
          );
        }

        const d = plaidRes.data || {};
        if (Array.isArray(d.added)) added.push(...d.added);
        if (Array.isArray(d.modified)) modified.push(...d.modified);
        if (Array.isArray(d.removed)) removed.push(...d.removed);
        if (Array.isArray(d.accounts)) latestAccounts = d.accounts;
        latestNextCursor = d.next_cursor || currentCursor;

        if (d.has_more) {
          currentCursor = d.next_cursor;
        } else {
          break;
        }
      }

      logAction(action, 200);
      return jsonResponse({
        added,
        modified,
        removed,
        next_cursor: latestNextCursor,
        accounts: latestAccounts,
      });
    }

    // ========================================================
    // ACTION: institution (bank name, logo PNG base64, brand color — for the account cards)
    // ========================================================
    if (action === "institution") {
      const accessToken = typeof body.access_token === "string" ? body.access_token : "";
      if (!accessToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'access_token' is required." },
          400
        );
      }

      const itemRes = await callPlaid("/item/get", { access_token: accessToken });
      const institutionId = itemRes.data?.item?.institution_id;
      if (!itemRes.ok || typeof institutionId !== "string") {
        logAction(action, itemRes.ok ? 404 : itemRes.status, itemRes.data?.error_code);
        return jsonResponse(
          {
            error_type: itemRes.data?.error_type,
            error_code: itemRes.data?.error_code ?? "NO_INSTITUTION",
            error_message: itemRes.data?.error_message ?? "This bank has no institution record.",
            display_message: itemRes.data?.display_message,
          },
          itemRes.ok ? 404 : itemRes.status
        );
      }

      const instRes = await callPlaid("/institutions/get_by_id", {
        institution_id: institutionId,
        country_codes: ["US", "CA", "GB", "IE", "FR", "ES", "NL", "DE", "IT", "PL", "DK", "NO", "SE", "EE", "LT", "LV", "PT", "BE"],
        options: { include_optional_metadata: true },
      });

      if (!instRes.ok) {
        logAction(action, instRes.status, instRes.data?.error_code);
        return jsonResponse(
          {
            error_type: instRes.data?.error_type,
            error_code: instRes.data?.error_code,
            error_message: instRes.data?.error_message,
            display_message: instRes.data?.display_message,
          },
          instRes.status
        );
      }

      const inst = instRes.data?.institution ?? {};

      // Plaid has no logo for plenty of banks — fall back to the bank's own home-screen icon.
      // Fetched here, server-side, so no third-party logo service ever learns which bank the user has.
      let logo: string | null = typeof inst.logo === "string" && inst.logo ? inst.logo : null;
      if (!logo && typeof inst.url === "string" && inst.url.startsWith("https://")) {
        logo = await siteIcon(inst.url);
      }

      logAction(action, 200);
      return jsonResponse({
        institution_id: institutionId,
        name: inst.name ?? null,
        logo,
        primary_color: inst.primary_color ?? null,
      });
    }

    // ========================================================
    // ACTION: get_accounts
    // ========================================================
    if (action === "get_accounts") {
      const accessToken = typeof body.access_token === "string" ? body.access_token : "";
      if (!accessToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'access_token' is required." },
          400
        );
      }

      const plaidRes = await callPlaid("/accounts/get", {
        access_token: accessToken,
      });

      if (!plaidRes.ok) {
        logAction(action, plaidRes.status, plaidRes.data?.error_code);
        return jsonResponse(
          {
            error_type: plaidRes.data?.error_type,
            error_code: plaidRes.data?.error_code,
            error_message: plaidRes.data?.error_message,
            display_message: plaidRes.data?.display_message,
          },
          plaidRes.status
        );
      }

      logAction(action, 200);
      return jsonResponse({
        accounts: plaidRes.data?.accounts,
        item: plaidRes.data?.item,
      });
    }

    // ========================================================
    // ACTION: get_liabilities (debts: balances, APRs, minimums)
    // ========================================================
    if (action === "get_liabilities") {
      const accessToken = typeof body.access_token === "string" ? body.access_token : "";
      if (!accessToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'access_token' is required." },
          400
        );
      }

      const plaidRes = await callPlaid("/liabilities/get", {
        access_token: accessToken,
      });

      if (!plaidRes.ok) {
        logAction(action, plaidRes.status, plaidRes.data?.error_code);
        return jsonResponse(
          {
            error_type: plaidRes.data?.error_type,
            error_code: plaidRes.data?.error_code,
            error_message: plaidRes.data?.error_message,
            display_message: plaidRes.data?.display_message,
          },
          plaidRes.status
        );
      }

      logAction(action, 200);
      return jsonResponse({
        accounts: plaidRes.data?.accounts,
        liabilities: plaidRes.data?.liabilities,
      });
    }

    // ========================================================
    // ACTION: remove_item
    // ========================================================
    if (action === "remove_item") {
      const accessToken = typeof body.access_token === "string" ? body.access_token : "";
      if (!accessToken) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'access_token' is required." },
          400
        );
      }

      const plaidRes = await callPlaid("/item/remove", {
        access_token: accessToken,
      });

      if (!plaidRes.ok) {
        logAction(action, plaidRes.status, plaidRes.data?.error_code);
        return jsonResponse(
          {
            error_type: plaidRes.data?.error_type,
            error_code: plaidRes.data?.error_code,
            error_message: plaidRes.data?.error_message,
            display_message: plaidRes.data?.display_message,
          },
          plaidRes.status
        );
      }

      logAction(action, 200);
      return jsonResponse({ removed: true });
    }

    // ========================================================
    // ACTION: sandbox_create_public_token (Sandbox-only helper)
    // Refuses to run if PLAID_ENV == "production"
    // ========================================================
    if (action === "sandbox_create_public_token") {
      if (PLAID_ENV === "production") {
        logAction(action, 403);
        return jsonResponse(
          { error_code: "FORBIDDEN", error_message: "Sandbox helper is not permitted in production." },
          403
        );
      }

      const institutionId = typeof body.institution_id === "string" ? body.institution_id : "ins_109508";
      const initialProducts = Array.isArray(body.initial_products) ? body.initial_products : ["transactions"];

      const plaidRes = await callPlaid("/sandbox/public_token/create", {
        institution_id: institutionId,
        initial_products: initialProducts,
      });

      if (!plaidRes.ok) {
        logAction(action, plaidRes.status, plaidRes.data?.error_code);
        return jsonResponse(
          {
            error_type: plaidRes.data?.error_type,
            error_code: plaidRes.data?.error_code,
            error_message: plaidRes.data?.error_message,
            display_message: plaidRes.data?.display_message,
          },
          plaidRes.status
        );
      }

      logAction(action, 200);
      return jsonResponse({ public_token: plaidRes.data?.public_token });
    }

    // Unknown action
    logAction(action, 400);
    return jsonResponse(
      { error_code: "UNKNOWN_ACTION", error_message: `Action '${action}' is not supported.` },
      400
    );
  } catch {
    logAction(action || "unexpected", 500);
    return jsonResponse(
      { error_code: "INTERNAL_ERROR", error_message: "An internal error occurred." },
      500
    );
  }
});
