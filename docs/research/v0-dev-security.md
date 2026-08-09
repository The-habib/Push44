# v0.dev — Bug Bounty Security Research

> **Companion to** [`v0-dev-api.md`](./v0-dev-api.md) (integration research).
> This document is a **static/spec-level attack-surface analysis** of v0 (by Vercel). It inventories endpoints, auth models, and candidate vulnerability classes with responsible-testing guidance. **No live exploitation was performed to produce this document** — all findings came from the public OpenAPI spec, the open-source `v0-sdk`, and unauthenticated probes.

---

## Table of Contents

1. [Program & Scope](#1-program--scope)
2. [Attack Surface Inventory](#2-attack-surface-inventory)
3. [Auth Architecture](#3-auth-architecture)
4. [Candidate Bug Classes](#4-candidate-bug-classes)
5. [Observed Behavior Notes](#5-observed-behavior-notes)
6. [Rules of Engagement](#6-rules-of-engagement)

---

## 1. Program & Scope

| Item | Value |
|---|---|
| Program | Vercel **Platform Protection** (HackerOne: `vercel_platform_protection`) |
| v0 in scope? | **Yes.** Vercel's own Senior Security Engineer, v0 job posting states that role "own[s] the HackerOne relationship for v0" — triage/validate/fix v0 reports |
| Disclosure | `responsible-disclosure@vercel.com` |
| Rewards | CVSS 4.0-based, per real-world impact |
| Out of scope | `vercel-open-source` program covers only OSS (Next.js, SWR, etc.) — the v0 web app is **not** covered there |

**Threat model Vercel explicitly cares about for v0** (from the job posting): sandbox escape, auth gaps, injection vectors, prompt injection, tool-use abuse, agent runtime/sandbox isolation, permission boundaries between agent actions and user intent.

---

## 2. Attack Surface Inventory

### 2.1 Public Platform API — `api.v0.dev/v1`

Fully documented (beta). Auth = `Authorization: {api_key}`. OpenAPI at `api.v0.dev/v1/openapi.json`.

**Read-sensitive (candidate IDOR):**

| Endpoint | Data exposed |
|---|---|
| `GET /chats` | All chat summaries for the token's account (paged) |
| `GET /chats/{chatId}` | Full chat: messages, attachments, metadata |
| `GET /chats/{chatId}/versions` | Version list |
| `GET /chats/{chatId}/versions/{versionId}` | **All source files, raw content** |
| `GET /chats/{chatId}/versions/{versionId}/download` | ZIP/tarball of source |
| `GET /chats/{chatId}/messages` + `/{messageId}` | **Full prompt/response conversation** (prompts are IP) |
| `GET /chats/{chatId}/preview` | Preview URL + short-lived access token |
| `GET /projects` / `/projects/{projectId}` | Project metadata |
| `GET /projects/{projectId}/env-vars` (+ `/{envVarId}`) | **Environment variable key + `value` + `decrypted` flag** — secrets |
| `GET /deployments` + `/{deploymentId}` (+ `/logs`, `/errors`) | Deployment details + logs |
| `GET /integrations/vercel/projects` | Linked Vercel projects |
| `GET /reports/usage`, `/reports/usage/ai`, `/reports/user-activity` | Usage analytics |
| `GET /user/billing`, `/user/plan`, `/user/scopes` | Billing/plan metadata |
| `GET /mcp-servers` + OAuth token fields | MCP server auth (`type: 'oauth'`, `token`) |

**Write-sensitive (candidate privilege issues):**

| Endpoint | Risk |
|---|---|
| `POST /chats/{chatId}/messages` (+ `resume`/`stop`) | Trigger/consume paid model runs on another's chat |
| `PATCH /chats/{chatId}/versions/{versionId}` + `POST .../files/delete` | **Modify/delete files in a chat version** (requires preview running) |
| `DELETE /chats/{chatId}`, `DELETE /deployments/{deploymentId}` | Destructive |
| `POST /chats/{chatId}/versions/{versionId}/restore` | Restore/replace content |
| `PUT /chats/{chatId}/favorite`, `PATCH /chats/{chatId}` | Metadata mutation |
| `PATCH /projects/{projectId}/env-vars` (+ delete) | **Rewrite secrets** |
| `POST /hooks`, `GET/PATCH/DELETE /hooks/{hookId}` | Webhook exfiltration / SSRF-adjacent (target URLs) |
| `POST /deployments` | Deploy to another's project |
| `POST /mcp-servers` + OAuth authorize | OAuth token capture |

### 2.2 Internal Web API — `v0.dev/chat/api/*`

Discovered by grepping the public JS bundles (63 chunks, ~7.3 MB). Session-authenticated (NextAuth cookie). **Only two routes are wrapped by the KPSDK anti-bot layer:** `POST /chat/api/chat` and `POST /chat/api/vm/actions/*` — the rest rely on session auth alone.

| Route | Notes |
|---|---|
| `/chat/api/chat`, `/chat/api/chat/leaf`, `/chat/api/chat/blob`, `/chat/api/chat/upload`, `/chat/api/chat/upload/check`, `/chat/api/chat/upload-s3`, `/chat/api/chat/resume/ping` | Chat + attachment upload |
| `/chat/api/blocks`, `/chat/api/blocks/files`, `/chat/api/blocks/git-info`, `/chat/api/block-screenshot/` | Block/artifact storage |
| `/chat/api/download-zip?cid={chatId}` (`?id=` variant) | **Session ZIP export**; reached from share flows |
| `/chat/api/send`, `/chat/api/send-site`, `/chat/api/stop-agent` | Agent control |
| `/chat/api/snapshots/upload`, `/chat/api/vm/admin/snapshot` | VM snapshots |
| `/chat/api/history`, `/chat/api/history/activity`, `/chat/api/favorites` | User history |
| `/chat/api/git/connect`, `create-branch`, `reconnect`, `reset-deleted-branch` | Git link ops |
| `/chat/api/integrations/*` (figma account/oauth-url, mcp permissions, `refresh-vm-env`, `snowflake/oauth`, `snowflake/snowflake-token`, `snowflake/snowsight-url`, `snowflake-deploy`, etc.) | **Snowflake token endpoints** |
| `/chat/api/refresh-session?returnTo=` | Session refresh w/ redirect |
| `/chat/api/projects?unlinked=true`, `/chat/api/team/change-scope?default=true` | Org/project scope |
| `/chat/api/ai-gateway-key`, `/chat/api/plan-info`, `/chat/api/profile`, `/chat/api/scopes`, `/chat/api/scopes/user`, `/chat/api/rate-limit`, `/chat/api/flags` | Meta |

### 2.3 Preview / embed system

- `GET /v1/chats/{chatId}/preview` → `{ url, token, expiresAt }` (token short-lived, sent as `x-v0-preview-token`).
- SDK `fetchPreview()` helper proxies requests to the preview origin, attaching the token; it strips `authorization`/`cookie`/`x-vercel-*` headers and **hard-rejects any path that resolves off the preview origin** ("token never attached cross-host") — evidence this was a past attack surface.
- `GET/POST /settings/preview-hosts` — teams register "hostname patterns trusted to embed previews"; child teams inherit parent org hosts.

### 2.4 Anti-bot layer

KPSDK (client-side, challenges via `/149e9513-.../c.js`) injects `x-is-human` + `x-path` + `x-method` headers on protected `fetch`/`XHR`. Protects only the two routes above. Client-side only — server must independently enforce.

---

## 3. Auth Architecture

| Layer | Mechanism |
|---|---|
| Web login | `/api/auth/login?next=%2F` (NextAuth-style) with `next` param; signup `?action=signup`; **GitHub** OAuth; bundles reference **Clerk** |
| Session | `__session`-style cookie on v0.dev / v0.app |
| Platform API | API key (`Authorization`, no Bearer) minted at `v0.app/chat/settings/keys` |
| Server-side | `vercelOidcAuth` — OIDC token treated as **project-scoped identity** ("can only access resources associated with the Vercel project that minted the token") |
| Error envelope | `{"error":{"type":"unauthorized_error|not_found_error|...","message":"..."}}` |

**Design question that drives most candidate bugs:** the API key + OIDC token are *identities*. Are the object endpoints actually scoped per-identity, or keyed only by the ID you pass? The privacy enum (`public | private | team | team-edit | unlisted`) plus a `shareable` flag implies v0 already models cross-user access for some resources — a fertile source of authz bugs.

---

## 4. Candidate Bug Classes

> Each of these is a hypothesis + verification outline. **Only test against your own accounts/resources**, per the program's rules of engagement.

### C1. IDOR — cross-tenant reads via platform API (highest priority)
**Hypothesis:** `GET /v1/chats/{chatId}`, `/versions/{versionId}`, `/projects/{projectId}`, and especially **`/projects/{projectId}/env-vars`** may return data for chats/projects that don't belong to the calling key.

**Test (two accounts A and B):**
1. With A's key: `GET /v1/chats` → capture `chatId`, `versionId`, `projectId`.
2. With B's key: replay the same IDs on `GET /v1/chats/{A-chatId}`, `/versions/{A-versionId}`, `/projects/{A-projectId}/env-vars`.
3. Success = cross-tenant data disclosure. **Env-vars (`value` + `decrypted: true`) is the high-impact case.**

**Signal:** expect 403/404; a 200 with foreign data = bug. Document the typed error envelope (helps write a clean report).

### C2. Unauthenticated access to `public`/`unlisted` chats via API
**Hypothesis:** `shareable`/`public`/`unlisted` chats may be fetchable **without** any key via the same object endpoints the web share pages use.

**Test:**
1. Set a chat to `public`/`unlisted` and capture its `webUrl` + `apiUrl`.
2. With **no** auth, hit `GET /v1/chats/{id}`, `GET /v1/chats/{id}/versions/{vid}`, and `GET /v1/chats/{id}/versions/{vid}/download`.
3. `unlisted` should require a secret link, not be world-readable. If `versions/{vid}` returns **file content** for an `unlisted` chat without auth, that's an access-control bug.

**Observed anomaly to build on:** `GET /v1/chats/{chatId}/preview` returned **404** unauthenticated while all sibling endpoints returned **401** — the preview route is handled before auth in the stack. If the server serves *public* previews unauthenticated, a leaked/derived preview token exposes live app source.

### C3. Preview token — lifetime, reuse, scoping
**Hypothesis:** the "short-lived" `x-v0-preview-token` may be valid beyond `expiresAt`, reusable across users, or fetchable for foreign chats.

**Test:**
1. `GET /v1/chats/{myChat}/preview` → grab `token`/`expiresAt`.
2. Replay token against the preview origin after `expiresAt`.
3. From account B, `GET /v1/chats/{A-chatId}/preview` (ties into C1).

### C4. Preview-token exfiltration via embed/`preview-hosts`
**Hypothesis:** a team-registered `preview-hosts` pattern + a `fetchPreview`-style proxy could be abused to redirect the token to an attacker origin, or `preview-hosts` config has an SSRF/framing loophole (e.g., wildcard patterns allowing attacker domains; child-org inheritance bypass).

**Test:** register a host pattern, embed the preview, check whether `x-v0-preview-token` is ever sent to a non-preview origin; try pattern bypasses (`*.evil.com`, CR/LF, IDN).

### C5. Web-API authorization gaps
**Hypothesis:** session-authed internal routes may lack ownership checks.

**Tests (own account only):**
- `/chat/api/download-zip?cid={foreignChatId}` — replay a chat id from a different account; 200 with ZIP = missing object check.
- `/chat/api/snowflake/snowflake-token/...` — token exposure, including from a team/org context.
- `/chat/api/blocks` / `block-screenshot` — foreign block fetch.

### C6. Open redirects
**Hypotheses:**
- `/api/auth/login?next=` — does NextAuth validate `next` against an allowlist?
- `/chat/api/refresh-session?returnTo=` — unvalidated redirect.
- `webUrl` / `demoUrl` fields returned by the API — if the client does `window.location = webUrl`, a tampered/db-stored value could phishing-redirect.

### C7. Rate limiting & abuse
**Hypothesis:** read endpoints may be rate-limited only weakly.
- `GET /v1/rate-limits` documents the model — compare against actual 429 behavior.
- Mass enumeration via `offset` pagination; ID iteration if IDs are sequential (check format: opaque strings in spec — but **confirm actual ID entropy**; if they're short/slug-like, C1 becomes trivially scalable).

### C8. Write-side abuse
- **File mutation without owner check:** `PATCH /v1/chats/{id}/versions/{vid}` + `POST .../files/delete` (C1 extension) — destructive on foreign chats.
- **Deploy-to-foreign-project:** `POST /v1/deployments` with a `vercelProjectId` not owned by the caller.
- **Webhooks (`/hooks`):** target-URL SSRF or secret exfiltration if hook URLs are fetched server-side.

### C9. Client-side (lower value, include for completeness)
- `data-dpl-id` / Vercel deployment-ID disclosure in HTML (info only).
- `v0-local-drafts` localStorage — check for cross-tab/race issues (low).
- KPSDK `x-is-human` — the challenge is client-controlled JSON; if the server *only* checks header presence, it's cheap to bypass for protected routes (`/chat/api/chat`, `/chat/api/vm/actions/*`). Verify whether the server validates challenge cryptographically (it should; confirm).

---

## 5. Observed Behavior Notes

- **401/404 differential:** `GET /v1/chats/{id}/preview` → 404 unauth; all others → 401. Use response-type differentials to fingerprint access control during your own testing.
- **Typed errors:** `unauthorized_error` vs `not_found_error` — useful to distinguish "no such resource" from "no permission," but also an enumeration aid if IDs are guessable.
- **CORS:** `access-control-allow-origin: *` on `api.v0.dev` — browser-direct testing of the public API is fully supported (good for PoC screenshots).
- **Anti-bot scope is narrow:** only `POST /chat/api/chat` and `POST /chat/api/vm/actions/*` are challenge-wrapped client-side.

---

## 6. Rules of Engagement

- **Test only against resources you own** (two throwaway accounts is the right setup for C1/C2/C3).
- **No mass enumeration or scraping** of real users' data; stop at the first confirmation — do not expand beyond proof.
- **Do not consume other users' credits** — C1-write tests (`messages`, `deployments`) can be costly; prefer read-only first.
- **Report via HackerOne** `vercel_platform_protection` or `responsible-disclosure@vercel.com`; include the typed error responses and a minimal 2-account repro.
- **Nothing here has been executed against the live service.** If you choose to test, you are responsible for staying inside program scope and applicable law.

---

> **Status:** static analysis only. Next step if you want to go further: build a two-account harness and run the C1/C2/C3 verification matrix against the public API (read-only), then write up findings. This is fully compatible with the existing `docs/research/` workflow.
