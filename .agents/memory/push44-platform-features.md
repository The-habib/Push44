---
name: Push44 Platform Feature Split
description: Which post-push extra features belong to which platform — Floot gets Publish, Rocket gets Build APK.
---

# Push44 Platform Feature Split

## Rule
- **Floot** → "Publish to Floot" (web deploy via `FlootPublishPanel`)
- **Rocket.new** → "Build APK" (mobile compile via APK build panel)

Never cross these: no APK UI for Floot, no Publish UI for Rocket.

**Why:** The platforms have different post-push capabilities. Floot deploys web apps to `*.floot.app`; Rocket.new compiles Flutter APKs.

## Floot Publish Implementation (June 2026)

### Proxy added to vite.config.ts
- `flootCheckPlugin` — handles `GET /api/floot-check?subdomain=xxx` → `HEAD https://{subdomain}.floot.app` → returns `{ available: bool }` (404 = available, 200 = taken)
- Existing `flootProxyPlugin` already handles tRPC deploy calls: `POST /api/floot/api/trpc/workspace.requestDeploy` → `POST https://floot.com/api/trpc/workspace.requestDeploy`

### API functions in src/lib/floot-api.ts
- `getFlootDeploymentStatus({ data: { token, workspaceId } })` — GET `/_api/workspace/deployment?workspaceId=...` via existing proxy
- `triggerFlootDeploy({ data: { token, workspaceId, subdomain, isUpdate? } })` — POST `workspace.requestDeploy` tRPC (raw body, no `{"json":...}` wrapper)
- `checkFlootSubdomainAvailable(subdomain)` — GET `/api/floot-check?subdomain=...`

### UI in src/routes/push.lazy.tsx
- "Publish to Floot" button shown in files-ready bar when `platform === "floot"`
- `FlootPublishPanel` component handles all phases: checking → subdomain picker → deploying → polling → done/failed
- Panel appears standalone at step 1, and auto-opens in step 3 success state
- Polls `getFlootDeploymentStatus` every 10s during build (takes 2–5 min)
- Subdomain validated client-side: `/^[a-z0-9-]{3,}$/`, availability debounced 600ms

### tRPC body format (CRITICAL)
Raw object — NO `{"json":...}` wrapper:
```json
{ "type": "prod", "id": "workspaceId", "subdomain": "slug", "includeMadeWithFloot": false, "buildMobileApps": false }
```
Use `"prodUpdate"` for republish of already-deployed workspace.
