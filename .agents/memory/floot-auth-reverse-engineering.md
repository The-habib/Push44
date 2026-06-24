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

### Session Token — CRITICAL: Database Strategy (UUID), NOT JWT

The `next-auth.session-token` cookie value is a **UUID** (e.g. `497f0bb7-e8df-432f-aa00-033357cc1540`), NOT a JWT.
- This is NextAuth **database strategy** — the UUID maps to a session row in Floot's DB
- Tokens expire (typically 30 days)
- `Authorization: Bearer {uuid}` NEVER works — NextAuth DB strategy ignores Bearer headers
- The ONLY way to validate cross-origin is via a server-side proxy that sets the Cookie header

### Session Validation
- GET `/api/auth/session` with `Cookie: nextauth.session-token={token}` → `{ user: { email, name }, expires }` if valid
- Returns `{}` (2 bytes) if token is expired or invalid
- Browser fetch cannot set Cookie headers (forbidden header) — MUST use server-side proxy
- **CRITICAL**: Cookie name is `nextauth.session-token` (NO hyphen between "next" and "auth"). Using `next-auth.session-token` always returns `{}` even with a valid token. Confirmed by live testing 2026-06-25.

### CORS
- `Access-Control-Allow-Origin: *` on auth endpoints
- No `Access-Control-Allow-Credentials: true` — cannot send cookies cross-origin from browser

### No Public REST API
- All `/api/*` routes except NextAuth ones return 404
- No tRPC procedures discoverable (Floot is fully RSC — server-side rendering)
- No API subdomains (api.floot.com, app.floot.com, backend.floot.com all return 525)
- `/api/projects` → 404 HTML

### Floot App Architecture
- **Fully RSC (React Server Components)** with Next.js App Router + OpenNext on CloudFront/Lambda
- Routes use locale prefix: `/[lng]/dashboard`, `/[lng]/login`, etc. (e.g. `/en/dashboard`)
- RSC endpoint: GET `/en/dashboard` with header `RSC: 1` → returns RSC stream format
- RSC stream format: numbered lines `{n}:{json_or_component_ref}`
- When authenticated, dashboard RSC contains project data embedded in component props
- When expired, returns "Project Not Found" / redirects to `/en/login`

### Proxy Solution (IMPLEMENTED in vite.config.ts)

Added a Vite middleware plugin (`flootProxyPlugin`) that:
- Intercepts all `/proxy/floot/*` requests from the browser
- Extracts token from `X-Floot-Token` request header
- Forwards request to `https://floot.com{rest_of_path}` with `Cookie: nextauth.session-token={token}; next-auth.session-token={token}` (both sent for robustness; `nextauth.session-token` is the real one)
- Returns the response to the browser
- Available in both `configureServer` (dev) and `configurePreviewServer` (preview)

`src/lib/floot-api.ts` updated to use `/proxy/floot/...` URLs.

### Project Listing — Status: Needs Fresh Token to Map RSC Structure

The RSC dashboard response embeds project data in component props when authenticated.
The exact RSC data structure for the authenticated project list is UNKNOWN (need a valid, unexpired token to observe it).

Multi-strategy approach implemented in `listFlootApps`:
1. Try JSON endpoints: `/api/projects`, `/api/workspaces`, tRPC variants
2. Parse RSC stream from `/en/dashboard` with regex extraction
3. Fail with clear "token expired" guidance

### File Fetching — Status: Endpoint Unknown

No file export endpoint discovered. `fetchFlootAppFiles` tries common patterns and RSC parsing.
Will need a valid token + actual project to reverse-engineer the correct endpoint.

### CRITICAL: Magic link trigger DOES NOT work cross-origin

`__Host-next-auth.csrf-token` cookie has `HttpOnly; Secure; SameSite=Lax`.
- Browser cannot send/receive this cookie cross-origin
- POST `/api/auth/signin/email` fails CSRF check → looks like success but no email is sent

### Correct UX (implemented in FlootModal)
1. "Open Floot Login" button → opens `https://floot.com/login` in a new tab
2. User logs in on Floot's own site (magic link works there, same origin)
3. Step-by-step DevTools instructions: F12 → Application → Cookies → floot.com → copy `nextauth.session-token` (NO hyphen)
4. User pastes token into Push44
5. Push44 validates via `/proxy/floot/api/auth/session` (server-side cookie)

**Why:** DB-strategy token (UUID), CORS blocks credentials, same-origin CSRF protection blocks cross-origin auth.

**How to apply:** Never call Floot API directly from browser. Always use `/proxy/floot/...` proxy path. The proxy plugin adds the Cookie header server-side where it's allowed.
