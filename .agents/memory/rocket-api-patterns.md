---
name: Rocket.new API Patterns
description: Confirmed working endpoints, auth patterns, and critical gotchas for Rocket.new integration
---

## Auth servers

- `AUTH_BASE = https://appuser.dhiwise.com` — user profile, workspace list
- `BACK_BASE  = https://back.rocket.new`   — chat threads, app data
- `APP_BASE   = https://application.rocket.new` — production deploy ping (no auth needed!)
- `APP_CODE_BASE = https://appcodeformat.dhiwise.com` — S3-backed file access (JWT auth needed)

## companyId is required for ALL back.rocket.new calls

`POST /api/v1/chat-thread/search` WITHOUT `companyId` header returns `context:"general"` — empty list.
WITH `companyId` header returns real projects. The companyId must be passed as a plain HTTP header `companyId: "..."`.

**How to resolve companyId:**
1. OTP login response: `d.data.user.companyId` (NOT `d.data.companyId`)
2. JWT claims: `claims.companyId` (often not present)
3. `GET ${AUTH_BASE}/web/v1/workspace/list` with JWT auth → `{ data: { list: [{ companyId: "..." }] } }` ← confirmed working

**Why:** Rocket.new is multi-workspace. Without workspace context the search returns a "general" context with no results.

## App listing — confirmed working pattern

```
POST https://back.rocket.new/api/v1/chat-thread/search
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: {}
Response: { data: { list: [{ _id, displayName, name, threadDetails: { applicationId, name } }] } }
```

## App object shape from chat-thread/search

```json
{
  "_id": "6a1c99e26581ee0014b82705",        ← use as thread ID / app ID
  "displayName": "CallbreakScoreKeeper",
  "name": "CallbreakScoreKeeper",
  "threadDetails": {
    "applicationId": "6a1c9a2e8be93c00147a3884",  ← use for file fetching
    "name": "CallbreakScoreKeeper",
    "languageType": "DART",
    "isCodeGenerated": true
  }
}
```

## File fetching — confirmed working (reverse-engineered from Rocket.new JS bundle)

### Step 1: Get file tree
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Headers: { Authorization: "JWT {token}" (or Bearer), Content-Type: application/json }
Body: { applicationId: "6a1c9a2e8be93c00147a3884" }
Response: directory tree (format TBD — handled by flattenDirTree())
```
Confirmed: returns 401 without auth, 200 with JWT token.

### Step 2: Get each file content
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/file-content
Headers: { Authorization: "JWT {token}" }
Body: { applicationId: "...", file: "lib/main.dart" }
Response: file content
```
Confirmed: returns 401 without auth, 200 with JWT token.

### Alternative: download ZIP (only when dev container is ACTIVE)
```
GET ${containerBackendUrl}/api/download-project?t={timestamp}
Headers: { Authorization: "JWT {token}" }
```
`containerBackendUrl` is obtained from the SSE gateway stream (see below). NOT accessible without the running container.

### Step 3 — SSE Gateway Container Wake (fallback when S3 file-content returns 500)

**CONFIRMED BUG:** S3 `file-content` returns 500 for every file on some projects even though `project-structure` returns 200. When this happens, must wake the dev container via SSE to fetch files directly.

```
POST https://gateway.rocket.new/api/v1/thread/conversation
Headers: {
  Authorization: "JWT {token}",   ← NOT Bearer
  companyId: "{companyId}",
  Content-Type: "application/json",
  pageURL: "https://rocket.new"
}
Body: { event: "CONTINUE_THREAD", data: { threadId: "{appId (= thread _id)}" }, sessionId: "{uuid}" }
```

SSE events:
- `heartbeat` — connection established
- `PLACEHOLDER` — "Starting server..." (container waking, stream will close, reconnect)
- `SERVER_STATUS_FOR_RESUME_CONTAINER` → `data.backendUrl` ← **this is the container URL**
- `SERVER_STATUS_FOR_THREAD_DETAILS` → also has `data.backendUrl`

**Why:** Stream closes after 1–2 events when container is sleeping; must reconnect every 4s for up to 50s. `companyId` header is required on the gateway call too. Auth must be `JWT` not `Bearer`.

**Key constraint:** `backendUrl` only exists when container is actively running. If fully terminated, stream stalls indefinitely with PLACEHOLDER. User must open project in Rocket.new first to wake it.

## Production deploy ping (no auth needed!)

```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId: "..." }
Response: { data: { production: { backendUrl, previewUrl, status, ... } } }
```
The `production.backendUrl` is the DEPLOYED app's backend (not the code editor container).
The production container may be terminated (`status.Name: "terminated"`) which causes 502 on file endpoints.

## Only 2 apps showing — pagination fix

`chat-thread/search` with body `{}` returns only the first page (2 apps). Must send `{ page, limit: 50 }` and paginate until response has fewer than `limit` items. The `fetchAllPages()` helper in `listRocketApps` handles this now.

**Why:** Rocket.new paginates the chat-thread list — the first page only returns ~2 threads. The old code broke after the first successful page.

## log() crash fix

Both `listRocketApps` and `fetchRocketAppFiles` had `log(label, val)` defined as `JSON.stringify(val).slice(0, N)`. `JSON.stringify(undefined)` returns JS `undefined` (not a string), so `.slice()` threw "Cannot read properties of undefined". Fix: always check `val !== undefined` before stringifying.

## CRITICAL: Never use loginToBack()

`loginToBack()` tries 10+ endpoints that all fail. It adds 20-30 seconds of invisible delay before app listing or file fetching starts. It always returns `null`. The auth token itself (`Bearer {token}`) works directly on back.rocket.new — no session exchange needed.

**Why:** loginToBack was attempting to exchange the dhiwise.com JWT for a back.rocket.new session token, but the back server accepts the JWT directly via `Authorization: Bearer`.

## URL constants from Rocket.new JS bundle

```js
let i = "https://gateway.rocket.new"           // GATEWAY_BASE
let r = "https://appuser.dhiwise.com"           // AUTH_BASE / USER_SERVICE
let s = "https://back.rocket.new"               // PLAYGROUND_BACKEND_SERVICE_URL / BACK_BASE
let c = "https://application.rocket.new"        // ROCKET_PROJECT_SERVICE / APP_BASE
let p = "https://project.rocket.new"
let g = "https://horizon-backend.rocket.new"
BASE_CONTAINER_CODE_URL = "https://appcodeformat.dhiwise.com"
```
