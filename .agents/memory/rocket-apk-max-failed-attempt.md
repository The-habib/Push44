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
