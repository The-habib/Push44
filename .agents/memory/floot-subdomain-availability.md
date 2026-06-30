---
name: Floot Publish API
description: Confirmed working deploy flow for Floot — includeMadeWithFloot, status lifecycle, and why availability check was removed.
---

## Rule
Always send `includeMadeWithFloot: true` in `requestDeploy` body. `false` silently accepts the request but never starts a build — status stays `notDeployed` indefinitely.

**Why:** Floot's build pipeline treats `false` as "remove Floot logo" which is a paid feature gate. The API doesn't reject it (no error), it just queues nothing. `true` is required even on free accounts to actually trigger the build.

**How to apply:** `triggerFlootDeploy` in `src/lib/floot-api.ts` hardcodes `includeMadeWithFloot: true`. Do not change it to `false`.

---

## Status Lifecycle (confirmed by live testing)

`notDeployed` → `deploying` (status: `"building"`) → `deployed`

The research doc incorrectly claimed status stays `notDeployed` while building. It does not — it transitions to `deploying` within a few seconds of a successful trigger.

Poll `GET /_api/workspace/deployment?workspaceId={id}` every 10s. Build takes ~45s first time, ~30s for updates.

---

## No Subdomain Availability Endpoint

There is no tRPC or REST endpoint to check if a subdomain is available. `requestDeploy` itself returns success regardless of whether the subdomain is taken. Validate format client-side only: `/^[a-z0-9-]{3,}$/`. Never attempt a HEAD to `*.floot.app` from server environments — unreachable from Replit and Vercel.

---

## Deploy Type

- First deploy: `type: "prod"`
- Republish existing workspace: `type: "prodUpdate"`

Both use the same endpoint: `POST /api/trpc/workspace.requestDeploy` with raw body (no `{"json":...}` wrapper).
