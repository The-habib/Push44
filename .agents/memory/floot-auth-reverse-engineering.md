---
name: Floot Authentication - Reverse Engineered
description: Confirmed Floot login flow, API endpoints, and definitive file-access limitation from deep reverse engineering
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
- `GET /_api/workspace/runtime-schedules?workspaceId={id}` → scheduled jobs
- `GET /_api/workspace/floot-ai-credits?workspaceId={id}` → AI credit usage
- `GET /_api/workspace/canonical-domain?workspaceId={id}` → custom domain info
- `GET /_api/appsync-subscriber-token` — AppSync WebSocket JWT for real-time collaboration
- Full list of 45 `/_api/` endpoints confirmed by page.js bundle analysis — NONE expose file content

### ❌ FILE SOURCE CODE EXPORT: DEFINITIVELY NOT AVAILABLE (June 2026)

After exhaustive reverse engineering (2+ sessions, 3MB+ of JS analyzed), confirmed:

**Floot's architecture for file content:**
- Files live ONLY in browser-side React context state (module 34910 exports `{updateFS, K}`)
- The `K` context provides `{getAllFiles, getContent, updateFS, subscribe, get, update}`
- This state is populated EXCLUSIVELY via AppSync Events WebSocket subscription
- AppSync channel: `/publish/workspace/{id}`
- AppSync token: `/_api/appsync-subscriber-token` → JWT

**Why AppSync can't be used server-side:**
- WebSocket always returns `connection_error: "Required headers are missing"` (errorCode 400)
- Tried: base64url/standard base64, Bearer prefix, Origin header, multiple host values
- Lambda authorizer likely validates the Origin or other browser-only headers
- No workaround found after extensive testing

**Why there's no REST fallback:**
- `updateFS({upserts:{...}, withSync:false})` saves without AppSync but this goes through client-side React context — no HTTP endpoint found
- All 45 `/_api/` endpoints probed — none return file content
- No `/export`, `/download`, `/files`, `/snapshot`, `/code`, `/source`, `/zip` endpoint exists

**Result in Push44:** `fetchFlootAppFiles` throws `FLOOT_NO_API:{appId}:{appName}` tagged error.
`push.tsx` catches this and shows a blue "Open in Floot" card with link to `https://floot.com/project/{id}` and step-by-step instructions for the manual ZIP/GitHub-sync workflow.

**Future path:** If Floot adds a REST export API or makes AppSync accessible from non-browser contexts, re-implement `fetchFlootAppFiles` with real file fetching.

### Proxy Solution (IMPLEMENTED in vite.config.ts)

Added a Vite middleware plugin (`flootProxyPlugin`) that:
- Intercepts all `/proxy/floot/*` requests from the browser
- Extracts token from `X-Floot-Token` request header
- Forwards request to `https://floot.com{rest_of_path}` with `Cookie: nextauth.session-token={token}; next-auth.session-token={token}` (both sent for robustness; `nextauth.session-token` is the real one)
- Returns the response to the browser
- Available in both `configureServer` (dev) and `configurePreviewServer` (preview)
- **ONLY available in Replit dev environment — NOT on push44.vercel.app**

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
