import * as jose from "npm:jose@^5.9.6";

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

// In-memory Apple JWKS cache
const APPLE_JWKS = jose.createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

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
  const APPLE_TEAM_ID = Deno.env.get("APPLE_TEAM_ID") || "";
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
    // ACTION: revoke_apple (App Store Guideline 5.1.1(v))
    // ==========================================
    if (action === "revoke_apple") {
      const authCode = typeof body.authorization_code === "string" ? body.authorization_code : "";
      if (!authCode) {
        logAction(action, 400);
        return jsonResponse(
          { error_code: "MISSING_FIELD", error_message: "Field 'authorization_code' is required." },
          400
        );
      }

      if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
        logAction(action, 500);
        return jsonResponse(
          { error_code: "CONFIGURATION_ERROR", error_message: "Apple revocation credentials not configured." },
          500
        );
      }

      // Build Apple client secret ES256 JWT
      let clientSecret: string;
      try {
        const privateKey = await jose.importPKCS8(APPLE_PRIVATE_KEY, "ES256");
        clientSecret = await new jose.SignJWT({})
          .setProtectedHeader({ alg: "ES256", kid: APPLE_KEY_ID })
          .setIssuer(APPLE_TEAM_ID)
          .setIssuedAt()
          .setExpirationTime("5m")
          .setAudience("https://appleid.apple.com")
          .setSubject(APPLE_BUNDLE_ID)
          .sign(privateKey);
      } catch {
        logAction(action, 500);
        return jsonResponse(
          { error_code: "APPLE_KEY_ERROR", error_message: "Failed to sign Apple client secret." },
          500
        );
      }

      // 1. Exchange authorization code for refresh token
      const tokenParams = new URLSearchParams({
        client_id: APPLE_BUNDLE_ID,
        client_secret: clientSecret,
        code: authCode,
        grant_type: "authorization_code",
      });

      const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenParams.toString(),
      });

      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tokenData.refresh_token) {
        logAction(action, tokenRes.status, tokenData.error);
        return jsonResponse(
          {
            error_type: "APPLE_AUTH_ERROR",
            error_code: tokenData.error || "TOKEN_EXCHANGE_FAILED",
            error_message: tokenData.error_description || "Failed to exchange Apple authorization code.",
          },
          tokenRes.status >= 400 ? tokenRes.status : 400
        );
      }

      // 2. Immediately revoke the refresh token
      const revokeParams = new URLSearchParams({
        client_id: APPLE_BUNDLE_ID,
        client_secret: clientSecret,
        token: tokenData.refresh_token,
        token_type_hint: "refresh_token",
      });

      const revokeRes = await fetch("https://appleid.apple.com/auth/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: revokeParams.toString(),
      });

      if (!revokeRes.ok) {
        const revokeData = await revokeRes.json().catch(() => ({}));
        logAction(action, revokeRes.status, revokeData.error);
        return jsonResponse(
          {
            error_type: "APPLE_AUTH_ERROR",
            error_code: revokeData.error || "REVOCATION_FAILED",
            error_message: "Failed to revoke Apple token.",
          },
          revokeRes.status >= 400 ? revokeRes.status : 400
        );
      }

      logAction(action, 200);
      return jsonResponse({ revoked: true });
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
