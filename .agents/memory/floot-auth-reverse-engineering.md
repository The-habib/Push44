---
name: Floot Authentication - Reverse Engineered
description: Confirmed Floot login flow from deep reverse engineering of floot.com JS bundles and live API probing
---

## Confirmed Facts (June 2026)

### Floot uses NextAuth.js at https://floot.com (NOT .co)

### Auth Providers (GET /api/auth/providers)
```json
{
  "email":  { "type": "email",  "signinUrl": "/api/auth/signin/email",    "callbackUrl": "/api/auth/callback/email" },
  "github": { "type": "oauth",  "signinUrl": "/api/auth/signin/github",   "callbackUrl": "/api/auth/callback/github" },
  "google": { "type": "oauth",  "signinUrl": "/api/auth/signin/google",   "callbackUrl": "/api/auth/callback/google" }
}
```

### Magic Link Flow (confirmed HTTP 200 working)
1. GET `https://floot.com/api/auth/csrf` → `{ csrfToken: "..." }`
2. POST `https://floot.com/api/auth/signin/email`
   - Content-Type: application/x-www-form-urlencoded
   - Body: `email={email}&csrfToken={token}&callbackUrl=https://floot.com&json=true`
   - Response: `{ url: "https://floot.com/api/auth/signin?csrf=true" }` (HTTP 200 = email sent)

### Session
- Cookie-based: `next-auth.session-token` cookie on floot.com
- GET `/api/auth/session` returns `{}` when unauthenticated, `{ user: { email, name }, expires }` when logged in
- DOES NOT return the raw token via API

### CORS
- `Access-Control-Allow-Origin: *` on auth endpoints
- No `Access-Control-Allow-Credentials: true` — cannot send cookies cross-origin

### No Public API
- All `/api/*` routes except NextAuth ones return 404
- No tRPC procedures discoverable from login page chunks
- No API subdomains (api.floot.com etc all return 525)
- `/api/projects` → 404 (the original guessed endpoint was WRONG)

### Token Strategy for Push44
- After magic link login, `next-auth.session-token` cookie = JWT signed by Floot's secret
- This JWT value, when given to Push44, is sent as `Authorization: Bearer <token>` 
- `/api/auth/session` with Bearer returns `{}` for fake tokens — real tokens may work
- Browser fetch cannot set Cookie header cross-origin (forbidden header)

### Why Bearer May Work
NextAuth with JWT strategy can be configured to accept the JWT as Bearer.
The session token cookie IS the JWT. If Floot's tRPC middleware uses `getToken()` which reads both cookies AND Authorization headers, then Bearer token auth works.

**Why:** Session is JWT-based (NextAuth default strategy), CORS allows *, token flow is the only viable option for client-side app without server proxy.

**How to apply:** Push44 sends token as `Authorization: Bearer {sessionToken}` in all Floot API calls.
