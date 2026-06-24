---
name: Floot Authentication - Reverse Engineered
description: Confirmed Floot login flow and API endpoints from deep reverse engineering of floot.com JS bundles and live API probing
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

### ✅ CONFIRMED WORKING: Project Listing API (June 2026)

**Endpoint:** `GET /_api/workspace/list`
- Cookie: `nextauth.session-token={token}` (via proxy)
- Returns:
```json
{
  "ownedWorkspaces": [{ "id": "{uuid}", "name": "...", "createdAt": "...", "iconUrl": "...", "sketchCss": "...", "userPrompt": "...", ... }],
  "sharedWorkspaces": [],
  "favoriteWorkspaces": [],
  "totalOwnedCount": 1,
  "totalSharedCount": 0
}
```
- `id` is the workspace UUID (= project ID)
- Endpoint discovered from `app/dashboard/page-b7cf7b768e773575.js` bundle chunk

**Other confirmed endpoints (no file export available):**
- `GET /_api/workspace/deployment?workspaceId={id}` → `{"type":"notDeployed"}` or deployment info
- `GET /_api/resources/list?workspaceId={id}` → `{"resources":[]}`
- `GET /_api/resources/create`, `/_api/resources/update`, `/_api/resources/delete`, `/_api/resources/check-duplicate`
- `GET /_api/folder/list`, `/_api/folder/create`, `/_api/folder/delete`, `/_api/folder/rename`
- `GET /_api/database/tables?workspaceId={id}`, `/_api/database/dump` (project-specific DB)
- `GET /_api/storage/listFolder?workspaceId={id}`, `/_api/storage/fileUrl?`, `/_api/storage/uploadUrl`
- `GET /_api/appsync-subscriber-token` — AppSync WebSocket for real-time collaboration
- `GET /_api/user-info` — returns current user info
- `GET /_api/workspace/mobile-build-status`, `/_api/workspace/mobile-build-download-url`

### ❌ File Source Code Export: NOT AVAILABLE via REST

Floot's generated code files are accessed via **AppSync WebSocket** (real-time editor), NOT REST.
- No `/export`, `/download`, or `/files` endpoint exists
- `sketchCss` in workspace response is just the CSS variables, not full source
- File export cannot be implemented until Floot adds an export endpoint

**Why:** Floot is a web-based real-time IDE. Code state is stored in AppSync subscriptions, not in REST-accessible files. The editor streams code changes via `/_api/appsync-subscriber-token` WebSocket.

### Proxy Solution (IMPLEMENTED in vite.config.ts)

Added a Vite middleware plugin (`flootProxyPlugin`) that:
- Intercepts all `/proxy/floot/*` requests from the browser
- Extracts token from `X-Floot-Token` request header
- Forwards request to `https://floot.com{rest_of_path}` with `Cookie: nextauth.session-token={token}; next-auth.session-token={token}` (both sent for robustness; `nextauth.session-token` is the real one)
- Returns the response to the browser
- Available in both `configureServer` (dev) and `configurePreviewServer` (preview)
- **ONLY available in Replit dev environment — NOT on push-44.vercel.app**

### Correct UX (implemented in FlootModal / settings.tsx)
1. "Open Floot Login" button → opens `https://floot.com/login` in a new tab
2. User logs in on Floot's own site (magic link works there, same origin)
3. Step-by-step DevTools instructions: F12 → Application → Cookies → floot.com → copy `nextauth.session-token` (NO hyphen)
4. User pastes token into Push44
5. Push44 validates via `/proxy/floot/api/auth/session` (server-side cookie)

**Why:** DB-strategy token (UUID), CORS blocks credentials, same-origin CSRF protection blocks cross-origin auth.

**How to apply:** Never call Floot API directly from browser. Always use `/proxy/floot/...` proxy path. The proxy plugin adds the Cookie header server-side where it's allowed.

### RSC Architecture Notes
- `/dashboard` RSC (no locale prefix) authenticates correctly and loads dashboard layout
- Project page is a `ClientPageRoot` wrapper — project data loads client-side, NOT in RSC stream
- Correct dashboard URL is `/dashboard` (not `/en/dashboard`) — the `/en/` prefix causes a server-side redirect
