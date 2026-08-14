# Floot — Full API Surface (Reverse-Engineered)

> Companion to `docs/floot-native-mobile-builds.md`. Extracted from
> `floot.com/_next/static/chunks/app/project/[id]/page-300d3c74bce6c28d.js`
> (1.18 MB editor bundle) plus the homepage chunks (2026-08).

## Surface summary

| Item | Value |
|---|---|
| Web origin | `https://floot.com` |
| Auth | NextAuth session cookie: `nextauth.session-token` (also mirrors `next-auth.session-token`) |
| Client | Next.js App Router (`/_next/static/chunks/app/project/[id]/...`) |
| Editor bundle | `page-300d3c74bce6c28d.js` — loads only for authenticated project sessions |
| Feature flags | PostHog, project key `phc_pBhUwXFcdDsS5GONl2UTUoR9vhdTBJfJ2Tcbp42L7NN`, host `cabubu.floot.com`, `/decide` |
| Body encoding | Two kinds: plain `JSON.stringify` and **SuperJSON** (`sy.Ay.stringify`) for datetimes/bigints; tRPC uses `{json: {...}}` |

**Request convention (client-side fetch helpers):** endpoints take a schema-validated
object, build the URL/fetch, and throw typed errors. GET endpoints append params
(`new URL(..., window.location.origin) + searchParams.append(...)`); POST endpoints
send the body with `Content-Type: application/json`.

## Endpoint inventory

### Workspace core
| Endpoint | Method | Schema / params | Purpose |
|---|---|---|---|
| `/_api/workspace/list` | GET | — | Owned + shared + favorite workspaces (used by `listFlootApps`) |
| `/_api/workspace/{workspaceId}` | GET | — | Single workspace detail |
| `/_api/workspace/update` | POST (SuperJSON) | `{id, name, mobileAppId, ...}` | Update workspace metadata (bundle id etc.) |
| `/_api/workspace/deployment` | GET | `?workspaceId=` | Deployment status object |
| `/_api/workspace/canonical-domain` | GET | `?workspaceId=` | Current canonical domain |
| `/_api/workspace/canonical-domain/update` | — | — | Change canonical domain |
| `/_api/workspace/reference` | POST | `{action: "getInfo"\|"readItems", sourceWorkspaceId, include?: ["items","dependencies"]}` (getInfo); `{action:"readItems", sourceWorkspaceId, itemNames[]}` (readItems) | **Source-code API** — file list + raw code (used by `fetchFlootAppFiles`) |
| `/_api/workspace/switch-style` | POST | `{id, styleId}` | Apply a style/theme from another workspace |
| `/_api/workspace/trigger-job` | POST (SuperJSON) | — | Trigger a scheduled job |
| `/_api/workspace/dev-schedules` | — | — | Development schedules |
| `/_api/workspace/cancel-runtime-task` | — | — | Cancel a runtime task |
| `/_api/workspace/discuss-build-suggestion` | — | — | AI build suggestion chat |

### Database (workspace data layer)
| Endpoint | Method | Schema / params | Purpose |
|---|---|---|---|
| `/_api/database/dump` | POST (SuperJSON) | `{resourceId, workspaceId}` | Full table dump (read-only extraction) |
| `/_api/database/insert` | POST | `{resourceId, workspaceId, ...columns}` | Insert rows |
| `/_api/database/batch-update` | POST | — | Batch update rows |
| `/_api/database/delete` | POST | — | Delete rows |

### Resources / assets / jobs
| Endpoint | Method | Params | Purpose |
|---|---|---|---|
| `/_api/resources/list` | GET | `?type=` | List resources (optional type filter) |
| `/_api/workspace/add-resource` | POST | `{workspaceId, resourceId}` | Attach resource to workspace |
| `/_api/workspace/remove-resource` | POST | `{workspaceId, resourceId}` | Detach resource |
| `/_api/asset/delete` | POST | `{workspaceId, assetId}` | Delete an asset |
| `/_api/workspace/floot-push-resource` | POST | — | Push-to-Floot resource |
| `/_api/workspace/floot-oauth-resource` | POST | — | OAuth resource wiring |
| `/_api/workspace/floot-google-integrations-resource` / `floot-microsoft-integrations-resource` / `floot-microsoft-login-resource` | POST | — | MS/Google integration resources |

### Mobile builds (see docs/floot-native-mobile-builds.md)
| Endpoint | Method | Params | Purpose |
|---|---|---|---|
| `/_api/workspace/mobile-build-status` | GET | `?workspaceId=` | Poll build state; free plan → 404 `{"error":"Mobile builds not enabled"}` |
| `/_api/workspace/mobile-build-download-url` | GET | `?workspaceId=&buildId=&forAndroidApk=true` | Pre-signed APK download URL (`value.downloadUrl`) |

### App / agent runtime
| Endpoint | Method | Purpose |
|---|---|---|
| `/_api/workspace/appsync-subscriber-token` | GET | AppSync subscriber token (real-time updates) |
| `/_api/workspace/update` | POST | Workspace mutation |
| `/_api/workspace/mobile-build-download-url` | GET | (above) |
| `/_api/todo/delete` | POST | Delete todo item |

### Meta / public
| Endpoint | Method | Purpose |
|---|---|---|
| `/_api/user-info` | POST (SuperJSON) | `{source, experience}` onboarding info |
| `/_api/support/widget-identity` | GET | Support widget config |
| `/_api/showcase/heart` | — | Showcase "heart" (public gallery interaction) |
| `/api/trpc/workspace.requestDeploy` | POST tRPC | **Deploy trigger** — body `{type: "prod"\|"prodUpdate", id, subdomain, includeMadeWithFloot, buildMobileApps}` |
| `/api/auth/signin?` | — | NextAuth login |
| `/api/early_access_features/?token=` | GET | Early-access feature flags (token param) |
| `/api/surveys/?token=` | GET | Surveys (token param) |
| `/api/web_experiments/?token=` | GET | Experiment assignments (token param) |

### Prompt / AI internals
| Path | Purpose |
|---|---|
| `/api/llm` | Editor LLM gateway — carries `globalChatAndStore`, `userModification`, workspace `globalCss.changes` mutations (used by `removeFlootBadge`) |

## Notes for Push44 integration
- **Deploy:** `POST /api/trpc/workspace.requestDeploy` — already wired; confirm the
  tRPC response envelope (`{result: {data: ...}}`).
- **Source extraction:** `/_api/workspace/reference` `getInfo` + `readItems` — already
  wired in `fetchFlootAppFiles`. The `database/dump` endpoint is a parallel
  read-only extraction path for the data layer.
- **New untapped surfaces:** `canonical-domain/update`, `switch-style`,
  `trigger-job`, `dev-schedules`, `database/*` (read/write data layer),
  `resources/list`, `add/remove-resource`, `asset/delete`.

> Status: static RE complete. Live verification requires a session token
> (`nextauth.session-token`) from a logged-in `floot.com` browser session —
> same as the existing Push44 flow. Provide a token to verify endpoint shapes
> against the live server.
