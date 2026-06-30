---
name: Push44 Platform Feature Split
description: Which post-push extra features belong to which platform — Floot gets Publish + Native Mobile Build, Rocket gets Build APK.
---

# Push44 Platform Feature Split

## Rule
- **Floot** → "Publish to Floot" (web deploy via `FlootPublishPanel`) + "Generate Native App" (Android APK via `FlootMobileBuildPanel`)
- **Rocket.new** → "Build APK" (Flutter APK compile via APK build panel)

Never add Rocket-style APK UI to Floot; never add Floot-style web Publish UI to Rocket.
Floot now has TWO post-select features: web publish AND native mobile build.

**Why:** Floot's `requestDeploy` API accepts `buildMobileApps:true` to queue a native Android APK build server-side. Rocket.new directly compiles Flutter apps with a dedicated APK builder.

## Floot Publish Implementation

### API functions in src/lib/floot-api.ts
- `getFlootDeploymentStatus` — GET `/_api/workspace/deployment?workspaceId=...`
- `triggerFlootDeploy` — POST `workspace.requestDeploy` tRPC (raw body, no `{"json":...}` wrapper)

### tRPC body format (CRITICAL)
Raw object — NO `{"json":...}` wrapper:
```json
{ "type": "prod", "id": "workspaceId", "subdomain": "slug", "includeMadeWithFloot": true, "buildMobileApps": false }
```
Use `"prodUpdate"` for republish of already-deployed workspace.

## Floot Native Mobile Build (June 2026)

### Plan Gate
- Requires Floot 100k (ultra) plan server-side — free accounts get HTTP 404 `{"error":"Mobile builds not enabled"}`
- PostHog feature flag `mobile_builds` controls UI visibility only (client-side gate)
- `getFlootMobileBuildStatus` returns `{type:"notEnabled"}` for free accounts → show upgrade prompt

### API functions in src/lib/floot-api.ts
- `setFlootMobileAppId({ token, workspaceId, mobileAppId, name })` — POST `/_api/workspace/update` with **SuperJSON body** `{"json":{...}}` (must include `name` or it resets)
- `triggerFlootMobileBuild({ token, workspaceId, subdomain, isUpdate? })` — POST `workspace.requestDeploy` with `buildMobileApps:true`
- `getFlootMobileBuildStatus({ token, workspaceId })` — GET `/_api/workspace/mobile-build-status?workspaceId=...`
- `getFlootMobileDownloadUrl({ token, workspaceId, buildId, forAndroid? })` — GET `/_api/workspace/mobile-build-download-url?workspaceId=...&buildId=...&forAndroidApk=true`

### Status Poll Shapes
```json
{"type":"building"}
{"type":"completed","buildId":"...","completedAt":"..."}
{"type":"failed"}
{"error":"Mobile builds not enabled"}  ← HTTP 404, free plan
```

### UI Component
`FlootMobileBuildPanel` — shown below `FlootPublishPanel` whenever a Floot app is selected.
Phases: idle → setting → polling → done / failed / upgrade
- Bundle ID validated with `/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){1,}$/`
- Polling: every 10s, max 60 attempts (10 min timeout)
- Upgrade prompt links to `https://floot.com/pricing`

### workspace/update SuperJSON format (CRITICAL)
```json
POST /_api/workspace/update
Body: {"json": {"id":"...", "name":"...", "mobileAppId":"com.example.app"}}
```
Must always include `name` — omitting it resets the workspace name to null.
