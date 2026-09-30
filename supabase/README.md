# Supabase Edge Function: Plaid Stateless Proxy

A stateless, zero-storage proxy between the **IMPROVE Money** iOS app and Plaid.

## Hard Rules & Security Guarantee
- **Zero data stored**: No database tables, no Supabase Auth users, no storage buckets, no KV, no caching (only in-memory Apple JWKS cache).
- **No sensitive logging**: Request bodies, response bodies, tokens, and transactions are never logged. Logs record only action name, HTTP status, and Plaid `error_code`.
- **Token safety**: Tokens travel strictly via JSON request/response bodies or the `Authorization: Bearer <session_token>` header, never in query parameters or URLs.

---

## 1. Secrets Configuration

Set the required secrets in Supabase using the CLI:

```bash
# 1. Plaid Secrets
npx supabase secrets set PLAID_CLIENT_ID="your_plaid_client_id"
npx supabase secrets set PLAID_SECRET="your_plaid_sandbox_or_production_secret"
npx supabase secrets set PLAID_ENV="sandbox" # or "production"
# Optional: redirect URI if configured in Plaid dashboard
npx supabase secrets set PLAID_REDIRECT_URI="https://improve-club.com/plaid-redirect"

# 2. Session Signing Key (Random 64-character / 64-byte key)
# Generate with: openssl rand -hex 32
npx supabase secrets set SESSION_SIGNING_KEY="your_random_64_byte_hex_string"

# 3. Sign in with Apple (Required for token verification and account deletion revocation)
npx supabase secrets set APPLE_BUNDLE_ID="com.improve.money"
npx supabase secrets set APPLE_TEAM_ID="your_apple_team_id"
npx supabase secrets set APPLE_KEY_ID="your_apple_key_id"

# APPLE_PRIVATE_KEY should be the exact content of your .p8 private key (PEM PKCS#8 format)
npx supabase secrets set APPLE_PRIVATE_KEY="$(cat AuthKey_XXXXXXXXXX.p8)"
```

---

## 2. Deploy Command

Deploy the Edge Function to your linked Supabase project:

```bash
# Link project (if not already linked)
npx supabase link --project-ref byltbwnzqhsgfftapqqp

# Deploy the plaid function (verify_jwt is disabled in supabase/config.toml)
npx supabase functions deploy plaid --no-verify-jwt
```

The function endpoint will be:
`https://byltbwnzqhsgfftapqqp.supabase.co/functions/v1/plaid`

---

## 3. Testing with `curl` (Sandbox Flow)

Set your base URL variable:
```bash
FUNCTION_URL="https://byltbwnzqhsgfftapqqp.supabase.co/functions/v1/plaid"
```

### Action 0A: Create Session from Apple Identity Token (iOS production flow)
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "session",
    "apple_identity_token": "YOUR_APPLE_IDENTITY_TOKEN"
  }'
```
Response:
```json
{
  "session_token": "eyJhbGciOi...",
  "expires_at": 1780000000
}
```

### Action 0B: Create Sandbox Session (Testing without an iPhone)
*Note: This helper only runs when `PLAID_ENV="sandbox"`. It returns 403 Forbidden in production.*

```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sandbox_session",
    "test_user_id": "test_user_local"
  }'
```

Save the session token from the response:
```bash
SESSION_TOKEN="<session_token_from_step_above>"
```

---

### Action 1: Create Link Token

#### A. New Item Mode
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "create_link_token"
  }'
```
Response:
```json
{
  "link_token": "link-sandbox-...",
  "expiration": "2026-09-30T17:30:00Z"
}
```

#### B. Update Mode (re-linking after ITEM_LOGIN_REQUIRED)
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "create_link_token",
    "access_token": "access-sandbox-..."
  }'
```

---

### Action 2: Sandbox Helper — Generate Public Token
*Generates a sandbox public token for institution "ins_109508" (First Platypus Bank) to test exchange and sync flows with curl without an iPhone.*

```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "sandbox_create_public_token",
    "institution_id": "ins_109508",
    "initial_products": ["transactions"]
  }'
```
Response:
```json
{
  "public_token": "public-sandbox-..."
}
```

---

### Action 3: Exchange Public Token for Access Token
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "exchange_public_token",
    "public_token": "<public_token_from_step_above>"
  }'
```
Response:
```json
{
  "access_token": "access-sandbox-...",
  "item_id": "item-..."
}
```

Save the access token:
```bash
ACCESS_TOKEN="<access_token_from_step_above>"
```

---

### Action 4: Sync Transactions
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "sync_transactions",
    "access_token": "'"$ACCESS_TOKEN"'"
  }'
```
Response:
```json
{
  "added": [...],
  "modified": [],
  "removed": [],
  "next_cursor": "cursor-...",
  "accounts": [...]
}
```

Subsequent sync with cursor:
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "sync_transactions",
    "access_token": "'"$ACCESS_TOKEN"'",
    "cursor": "cursor-..."
  }'
```

---

### Action 5: Get Accounts
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "get_accounts",
    "access_token": "'"$ACCESS_TOKEN"'"
  }'
```
Response:
```json
{
  "accounts": [...],
  "item": {...}
}
```

---

### Action 6: Remove Item
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "remove_item",
    "access_token": "'"$ACCESS_TOKEN"'"
  }'
```
Response:
```json
{
  "removed": true
}
```

---

### Action 7: Account Deletion (Apple Revocation - App Store Guideline 5.1.1(v))
```bash
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "action": "revoke_apple",
    "authorization_code": "c_apple_auth_code_from_ios_client"
  }'
```
Response:
```json
{
  "revoked": true
}
```

---

## Error Response Format
All errors return clean JSON with standard HTTP status:
```json
{
  "error_type": "INVALID_REQUEST",
  "error_code": "SESSION_INVALID",
  "error_message": "..."
}
```
Plaid errors (`ITEM_LOGIN_REQUIRED`, `INVALID_CREDENTIALS`, etc.) pass through with Plaid's HTTP status code and original error schema.
