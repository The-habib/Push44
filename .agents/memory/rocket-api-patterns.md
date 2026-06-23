---
name: Rocket.new API Patterns
description: Confirmed working endpoints, auth patterns, and critical gotchas for Rocket.new integration
---

## Base URLs (from Rocket.new JS bundle chunk 0na6fda2v8.fm.js)

| Constant | Value |
|---|---|
| `AUTH_BASE` | `https://appuser.dhiwise.com` |
| `BACK_BASE` | `https://back.rocket.new` |
| `GATEWAY_BASE` | `https://gateway.rocket.new` |
| `APP_BASE` | `https://application.rocket.new` |
| `APP_CODE_BASE` | `https://appcodeformat.dhiwise.com` |
| `PROJECT_BASE` | `https://project.rocket.new` |

## Encryption — AES-256-CBC

Many responses from Rocket.new APIs are AES-256-CBC encrypted. Shape:
```json
{ "requestAnchor": "<base64 IV>", "processedContent": "<base64 ciphertext>" }
```
Key (hardcoded in bundle): `dqf8SIWZdQtptMTEH45CHo4A0DJLrkq02y80wmirLYo` (base64, 32 bytes)
Always run all responses through `rocketDecrypt()` before reading fields.

## companyId is required for ALL back.rocket.new calls

`POST /api/v1/chat-thread/search` WITHOUT `companyId` header returns `context:"general"` — empty list.
WITH `companyId` header returns real projects. Pass as plain HTTP header `companyId: "..."`.

**Resolution order:**
1. OTP login response: `d.data.user.companyId` (NOT `d.data.companyId`)
2. JWT claims: `claims.companyId` (often missing)
3. `GET ${AUTH_BASE}/web/v1/workspace/list` with `Authorization: JWT {token}` → `{ data: { list: [{ companyId }] } }`

**Why:** Rocket.new is multi-workspace. Without workspace context the search returns a "general" context with no results.

## APK Build DEPLOY_PROGRESS enum (from bundle chunk 0p~gd92karc24.js)

These are **numeric** values, NOT strings:
```
IN_QUEUE: 1, IN_PROCESS: 2, COMPLETED: 3, FAILED: 4, QUEUE_BUILD_REJECTED: 5, IDLE: 6
```

Progress calculation:
- `IN_QUEUE` → 5%
- `IN_PROCESS` → derived from `updatedAt` over 6-minute window: `(now - updatedAt) / (updatedAt + 6min - updatedAt) * 95`, max 95%
- `COMPLETED` → 100%
Poll every 5 seconds when IN_QUEUE or IN_PROCESS.

## ✅ CONFIRMED WORKING: APK Build (June 2026)

All three endpoints on `APP_BASE`. Auth: `Bearer {token}` (NOT JWT), `companyId` header, `pageURL: https://rocket.new`.
`threadId` = `_id` from chat-thread/search (NOT applicationId).

### Check build status
```
POST https://application.rocket.new/web/v1/playground/apk-build-status
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: { threadId: "..." }
Response: { code: "OK", data: { status: 1|2|3|4|5|6, updatedAt: "...", errorMessage?: "..." } }
```

### Trigger APK build
```
POST https://application.rocket.new/web/v1/playground/make-apk-build
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: { threadId: "..." }
Response: same shape as apk-build-status
```

### Download APK (when status === 3 / COMPLETED)
```
POST https://application.rocket.new/web/v1/playground/download-apk
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: { threadId: "..." }
Response: { code: "OK", data: { url: "https://..." } }  ← open this URL directly
```

### Generate keystore (SHA-1, optional)
```
POST https://back.rocket.new/api/v1/chat-thread/generate-keystore
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: { threadId: "..." }
```

## ✅ CONFIRMED WORKING: Authentication (OTP flow)

```
1. POST https://appuser.dhiwise.com/auth/v3/rocket/send-otp
   Body: { email }
   → triggers OTP email, returns nothing useful

2. POST https://appuser.dhiwise.com/auth/v3/rocket/verify-email-otp
   Body: { email, otp }
   → { data: { token: "eyJ...", user: { companyId, fullName, ... } } }
```
Token is a JWT. `companyId` from `data.user.companyId`. Response may be AES-256-CBC encrypted.

## ✅ CONFIRMED WORKING: App listing

```
POST https://back.rocket.new/api/v1/chat-thread/search
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: { page: 1, limit: 50 }
Response: { data: { list: [{ _id, displayName, threadDetails: { applicationId, name, languageType } }] } }
```
Paginate until response has fewer than `limit` items. `_id` is the thread ID (used for APK build). `threadDetails.applicationId` is the application ID (used for file fetching).

## ✅ CONFIRMED WORKING: File fetching (3-step, June 2026)

### Step 1: Ping production container (NO AUTH)
```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId: "..." }
Response: { data: { production: { backendUrl: "https://xxx.builtwithrocket.new", status: { Name: "running" } } } }
```
No auth required. `status.Name === "running"` → container live. If not running → show sleeping UI.

### Step 2: Get file tree (JWT auth)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Headers: { Authorization: "JWT {token}" }
Body: { applicationId: "..." }
```
Returns directory tree. Works even when container is sleeping. File paths have leading slash — strip before use.

### Step 3: Fetch each file (NO AUTH — open endpoint!)
```
POST {backendUrl}/api/file-content
Headers: { Content-Type: "application/json" }   ← NO Authorization header
Body: { path: "lib/main.dart" }                 ← key MUST be "path" (not "file", "filePath", etc.)
Response: { path: "/lib/main.dart", content: "..." }
```
Returns `500 { error: "Failed to read file content" }` for missing files — skip. Fetch in parallel batches of 20.

### S3 fallback only (often broken)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/file-content
Headers: { Authorization: "JWT {token}" }
Body: { applicationId: "...", file: "lib/main.dart" }   ← key is "file" here (NOT "path")
```
Returns 500 for many projects (stale S3 cache). Use only when container approach fails entirely.

## CRITICAL: Never call loginToBack()

`loginToBack()` tries 10+ endpoints that all fail. Adds 20-30s invisible delay. Always returns `null`.
Auth token works directly on back.rocket.new via `Authorization: Bearer`.

## CRITICAL: Never use SSE endpoint for file fetching

SSE stream at `gateway.rocket.new/api/v1/thread/conversation` only sends `heartbeat` then `PLACEHOLDER`.
`backendUrl` NEVER arrives via SSE even when the container IS running.
Correct approach: `production-deploy/ping` REST endpoint.

## CRITICAL: Auth header format differs by server

| Server | Auth format |
|---|---|
| `appuser.dhiwise.com` | `Authorization: JWT {token}` |
| `back.rocket.new` | `Authorization: Bearer {token}` |
| `application.rocket.new` | `Authorization: Bearer {token}` |
| `appcodeformat.dhiwise.com` | `Authorization: JWT {token}` |
| `{backendUrl}/api/file-content` | NO auth header needed |

## Wrong endpoints — do NOT use

- ❌ `GET {backendUrl}/api/download-project` → 400 "You don't have active subscription"
- ❌ `{ file: "..." }` body key on `{backendUrl}/api/file-content` → 422
- ❌ Any `back.rocket.new` call without `companyId` header → returns empty list
- ❌ SSE stream at `gateway.rocket.new/api/v1/thread/conversation` for backendUrl → never delivers
- ❌ `GET` instead of `POST` on `production-deploy/ping` → method not allowed
