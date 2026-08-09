# v0.dev API — Reverse Engineering Research

> **Status:** Partially verified via live HTTP probes (August 2026).
> Endpoints below are taken from the **official v0 Platform API OpenAPI spec** served at `https://api.v0.dev/v1/openapi.json`, then confirmed live (auth rejection shape, CORS behavior). Full end-to-end verification with a real API key + account is still required.

Unlike every other Push44 platform (Base44, Rocket.new, Floot, Zite, bolt.new, Lovable), **v0 has a public, documented API** (currently `beta`). No JS-bundle reverse engineering was needed — the OpenAPI spec is served from the API itself.

---

## Table of Contents

1. [Key Finding — Public API, No Proxy Needed](#1-key-finding--public-api-no-proxy-needed)
2. [Authentication](#2-authentication)
3. [Confirmed Endpoints](#3-confirmed-endpoints)
4. [Push44 Integration Mapping](#4-push44-integration-mapping)
5. [Open Questions / Requires Live Account](#5-open-questions--requires-live-account)
6. [Integration Checklist](#6-integration-checklist)

---

## 1. Key Finding — Public API, No Proxy Needed

| Property | Value |
|---|---|
| Base URL | `https://api.v0.dev/v1` |
| OpenAPI spec | `https://api.v0.dev/v1/openapi.json` (HTTP 200, ~248 KB) |
| API status | `beta` (title: "v0 Platform API (beta)", version 1) |
| Auth | API key via `Authorization` header |
| **CORS** | **`access-control-allow-origin: *`** — browser-direct `fetch()` works |
| Proxy needed? | **No.** This is the first Push44 platform that can be called straight from the browser (GitHub-style). |

Confirmed live:

```
OPTIONS https://api.v0.dev/v1/user   → 204
  access-control-allow-origin: *
  access-control-allow-methods: GET, POST, PUT, DELETE
  access-control-allow-headers: Content-Type, Authorization

GET https://api.v0.dev/v1/user       → 401 (no auth)
GET https://api.v0.dev/v1/chats      → 401 (no auth)
```

The `/chat/api/platform-api` + `x-matched-path` headers reveal the API is internally a route on the v0 chat Next.js app, but it is served publicly under `api.v0.dev` and returns standard CORS headers.

---

## 2. Authentication

```
Authorization: {api_key}
```

- Security scheme type: `apiKey`, header `Authorization` (no `Bearer` prefix specified — verify live).
- API keys are created at **`https://v0.app/chat/settings/keys`** (the OpenAPI spec points to `https://v0.app/chat/settings/keys`; the v0.app docs mention `https://v0.app/settings/keys`).
- Keys are scoped to the user's account and can be rotated.
- This maps **1:1 to Push44's existing token model** (like Base44's API-token auth and the GitHub PAT). No OAuth, no cookie/session capture needed.

### Token validation

```
GET https://api.v0.dev/v1/user
→ 200 { "id": "...", "object": "user", "name": "...", "email": "...", "avatar": "...", "createdAt": "...", "updatedAt": "..." }
→ 401 UnauthorizedError (bad/expired key)
```

Mirrors the `getGitHubUser` pattern — perfect for a "Test connection" button in Settings.

---

## 3. Confirmed Endpoints

> Schema details below are from the official spec (August 2026). Unauthenticated probes confirm the routes exist; response payloads with real data still need a live key.

### 3.1 List apps (chats)

```
GET /chats?limit=60&offset=0
```

| Param | Default | Max |
|---|---|---|
| `limit` | 60 | 60 |
| `offset` | 0 | — |

Response envelope:

```json
{
  "object": "list",
  "data": [
    {
      "id": "chat-id",
      "object": "chat",
      "shareable": true,
      "privacy": "public | private | team | team-edit | unlisted",
      "name": "My app",                          // ← app display name
      "title": "deprecated",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601",
      "favorite": false,
      "authorId": "user-id",
      "projectId": null,
      "vercelProjectId": null,
      "webUrl": "https://v0.dev/chat/...",
      "apiUrl": "https://api.v0.dev/v1/chats/...",
      "latestVersion": {
        "id": "version-id",
        "object": "version",
        "status": "pending | completed | failed",
        "demoUrl": "...",
        "screenshotUrl": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
  ]
}
```

**Pagination:** `limit` caps at 60, so page with `offset` until a batch returns fewer than 60 items — same loop pattern as `listGitHubRepos`.

### 3.2 Get chat detail

```
GET /chats/{chatId}
```

`ChatDetail` adds `latestVersion` (full detail) and `versions` over the summary. Use when the list's `latestVersion` is missing/stale.

### 3.3 List versions

```
GET /chats/{chatId}/versions
```

`VersionSummary[]`: `{ id, object, status, demoUrl, screenshotUrl, createdAt, updatedAt }`. v0 iterates apps, so a chat has one "latest version" per generated iteration. Push44 should always fetch the **most recent `completed`** version.

### 3.4 Fetch files (the core push input) ⭐

```
GET /chats/{chatId}/versions/{versionId}
→ VersionDetail
```

```json
{
  "id": "version-id",
  "object": "version",
  "status": "completed",
  "demoUrl": "...",
  "screenshotUrl": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "files": [
    {
      "object": "file",
      "name": "app/page.tsx",        // path + extension (verify with live account)
      "content": "export default...", // full raw file content
      "locked": false                  // true = protected from AI overwrite
    }
  ]
}
```

This is exactly the `FileEntry[]` shape (`path` + `content`) that `pushFilesToGitHub` consumes — **no transform needed beyond renaming `name` → `path`.**

### 3.5 Download files as archive (alternative)

```
GET /chats/{chatId}/versions/{versionId}/download
→ application/zip  (or application/gzip — tar archive; likely selectable via Accept header)
```

Binary ZIP of the version files. Push44 already ships `jszip` + `fflate`; if the inline `files` array is ever too large, ZIP-decode with `JSZip.loadAsync` is a trivial fallback.

### 3.6 Projects (optional richer model)

```
GET /projects              → ProjectSummary[] (id, name, privacy, vercelProjectId, timestamps)
GET /projects/{projectId}  → ProjectDetail
GET /chats/{chatId}/project → project for a given chat
```

A chat can be assigned to a v0 project. Not required for a first integration — chat-based listing is sufficient and matches the "apps" mental model.

### 3.7 Rate limits

```
GET /rate-limits → { object: "rate_limit", ... }
```

Exposed explicitly by the API — Push44 can query it to show quota, and it confirms the API is quota-managed (won't be free-push unlimited).

---

## 4. Push44 Integration Mapping

| Push44 concern | v0 mechanism | Fit |
|---|---|---|
| Auth | `Authorization: {api_key}` from `v0.app/chat/settings/keys` | Same as Base44 API-token / GitHub PAT — no proxy, no OAuth |
| Credential fields | `v0Token`, `v0Email` (+ `v0Name`?) | Add to `Credentials` in `storage.ts` |
| "List apps" | `GET /chats` (paginate `offset` in 60s) | Drop-in for `loadApps()` |
| "Fetch files" | `GET /chats/{id}/versions/{versionId}` → `.files[]` | Rename `name` → `path`, pass to existing push flow |
| Diff tracking | Snapshot by `chatId` in `push44_snapshots_{id}` | Existing `computeFileDiff` works untouched |
| Push to GitHub | Existing `pushFilesToGitHub` Trees API | No changes |

**Credential type:** `Platform = "base44" | "rocket" | "floot" | "zite" | "bolt" | "lovable" | "v0"`.

---

## 5. Open Questions / Requires Live Account

- [ ] Confirm `Authorization` uses bare key or `Bearer {key}` prefix (spec omits prefix; test both).
- [ ] Confirm `FileDetail.name` is a **full path** (`app/page.tsx`) or basename. v0 organizes files in folders in the UI, so it should be a path — but this determines whether nested folders survive the push.
- [ ] Confirm `GET /chats` ordering (most-recent-first?) so "latest version" picks the right app.
- [ ] Confirm `latestVersion` is always populated in list responses, or whether `GET /chats/{id}` must be called per app.
- [ ] Confirm download endpoint's format selection (`Accept: application/zip` vs `application/gzip`).
- [ ] Check `/rate-limits` shape and whether free-tier pushes are feasible.
- [ ] Verify whether v0 chat names fall back to the first message when `name` is unset.

---

## 6. Integration Checklist

1. `src/lib/v0-api.ts` — `validateV0Token`, `listV0Chats`, `fetchV0VersionFiles` (all direct `fetch`, no proxy).
2. `src/lib/storage.ts` — add `v0Token`, `v0Email` to `Credentials`; add `"v0"` to `Platform`.
3. `src/contexts/AppContext.tsx` — nothing new required (generic creds shape).
4. `src/routes/settings.lazy.tsx` — add a "v0.dev" card (token input + Test/Connect button + disconnect).
5. `src/routes/push.lazy.tsx` — add `v0` to `PLATFORMS`, `loadApps()`, and `handleSelectApp()` branches.
6. `src/components/BrandLogos.tsx` + `src/assets/` — v0 logo.
7. No `api/` function, no `vite.config.ts` plugin, no `vercel.json` route — CORS is open.
8. Optionally surface `GET /rate-limits` in the v0 settings card.

---

> Live verification note: this document was produced against the official OpenAPI spec and unauthenticated probes. To complete the "Fully verified" status, run the checklist above against a real account and update this header. The Bolt.new research doc (`bolt-new-api.md`) remains the reference for the RE-with-Playwright workflow if v0 ever locks the API down.
