# Zite (build.fillout.com) — API Reverse-Engineering Notes

> Reverse-engineered from the live Next.js client bundles at `build.fillout.com`
> (2026-08) plus authenticated probing of `server.zite.com` with a user-owned
> session. Zite is the app-builder product built on Fillout's infrastructure.

## Surface summary

| Item | Value |
|---|---|
| Web origin | `https://build.fillout.com` (307 → `/home`) |
| API backend | `https://server.zite.com` |
| Login | `POST /login/password` `{email, password}` → `{redirectPath: "/home"}` |
| Session | `connect.sid` cookie (HttpOnly, 14d) |
| CSRF | `fillout-csrf-token` cookie (JWT, signed with session id, 1y) — sent on `admin/*` writes |
| Client stack | Next.js (`/_next/static/chunks/*`, 59 chunks, ~13 MB) |
| Maintenance flag | `GET /health/maintenance` → `{maintenanceMode: bool}`; 503s carry `x-fillout-maintenance: true` |

**Error vocabulary:** login failures differentiate `"User not found"` (unknown
email + empty pw path) vs `"Incorrect email or password"` (real auth failure).
Unknown paths → 404. During maintenance, all `/admin/*` → 503.

## Auth flow (as used by Push44 `zite-api.ts`)

1. `POST /login/password` returns `set-cookie: connect.sid` + `fillout-csrf-token`.
2. Authenticated calls forward `Cookie: connect.sid=...; fillout-csrf-token=...`
   plus `Origin: https://build.fillout.com` and `Referer` — the backend checks origin.
3. Profile check: `GET /admin/profile`.

## Admin API inventory (from client bundles)

### Zite apps
| Endpoint | Method | Purpose |
|---|---|---|
| `/admin/zite/apps` | GET | List flows for the account |
| `/admin/zite/apps/{publicIdentifier}` | GET | App detail: `ziteSnapshot.template.files` (full source map), `flow.id` (numeric) |
| `/admin/zite/apps/{publicIdentifier}/actions` | GET | Action list; `actions[0].conversationId` |
| `/admin/zite/apps/export/{publicIdentifier}?excludeMessageHistory=y` | GET | **Export / download app source** — returns a file; client saves blob using `Content-Disposition` filename |
| `/admin/zite/apps/ensure-project` | POST `{basePublicIdentifier, ensureConversation}` | Create/ensure project from a base |
| `/admin/zite/apps/import` | POST | Import app |
| `/admin/zite/apps/project` | GET | Project association lookup |
| `/admin/zite/apps/{id}/versioning/publish` | POST `{flowId}` | Rebuild + deploy Cloudflare Worker |
| `/admin/zite/apps/{pubId}/chat/saveAction` | POST | Persist file changes (`type:"user_change"`, `mode:"build"`, `changes.files[]`) |
| `/admin/zite/projects/{publicIdentifier}/full-export` | GET | **Export whole workspace** (client labels "Export workspace") |
| `/admin/zite/projects/{projectId}/last-app-brand-kit` | GET | Brand kit id for an app |

### Chat / agent control
| Endpoint | Purpose |
|---|---|
| `/admin/zite/chat/saveAction` | Persist a file change / agent action |
| `/admin/zite/chat/continue` | Resume conversation |
| `/admin/zite/chat/transcribe` | Speech → text |
| `/admin/zite/chat/rollback` | Roll back a change |
| `/admin/zite/chat/commitFileChanges` | Commit file edits |
| `/admin/zite/chat/abortInProgressAction` / `updateInProgressAction` / `midTurnMessage` / `deleteAction` / `removeActionAndCleanup` | Action lifecycle |
| `/admin/zite/chat/externalChanges?flowId=` | External change detection |
| `/admin/zite/chat/debugging/models`, `systemprompt?flowId=`, `tools?`, `getBootTraces?flowId=`, `getDebuggingDataForActionId?` | Debug internals (agent prompts/tools — interesting for prompt-injection analysis) |
| `/admin/zite/chat/vibeTest/batchMetrics`, `vibeTest/destroySandbox` | Vibe-testing infra |
| `/admin/zite/chat/improveMyApp` | Improvement loop |
| `/admin/zite/humanInLoop/execute-script/{id}` | POST `{script, serviceTypes, conversationId, sessionId}` — **agent script execution endpoint** |
| `/admin/zite/humanInLoop/read-workflow-logs/`, `script-visualization/` | Logs/visualization |

### Plans / usage / services
`/admin/zite/plans/`, `/admin/zite/resetUsage`, `/admin/zite/usageStats`, `/admin/zite/services/metadata`

### Non-Zite admin surface (Fillout core, partially relevant)
`/admin/profile`, `/admin/flows` (list), `/admin/flows/{id}`, `/admin/flows/settings/`,
`/admin/flows/export/{id}`, `/admin/flows/duplicate/{id}`, `/admin/flows/import`,
`/admin/flows/trash`, `/admin/flows/star`, `/admin/organizations`, `/admin/invite/link`,
`/admin/bases`, `/admin/assets`, `/admin/themes/create`, `/admin/services/*`, `/admin/fileupload`

## Public (no-session) endpoints
| Endpoint | Behavior |
|---|---|
| `/public/zite/auth/authorize?redirect_uri=&flow_id=` | OAuth-style authorize; 400 with "redirect_uri is required" / "flow_id is required". Used by form-auth/migration flows. **Requires valid flow ids — do not fuzz (enumeration).** |
| `/public/zite/project/{identifier}/loginBranding` | Returns branding config for a published app's login screen |
| `/public/zite/fileupload` | Public upload (vs `/admin/fileupload`) |
| `/public/flows/templates/?mode=` | Public templates; 400 "Mode is required" without `mode` |

## Maintenance-mode behavior (observed live)
- `GET /health/maintenance` → `{"maintenanceMode":true}` while down.
- All `/admin/*` → 503 `{"statusCode":503,"error":"Service Unavailable","message":"The editor is temporarily down for maintenance..."}` with header `x-fillout-maintenance: true`.
- Public endpoints (`/public/*`) continue to serve.
- Client checks the header and bounces to a maintenance page; server-side enforcement confirmed.

## Notes for Push44 integration
- **Code download:** `GET /admin/zite/apps/export/{publicIdentifier}?excludeMessageHistory=y`
  is the canonical "download my app source" endpoint (used by the in-app Export modal).
  Push44 currently reads source via the snapshot `ziteSnapshot.template.files` — the
  export endpoint is the more complete/direct path and worth wiring in.
- **Full workspace export:** `GET /admin/zite/projects/{publicIdentifier}/full-export`.
- **Publish:** `POST /admin/zite/apps/{id}/versioning/publish {flowId}` rebuilds the
  Cloudflare Worker (already used by `removeZiteBadge`).
- **Session expiry:** `connect.sid` is 14 days; `fillout-csrf-token` 1 year but
  cryptographically bound to the session id (`eyJ0eXBlIjoiY3NyZiIsInNpZCI6Ii9yUGREU...`).

> Status: static RE complete; live probing blocked by server-wide maintenance at
> the time of writing. When `maintenanceMode` flips false, re-run the admin
> endpoints with the user's session to verify app list + export shapes.
