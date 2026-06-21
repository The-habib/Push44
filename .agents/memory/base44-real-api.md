---
name: Base44 Real API
description: Confirmed Base44 API base URL, auth flow, and all working endpoints discovered by live testing
---

## Real Base URL
`https://app.base44.com/api`

**NOT** `https://api.base44.com/v1` — that domain returns HTML 404s (Wix error pages).

## Auth — Login
```
POST https://app.base44.com/api/auth/login
Body: { "email": "...", "password": "..." }
```
Response:
```json
{
  "success": true,
  "access_token": "eyJhbGci...",
  "user": { "email": "...", "full_name": "...", "id": "...", "api_key": "32chars" },
  "wix_access_token": "...",
  "wix_refresh_token": "..."
}
```
**Token key is `access_token`** (NOT `token`, NOT `jwt`). **Name key is `full_name`** (NOT `name`).

## Auth — Validate Token
```
GET /auth/me
Header: Authorization: Bearer {token}
```
Returns user object **directly** (no `.user` wrapper). Fields: `email`, `full_name`, `api_key`, etc.

## List Apps
```
GET /apps
Header: Authorization: Bearer {token}
```
Returns a **plain array** of app objects. Each app has: `id`, `name`, `updated_at`, `is_managed_source_code`, `has_unchained_ai`, `platform_version`, `last_git_commit_hash`, `connected_to_github`, `status`, etc.

## Check Sandbox Status
```
GET /apps/{appId}/sandbox/status
```
Returns: `{"status": "alive"}` or `{"status": "sleeping"}` (or similar non-alive state).
The sandbox must be alive before fetching files.

## Fetch App Files
```
GET /apps/{appId}/sandbox/files
Header: Authorization: Bearer {token}
```
Response:
```json
{
  "app_id": "6a385b9f9e6d50785356b515",
  "files": {
    "package.json": "{ \"name\": \"base44-app\", ... }",
    "src/App.jsx": "import React ...",
    "src/components/Header.jsx": "..."
  }
}
```
`files` is a **plain object** mapping path strings to content strings. Typical app has ~87 files.

**Why:** The intuitive endpoints `/apps/{id}/files` (404) and `/apps/{id}/code` (412 "App does not support direct file reads") do NOT work. The real data lives in the sandbox filesystem, accessible via `/sandbox/files`.

**How to apply:** Always check sandbox status first. If not alive, prompt user to open the app in Base44's editor to wake it up.

## Dead Endpoints (Do NOT Use)
- `GET /apps/{id}/files` → 404
- `GET /apps/{id}/code` → 412 "App does not support direct file reads"
- `GET /apps/{id}/export` → 404
- `POST /auth/device` → 404 (no public device code flow)
- `api.base44.com/*` → HTML Wix 404 page

## Auth Header Format
`Authorization: Bearer {access_token}` — standard Bearer. The `api_key` field from user profile is a different 32-char key; it can authenticate some endpoints but does NOT work for file access.
