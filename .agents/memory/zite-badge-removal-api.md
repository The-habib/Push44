---
name: Zite Badge Removal API
description: Confirmed working API flow to hide a.branding-pill from live *.zite.so sites via CSS injection
---

## The Flow (tested live 2026-07-05)

**Endpoint base**: `https://server.fillout.com` (same server as all other Zite API calls via the /api/zite proxy)

### 1. Get flowId + current index.css
`GET /admin/zite/apps/{publicIdentifier}`
- Returns `flow.id` (numeric flowId) and `ziteSnapshot.template.files["src/index.css"].content`
- Files are objects: `{ content: "..." }`, NOT bare strings

### 2. Get conversationId
`GET /admin/zite/apps/{publicIdentifier}/actions`
- Returns `{ actions: [{ conversationId, flowId, type, ... }], pagination, latestFlowWideActionId }`
- First action's `conversationId` is what you need

### 3. Persist CSS change
`POST /admin/zite/chat/saveAction`
```json
{
  "type": "user_change",
  "mode": "build",
  "content": "Hide Zite branding badge",
  "changes": {
    "files": [{ "type": "update", "filePath": "src/index.css", "content": "<full new CSS>" }]
  },
  "flowId": 2363145,
  "conversationId": "73b1e28e-..."
}
```
Returns 200 with saved action object.

### 4. Publish (rebuild Cloudflare Worker)
`POST /admin/zite/apps/versioning/publish`
```json
{ "flowId": 2363145 }
```
Creates new snapshot + rebuilds Cloudflare Worker. Compiled CSS at `/assets/index-<hash>.css` on live *.zite.so picks up the rule immediately.

## What DOESN'T Work
- `POST /admin/flows/saveSettings/{id}` with `{settings:{hideBranding:true}}` — saves but has zero effect on live site
- The Cloudflare Worker checks org plan tier/feature flags, not the `hideBranding` setting

## Badge Element
- CSS selector: `a.branding-pill`
- Worker always sets `window.__ziteBranding = true` (plan-gated); badge injected via JS after page load
- Rule injected at end of `src/index.css`: `a.branding-pill { display: none !important; }`
- Detection: check if `src/index.css` content includes `"branding-pill"`

## Other Discovered Endpoints
- `POST /admin/zite/chat/rebuild` — rebuilds sandbox container
- `POST /admin/zite/chat/rollback`
- `DELETE /admin/zite/chat/removeActionAndCleanup`
- `POST /admin/zite/humanInLoop/execute-script/`
- `GET /admin/zite/apps/{pubId}/actions` — full action history with pagination
- `GET /admin/zite/chat/debugging/systemprompt?flowId=` — system prompt debug
- `POST /admin/zite/apps/{pubId}/versioning/publish` — alternative publish path (not confirmed)

## improveMyApp Endpoint
`POST /admin/zite/chat/improveMyApp` (base URL = lK.UB = server.fillout.com)
Body: `{ flowId, type, sandboxUrl }` where type can be `"designer"`, `"user_message"`, etc.
Returns SSE stream. Not needed for badge removal but useful for AI-driven edits.

## addAndSaveAction
This is a Zustand store action (not an HTTP endpoint directly). It calls `saveAction` internally.
The store module is `e0.d` in the editor chunk.

## ZiteApp.applicationId
`listZiteApps()` now sets `applicationId = String(f.id)` (numeric flowId as string).
`removeZiteBadge()` derives flowId from `appData.flow.id` internally — no need to pass it from the caller.

**Why:** hideBranding only toggles a UI label; badge injection is plan-gated in the Cloudflare Worker. CSS injection survives deploys because Vite/Tailwind preserves non-@layer rules verbatim in the compiled output.

**How to apply:** Use `publicIdentifier` as `appId` in all API calls. `applicationId` on ZiteApp is the numeric flowId, useful if you ever need to pass it directly, but `removeZiteBadge` fetches it internally.
