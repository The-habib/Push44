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

### CRITICAL: Magic link trigger DOES NOT work cross-origin

`__Host-next-auth.csrf-token` cookie has `HttpOnly; Secure; SameSite=Lax`.
- Browser cannot send/receive this cookie cross-origin (CORS `*` blocks credentials)
- GET `/api/auth/csrf` returns the token but cookie never stores in browser for floot.com
- POST `/api/auth/signin/email` fails CSRF check → returns `{"url":"...?csrf=true"}` HTTP 200 (looks like success, but is actually a CSRF error)
- **Result: No email is ever sent.** Confirmed by live user testing.

### Correct UX (implemented in FlootModal)
1. "Open Floot Login" button → opens `https://floot.com/login` in a new tab
2. User logs in on Floot's own site (magic link works there, same origin)
3. Step-by-step DevTools instructions: F12 → Application → Cookies → floot.com → copy `next-auth.session-token`
4. User pastes token into Push44

**Why:** Session is JWT-based (NextAuth default strategy), CORS allows * (no credentials), same-origin CSRF protection blocks all cross-origin auth triggers.

**How to apply:** Never try to trigger Floot auth from Push44's browser context. Always send user to floot.com directly. Push44 sends session token as `Authorization: Bearer {sessionToken}` in all Floot API calls.
