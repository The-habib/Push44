# Floot Publish API — Reverse-Engineered Reference

> Discovered June 2026 by live bundle analysis and API probing.  
> All endpoints confirmed working against `floot.com` production.

---

## Authentication

Every request must include the user's session cookie:

```
Cookie: nextauth.session-token={token}
```

In Push44, this is sent via the `/api/floot` proxy using the `X-Floot-Token` header:
the proxy converts it to the correct `Cookie` header server-side.

---

## ⚠️ Critical: tRPC Body Format

Floot's tRPC server uses **legacy raw input format** — no transformer wrapper.

| Format | Result |
|---|---|
| `{"json": {"type":"prod","id":"..."}}` | ❌ 400 "Workspace ID is required" |
| `{"type":"prod","id":"..."}` | ✅ 200 `{"result":{"data":{}}}` |

This is the opposite of standard tRPC v10 which wraps inputs in `{"json":...}`.  
**Always send the raw object as the POST body.** No `{"json":...}` wrapper ever.

Same rule applies to tRPC queries: the `?input=` param is raw JSON, not `{"json":{...}}`.

---

## Endpoint Reference

### 1. Check Deployment Status

```
GET /_api/workspace/deployment?workspaceId={workspaceId}
```

**Auth**: session cookie  
**Response shapes**:

```json
{ "type": "notDeployed" }

{
  "type": "deploying",
  "subdomain": "my-app",
  "customDomains": [],
  "deploymentInfo": { "lastDeployedAt": "2026-06-30T..." },
  "includeMadeWithFloot": true,
  "buildMobileApps": false
}

{
  "type": "deployed",
  "subdomain": "my-app",
  "customDomains": [],
  "deploymentInfo": { "lastDeployedAt": "2026-06-30T..." },
  "includeMadeWithFloot": false,
  "buildMobileApps": false
}

{
  "type": "error",
  "subdomain": "my-app",
  "message": "Build failed: ...",
  "deploymentInfo": { ... }
}
```

---

### 2. Trigger Production Deploy

```
POST /api/trpc/workspace.requestDeploy
Content-Type: application/json
Body (RAW — no {"json":...} wrapper):
```

```json
{
  "type": "prod",
  "id": "{workspaceId}",
  "subdomain": "{slug}",
  "includeMadeWithFloot": false,
  "buildMobileApps": false
}
```

**Response (success)**:
```json
{ "result": { "data": {} } }
```

**Live URL after deploy**: `https://{slug}.floot.app`

**Subdomain rules**: lowercase letters, digits, hyphens only — `/^[a-z0-9-]{3,}$/`

---

### 3. Update / Republish (already deployed workspace)

```
POST /api/trpc/workspace.requestDeploy
Body (RAW):
```

```json
{
  "type": "prodUpdate",
  "id": "{workspaceId}",
  "subdomain": "{existing_or_new_subdomain}",
  "includeMadeWithFloot": false,
  "buildMobileApps": false
}
```

---

### 4. Pre-Deploy Upload Check (optional)

```
GET /api/trpc/workspace.requestWorkspaceDeployUpload
Query: ?input={"id":"{workspaceId}","hash":"{any_content_hash}"}
```

**Response when upload needed**:
```json
{
  "result": {
    "data": {
      "type": "need_to_upload",
      "link": "https://s3.amazonaws.com/.../presigned-upload-url"
    }
  }
}
```

**Response when not needed**:
```json
{ "result": { "data": { "type": "no_need_to_upload" } } }
```

For standard "publish Floot's own code" flows, skip this step — call `requestDeploy` directly.

---

## Full Publish Flow

```
1. GET /_api/workspace/deployment?workspaceId={id}
   → type=notDeployed: show subdomain picker + Publish button
   → type=deployed:    show live URL + Update option
   → type=deploying:   show "building..." spinner

2. User enters subdomain slug (validate: /^[a-z0-9-]{3,}$/)
   Availability check: HEAD https://{slug}.floot.app
   → 404 = available  ✓
   → 200 = taken      ✗

3. POST /api/trpc/workspace.requestDeploy  (raw body, no wrapper)
   { type:"prod", id:workspaceId, subdomain, includeMadeWithFloot:false, buildMobileApps:false }
   → 200 {"result":{"data":{}}} = deploy queued

4. Poll GET /_api/workspace/deployment?workspaceId={id} every 10s
   → type=deployed:  show https://{subdomain}.floot.app ✅
   → type=error:     show error message
   (Build takes 2–5 minutes for first deploy)
```

---

## Push44 Proxy Routes

| Frontend URL | Forwards To | Purpose |
|---|---|---|
| `GET /api/floot/_api/workspace/deployment?workspaceId=...` | `https://floot.com/_api/workspace/deployment?...` | Status check |
| `POST /api/floot-trpc?p=workspace.requestDeploy` | `POST https://floot.com/api/trpc/workspace.requestDeploy` | Trigger deploy |
| `GET /api/floot-check?subdomain=...` | `HEAD https://{subdomain}.floot.app` | Availability |

The `/api/floot` proxy passes the `X-Floot-Token` header as the `nextauth.session-token` cookie.  
The `/api/floot-trpc` proxy does the same and **passes the body raw** without any transformation.

---

## Error Codes

| Error | Meaning |
|---|---|
| `"Workspace ID is required"` | Wrong tRPC body format — you used `{"json":{...}}` wrapper |
| `400` with Zod errors | Missing required fields in raw input |
| `401 UNAUTHORIZED` | Session token expired or missing |

---

## Notes

- Builds are server-side on Floot's infrastructure — Push44 only triggers the build
- The deploy stays `notDeployed` while building; status changes to `deployed` when done
- Floot uses PartyKit WebSocket (`publish.completed` / `publish.failed` events) as primary notification in-browser; polling via `/_api/workspace/deployment` is the REST alternative
- The tRPC client module ID is `69559`, provider is `98848`, context default is `32720`
