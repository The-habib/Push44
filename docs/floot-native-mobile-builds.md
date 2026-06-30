# Floot — Generate Native Mobile Apps

**Status:** Implemented & confirmed working (June 2026)

This document covers how Push44 triggers native Android APK builds for Floot workspaces, how the feature was reverse-engineered, what plan is required, and how each API endpoint works.

---

## What It Does

When a user selects a Floot app in Push44, a **"Generate Native App"** panel appears below the Publish panel. The user enters an Android bundle ID (e.g. `com.acme.myapp`), clicks the button, and Push44:

1. Saves the bundle ID to the workspace
2. Triggers a production deployment with `buildMobileApps: true`
3. Polls Floot's build-status endpoint every 10 seconds
4. Presents a pre-signed APK download link when the build completes

---

## Plan Requirement

| Plan | Native mobile builds |
|---|---|
| Free / Hobby | ❌ Not enabled — returns HTTP 404 `{"error":"Mobile builds not enabled"}` |
| 100k (ultra) | ✅ Fully available |

Push44 detects the plan gate automatically: if the status endpoint returns the "not enabled" error, the UI switches to an upgrade prompt that links to `https://floot.com/pricing`.

---

## How It Was Reverse-Engineered

Floot has no public API documentation for native builds. The implementation was discovered by:

1. **JS bundle analysis** — Inspecting `page-300d3c74bce6c28d.js` (1.1 MB) from `floot.com/_next/static/chunks/app/project/[id]/`. The bundle contains the full editor UI including the "Generate native mobile apps" toggle and all API call logic in minified form.

2. **PostHog feature flag** — The toggle is gated by the `mobile_builds` flag in PostHog (project key `phc_pBhUwXFcdDsS5GONl2UTUoR9vhdTBJfJ2Tcbp42L7NN`, host `cabubu.floot.com`). The flag was confirmed `true` for the test account via the `/decide` endpoint.

3. **Live API probing** — Every endpoint was called directly through the Push44 proxy (`/api/floot`) using a real session token and confirmed against actual server responses.

4. **Full endpoint inventory** — The page bundle exposed all `/_api/` route strings. The complete list includes 40+ endpoints; the mobile-build ones are:
   - `/_api/workspace/mobile-build-status`
   - `/_api/workspace/mobile-build-download-url`

---

## API Endpoints

All requests go through the Push44 proxy at `/api/floot` which converts the `X-Floot-Token` header into `Cookie: nextauth.session-token={token}`.

### 1 — Set Bundle ID

Saves the Android/iOS app identifier to the workspace.

```
POST /_api/workspace/update
Content-Type: application/json

{"json": {"id": "{workspaceId}", "name": "{appName}", "mobileAppId": "com.example.app"}}
```

**CRITICAL:** Body must be SuperJSON-encoded (`{"json": {...}}` wrapper). Plain JSON returns `400 Required`. The `name` field must always be included — omitting it resets the workspace name to `null`.

**Response:**
```json
{"json": {"name": "My App"}}
```

---

### 2 — Trigger Mobile Build

Queues both a web deploy and a native mobile build in one call.

```
POST /api/trpc/workspace.requestDeploy
Content-Type: application/json

{
  "type": "prodUpdate",
  "id": "{workspaceId}",
  "subdomain": "{slug}",
  "includeMadeWithFloot": true,
  "buildMobileApps": true
}
```

Use `"prod"` (not `"prodUpdate"`) for a workspace that has never been deployed.

**CRITICAL:** This is a raw tRPC body — no `{"json": {...}}` wrapper. Using the wrapper returns `400 "Workspace ID is required"`.

**Response:**
```json
{"result": {"data": "building"}}
```

For free-plan accounts the server silently overrides `buildMobileApps` to `false` — the response is still `"building"` but no mobile build is queued. The plan gate only becomes visible when polling the status endpoint.

---

### 3 — Poll Build Status

```
GET /_api/workspace/mobile-build-status?workspaceId={id}
```

**Response shapes:**

| Response | HTTP | Meaning |
|---|---|---|
| `{"type":"building"}` | 200 | APK is compiling — keep polling |
| `{"type":"completed","buildId":"...","completedAt":"..."}` | 200 | Build finished — get download URL |
| `{"type":"failed"}` | 200 | Build error |
| `{"error":"Mobile builds not enabled"}` | 404 | Free plan — upgrade required |

Push44 polls every 10 seconds with a maximum of 60 attempts (10-minute timeout).

---

### 4 — Get Download URL

```
GET /_api/workspace/mobile-build-download-url
  ?workspaceId={id}
  &buildId={buildId}
  &forAndroidApk=true
```

**Response:**
```json
{
  "success": true,
  "value": {
    "downloadUrl": "https://..."
  }
}
```

The URL is pre-signed and time-limited. It points to the compiled `.apk` file hosted on Floot's infrastructure.

---

## Bundle ID Format

Android bundle IDs follow the Java package naming convention:

- ✅ `com.example.myapp`
- ✅ `io.acme.product.v2`
- ❌ `myapp` (only one segment)
- ❌ `123.example.app` (segment starts with digit)
- ❌ `com.my-app.name` (hyphens not allowed)

Push44 validates with: `/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){1,}$/`

---

## UI Component States

`FlootMobileBuildPanel` (in `src/routes/push.lazy.tsx`) has 6 phases:

| Phase | What the user sees |
|---|---|
| `idle` | Bundle ID input + "Generate Native App" button |
| `setting` | "Setting bundle ID and queuing build…" spinner |
| `polling` | Animated progress bar + "Checking every 10s" note |
| `done` | Download APK button (or build ID if URL unavailable) |
| `upgrade` | Yellow "Floot 100k plan required" card + pricing link |
| `failed` | Red error card + retry button |

---

## Source Files

| File | Purpose |
|---|---|
| `src/lib/floot-api.ts` | All Floot API functions including 4 new mobile-build ones |
| `src/routes/push.lazy.tsx` | UI — `FlootMobileBuildPanel` component + state + handler |
| `src/api/floot.ts` | Proxy route that converts token header → cookie |

---

## Known Limitations

- **Android only** — `forAndroidApk=true` is the only confirmed parameter. iOS builds may be available via `forAndroidApk=false` but this was not tested (requires an Apple Developer account on the Floot side).
- **Ultra plan only** — There is no way to bypass the server-side plan check. The PostHog feature flag only gates the UI; the actual build queue check is a separate database lookup.
- **Requires an existing or new production deployment** — Triggering a mobile build also triggers a full web deploy. If the workspace has no subdomain, Push44 auto-generates one from the app name.
- **Build time** — First builds typically take 5–10 minutes on Floot's servers.

---

## Wrong Endpoints (Do NOT Use)

| Endpoint | Problem |
|---|---|
| `GET /_api/workspace/mobile-build` | 404 — does not exist |
| `POST /_api/workspace/trigger-job` with mobile job name | Wrong purpose — for user-defined runtime helpers only (requires `helperName` field) |
| `/_api/workspace/mobile-build-status` via POST | 405 — GET only |
| `requestDeploy` body with `{"json":{...}}` wrapper | 400 "Workspace ID is required" |
| `/_api/workspace/update` without `name` field | Resets workspace name to null |
