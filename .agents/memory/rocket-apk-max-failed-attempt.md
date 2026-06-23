---
name: Rocket.new APK Max Failed Attempt Reset
description: When isMaxApkBuildFailedAttempt=true, the build state must be reset via a dedicated endpoint before make-apk-build will work again.
---

## Rule

When `isMaxApkBuildFailedAttempt === true` in the APK status payload, calling `make-apk-build` directly will continue to fail. Must call a reset endpoint first.

**Why:** Rocket.new's build server tracks failed attempts internally. After N failures it sets this flag and blocks further builds until the state is explicitly cleared.

## Reset Endpoint (confirmed exists — returns 401 not 404)

```
POST https://application.rocket.new/web/v1/playground/reset-apk-build
Body: { threadId }
Auth: Bearer {token}, companyId header
```

Fallbacks (also return 401, exist on server):
- `/web/v1/playground/retry-apk-build`  
- `/web/v1/playground/apk-build-reset`

## How to Apply

In `triggerRocketApkBuild`, when `build.isMaxApkBuildFailedAttempt === true`:
1. Call `resetRocketApkBuild` first (tries all reset endpoints in order)
2. Then call `make-apk-build`
3. Show "Resetting…" in UI during the reset step

## Field Capture

`parseApkResponse` must read `payload.isMaxApkBuildFailedAttempt` and surface it on `ApkBuildState`.

## Build Log Endpoints (all return 401 = exist, NOT 404)

All 5 log endpoints confirmed to exist on `https://application.rocket.new`:
- `/web/v3/playground/apk-build-log`
- `/web/v1/playground/apk-build-log`
- `/web/v1/playground/apk-build-logs`
- `/web/v3/playground/apk-build-logs`
- `/web/v1/playground/build-logs`

**NONE of these appear in the official bundle URL constants** — they are undocumented.
They may return empty data if the build fails before producing output.
`fetchRocketApkBuildLog` tries multiple body formats (`{threadId}`, `{buildId, threadId}`, `{id}`) to maximize chances.
Polling: every 5s while `isBuilding`, one final fetch on complete/failed.
Auto-scroll: `logEndRef` scrollIntoView on new lines when terminal is expanded.

## Required Pre-Build Step: generateKeystore

**Fresh accounts fail to build APKs because no signing keystore is created.**
The `generateKeystore` endpoint on `back.rocket.new` is confirmed to exist (returns 401 w/o auth):
- `POST https://back.rocket.new/api/v1/chat-thread/generate-keystore`
- Headers: `Authorization: Bearer {token}`, `companyId`, `pageURL: "https://rocket.new"`
- Body: `{ threadId }` (tries multiple variants)
- Idempotent: returns 400/409 if keystore already exists (treat as success)
- Non-fatal: if all attempts fail, proceed with build anyway

`generateRocketKeystore()` is called first in `handleBuild` before reset/trigger steps.
UI shows "Generating keystore…" during this step.

## Bundle Analysis (June 2026)

Reverse-engineered from `assets.rocket.new/_next/static/chunks/*.js` (27 chunks).
Official APK URL constants are ONLY these 4 endpoints:
- `fetchDeployStatus`: `application.rocket.new/web/v1/playground/apk-build-status`
- `buildApplication`: `application.rocket.new/web/v1/playground/make-apk-build`
- `downloadApplication`: `application.rocket.new/web/v1/playground/download-apk`
- `generateKeystore`: `back.rocket.new/api/v1/chat-thread/generate-keystore`

`DEPLOY_PROGRESS` constants in bundle: `{IN_PROCESS:2, IN_QUEUE:1, COMPLETED:3, FAILED:4, IDLE:6, QUEUE_BUILD_REJECTED:5}` — matches `APK_STATUS` in our code.

## Other Confirmed APK Endpoints (all return 401 = exist, not 404)

All on `https://application.rocket.new`:
- `/web/v1/playground/apk-build-status` — check status
- `/web/v1/playground/make-apk-build` — trigger build  
- `/web/v1/playground/download-apk` — get download URL
- `/web/v1/playground/reset-apk-build` — reset failed state
- `/web/v1/playground/retry-apk-build` — alternate reset
- `/web/v1/playground/apk-build-reset` — alternate reset
- `/web/v1/playground/cancel-apk-build` — cancel
- `/web/v3/playground/apk-build-status` — v3 variant (same auth)
- `/web/v3/playground/make-apk-build` — v3 variant

`/apis/v1/playground/*` returns 404 — wrong path prefix.
