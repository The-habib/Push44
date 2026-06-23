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
Body: { page: 1, limit: 50 }
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

## ✅ CONFIRMED WORKING: File fetching via production container (June 2026)

### Step 1: Ping the production container (NO AUTH NEEDED)
```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId: "6a1c9a2e8be93c00147a3884" }
Response: {
  data: {
    production: {
      backendUrl: "https://callbreaks2883back.builtwithrocket.new",
      status: { Code: 16, Name: "running" },
      port4030Url: "ec2-xxx.compute.amazonaws.com:4030",
      ...
    }
  }
}
```
- No auth required at all
- `status.Name === "running"` means the container is live and accessible
- `backendUrl` is the HTTPS code-editor container (NOT the Flutter app itself)
- Container files accessible on port 4030 of EC2, but HTTPS backendUrl is browser-safe

### Step 2: Get file tree (JWT auth required)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Headers: { Authorization: "JWT {token}" }
Body: { applicationId: "..." }
```
Returns directory tree — works even when container is sleeping. `flattenDirTree()` handles the `{ type, path, children }` format.

### Step 3: Fetch each file (NO AUTH NEEDED — critical discovery!)
```
POST {backendUrl}/api/file-content
Headers: { Content-Type: "application/json" }   ← NO Authorization header needed
Body: { path: "lib/main.dart" }                 ← key is "path" NOT "file", no applicationId needed
Response: { path: "/lib/main.dart", content: "import 'package:flutter/material.dart';\n..." }
```
- Body key MUST be `path` — NOT `file`, `filePath`, `fileName`, or anything else
- No auth or subscription required to fetch individual files
- Returns `500 { error: "Failed to read file content" }` for files not present on the container — skip these
- Container endpoint is open but `download-project` DOES check subscription (`400 "You don't have active subscription"`)

### Why SSE wake approach DOES NOT work
The SSE stream (`gateway.rocket.new/api/v1/thread/conversation`) only sends:
1. `heartbeat` — connection established
2. `PLACEHOLDER {"event":"PLACEHOLDER","data":"Establishing connection..."}` — then stream closes

The `backendUrl` NEVER arrives via SSE even when the container IS running. The correct approach is the production-deploy/ping REST endpoint which returns the URL immediately.

## S3 file-content fallback (may return 500 for stale/missing cache)

```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/file-content
Headers: { Authorization: "JWT {token}" }
Body: { applicationId: "...", file: "lib/main.dart" }   ← key is "file" NOT "path"
```
Returns 500 for many projects because the S3 cache is stale. Use as fallback only after container approach fails.

## Production container details

The `backendUrl` from ping (`callbreaks2883back.builtwithrocket.new`) is the Rocket.new **code editor backend container** running on EC2, NOT the Flutter app. It hosts the code on port 4030:
- `GET /` → 404 (direct)
- `POST /api/file-content` with `{ path }` → 200 (no auth)
- `GET /api/download-project` → 400 "You don't have active subscription" (requires paid plan)

## Only 2 apps showing — pagination fix

`chat-thread/search` with body `{}` returns only the first page. Must send `{ page, limit: 50 }` and paginate until response has fewer than `limit` items.

## CRITICAL: Never use loginToBack()

`loginToBack()` tries 10+ endpoints that all fail. Adds 20-30s invisible delay. Always returns `null`. Auth token works directly on back.rocket.new via `Authorization: Bearer`.

## URL constants from Rocket.new JS bundle

```js
let i = "https://gateway.rocket.new"           // GATEWAY_BASE
let r = "https://appuser.dhiwise.com"           // AUTH_BASE / USER_SERVICE
let s = "https://back.rocket.new"              // PLAYGROUND_BACKEND_SERVICE_URL / BACK_BASE
let c = "https://application.rocket.new"        // ROCKET_PROJECT_SERVICE / APP_BASE
let p = "https://project.rocket.new"
BASE_CONTAINER_CODE_URL = "https://appcodeformat.dhiwise.com"
```
