---
name: Bolt.new API Patterns
description: Confirmed auth, deploy, badge endpoints, email/password login flow, and project listing for bolt.new integration in Push44
---

# Bolt.new API — Confirmed Patterns

**Why:** Reverse-engineered via live Playwright + Chromium session (July 5 2026) against a real account. Full research in `docs/research/bolt-new-api.md`.

## Auth — Session Cookie
- Cookie name: `__session`
- URL-decode the raw cookie value before sending
- Headers required: `Cookie`, `Origin: https://bolt.new`, `Referer: https://bolt.new/`
- Expired session: `{"code":"login-required","message":"Login Required","isRetryable":false}` (401)

## Auth — Email/Password Login (PKCE OAuth2 via StackBlitz) ✅ IMPLEMENTED
Full 6-step server-side flow in `api/bolt-login.ts`. Client function `boltLogin()` in `src/lib/bolt-api.ts`.

**The chain:** bolt.new → stackblitz.com/sign_in → stackblitz.com/oauth/authorize → bolt.new/oauth2 → `__session` cookie

Key steps:
1. Generate PKCE (`code_verifier` + SHA-256 `code_challenge`) + random `state`
2. Construct authorizeUri manually (do NOT call `POST /api/sessions` — CF-blocked from non-browser):
   `https://stackblitz.com/sign_in?redirect_to=/oauth/authorize?client_id=bolt&response_type=code&redirect_uri=https://bolt.new/oauth2&code_challenge_method=S256&code_challenge=<ch>&state=<st>&scope=public&bolt_oauth_provider=login_password`
3. `GET <authorizeUri>` → extract `csrf-token` meta + `_stackblitz_session` cookie
4. `GET https://stackblitz.com/api/users/sessions/sso?login=<email>` → `{forceSSO: false}` check
5. `POST https://stackblitz.com/api/users/sessions` body `{"user":{"login":"<email>","password":"<pass>"}}` + `x-csrf-token` header → **HTTP 204 = success**, new `_stackblitz_session` cookie
6. `GET https://stackblitz.com/oauth/authorize?...` with updated `_stackblitz_session` → 302 to `bolt.new/oauth2?code=<code>&state=<state>`
7. `GET https://bolt.new/oauth2?code=<code>&state=<state>&code_verifier=<verifier>` → 302 + `Set-Cookie: __session=<token>`

**Security notes (from code review):**
- `code_verifier` MUST be forwarded in the bolt.new/oauth2 call — PKCE requires it
- `state` must be present and exactly match (both absent-state and mismatch are failures)
- Redirect following in exchangeCodeForSession() is restricted to `bolt.new` host only (SSRF guard)

**Implementation:** Vercel function at `/api/bolt-login` (route in vercel.json). Proxy spans 2 domains — CORS blocks pure browser execution.

**SSO accounts (Google/GitHub):** `forceSSO: true` from the SSO check → return error directing user to Session Cookie tab.

## Settings UI
- Tab 1 "Email / Password": email + password → `connectBolt()` → saves token + email → shows project ID input
- Tab 2 "Session Cookie": paste `__session` + Project ID → `saveBolt()` 
- Connected state: shows account info + project ID input + Test button
- `boltEmail` field added to `Credentials` in `src/lib/storage.ts`

## Key Endpoints (all on `https://bolt.new`)
- `GET /api/deploy/{pid}` → `{kind, site_url, is_custom_domain, updated_at}` — confirms project + live URL
- `PUT /api/deploy/{pid}` — Content-Type: application/zip, body: zip bytes → `{deploy_url}` (staging)
- `POST /api/deploy/{pid}/promote` — body: `{}` → `{site_url, updated_at, ...}` (promotes to live)
- `GET /api/projects/{pid}/badge` → `true|false` (server-side badge flag)
- `DELETE /api/deploy/{pid}/badge` → 204 (sets badge flag false — does NOT remove CDN HTML injection)

## Project Listing ✅ RESOLVED (was previously marked unresolved)
`GET /api/projects?preset=bolt&ownerSlug=<username>&ownerType=user&access=index&order=updatedAt&direction=desc&page=1&per_page=20&with_starred_at=true`
- Returns full project list with IDs, names, frameworks, slugs
- `ownerSlug` = StackBlitz username (not email) — still needs user info endpoint to auto-populate
- `preset=bolt` filters to bolt.new projects only

## StackBlitz API Endpoints (on `https://stackblitz.com`)
- `GET /api/users/sessions/sso?login=<email>` → `{forceSSO: bool, loginHint: email}`
- `POST /api/users/sessions` → login with email+password (JSON), needs `x-csrf-token` from sign_in page

## Badge Removal — Confirmed Working ✅
**Two-layer approach:**

### Layer 1 (server-side): `DELETE /api/deploy/{pid}/badge`
Sets internal flag to false. Does NOT suppress `badge.js` from CDN HTML.

### Layer 2 (JS bundle modification) — the real fix
Prepend MutationObserver badge blocker to deployed JS bundle.
Fingerprint: `style.zIndex === '2147483647'` (max int32). Do NOT check innerHTML — badge is in shadow DOM.

## Deploy ZIP Structure
- `index.html` — included but IGNORED by bolt.new CDN
- `assets/index-[HASH].js` — MODIFIED: badge blocker prepended
- `assets/index-[HASH].css` — original
- `vite.svg` — original

## URL Normalization
`site_url` from deploy API includes protocol (e.g. `https://robot.bolt.host`). Always strip `https?://` and trailing `/` when storing `siteUrl`.

## Permanence Limitation
Badge removal lasts until user deploys new changes from bolt.new editor (new build = new JS hash = modified bundle no longer referenced). Users must re-run Push44 after each new editor deploy.
