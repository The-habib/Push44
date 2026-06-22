---
name: Rocket.new API Patterns
description: Confirmed working endpoints, auth patterns, and critical gotchas for Rocket.new integration
---

## Auth servers

- `AUTH_BASE = https://appuser.dhiwise.com` — user profile, workspace list
- `BACK_BASE  = https://back.rocket.new`   — chat threads, app data
- `APP_BASE   = https://application.rocket.new` — application files (unconfirmed)

## companyId is required for ALL back.rocket.new calls

`POST /api/v1/chat-thread/search` WITHOUT `companyId` header returns `context:"general"` — empty list.
WITH `companyId` header returns real projects. The companyId must be passed as a plain HTTP header `companyId: "..."`.

**How to resolve companyId:**
1. OTP login response: `d.data.user.companyId` (NOT `d.data.companyId`)
2. JWT claims: `claims.companyId` (often not present)
3. `GET ${AUTH_BASE}/web/v1/workspace/list` with JWT auth → `{ data: { list: [{ companyId: "..." }] } }` ← confirmed working

**Why:** Rocket.new is multi-workspace. Without workspace context the search returns a "general" context with no results.

## App listing — confirmed working pattern

```
POST https://back.rocket.new/api/v1/chat-thread/search
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: {}
Response: { data: { list: [{ _id, displayName, name, threadDetails: { applicationId, name } }] } }
```

## App object shape from chat-thread/search

```json
{
  "_id": "6a1c99e26581ee0014b82705",        ← use as thread ID / app ID
  "displayName": "CallbreakScoreKeeper",
  "name": "CallbreakScoreKeeper",
  "threadDetails": {
    "applicationId": "6a1c9a2e8be93c00147a3884",  ← use for file fetching
    "name": "CallbreakScoreKeeper",
    "isCodeGenerated": true
  },
  "clusterId": "..."
}
```

## File fetching

`chat-thread/get` with `{ id: threadId }` returns thread metadata (NOT files directly). Use `threadDetails.applicationId` to then query application-specific file endpoints on `application.rocket.new`.

The `RocketApp.applicationId` field stores this and is passed through to `fetchRocketAppFiles`.

## CRITICAL: Never use loginToBack()

`loginToBack()` tries 10+ endpoints that all fail. It adds 20-30 seconds of invisible delay before app listing or file fetching starts. It always returns `null`. The auth token itself (`Bearer {token}`) works directly on back.rocket.new — no session exchange needed.

**Why:** loginToBack was attempting to exchange the dhiwise.com JWT for a back.rocket.new session token, but the back server accepts the JWT directly via `Authorization: Bearer`.
