---
name: Zite Integration Pattern
description: How Zite (build.fillout.com) login, app listing, and file fetching works in Push44
---

## Auth
- Login: POST `https://server.zite.com/login/password` with `{ email, password }` and `Origin: https://build.fillout.com` header
- Response sets cookies: `connect.sid` (session) and `fillout-csrf-token` (csrf)
- All subsequent calls need both cookies reconstructed as `Cookie: connect.sid=...; fillout-csrf-token=...`
- Dev proxy: `/proxy/zite/*` in vite.config.ts; Vercel: `api/zite.ts`
- Custom headers from client → proxy: `X-Zite-Session` and `X-Zite-Csrf`

## App Listing
- GET `https://server.zite.com/admin/zite/apps` with cookie header
- Returns array; each item has `_id`, `name`, `slug`, `publicIdentifier`

## File Fetching
- GET `https://server.zite.com/admin/zite/apps/{publicIdentifier}` with cookie header
- Files live at `response.ziteSnapshot.template.files`
- Each value is `{ content: "..." }` — extract `.content`

## Colors
- `ZITE_GRAD = "linear-gradient(135deg,#f59e0b,#d97706)"`
- `ZITE_COLOR = "#d97706"` (amber-600)
- `ZITE_LIGHT = "#fffbeb"`, `ZITE_BORDER = "#fde68a"`, `ZITE_TEXT = "#92400e"`

## Storage keys
- `ziteSession`, `ziteCsrf`, `ziteEmail` added to `Credentials` in storage.ts
- Platform type union includes `"zite"` in storage.ts PushRecord and PushPrefs

**Why:** Zite is build.fillout.com's app builder — no public API docs, fully reverse-engineered. The `Origin` header is mandatory or the server rejects requests.
