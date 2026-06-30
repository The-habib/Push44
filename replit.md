# Push44

A mobile-first web app that lets users push their **Base44** or **Rocket.new** app source code directly to GitHub — in one tap.

**Dev:** runs on port 5000 via `bun run dev`
**Live:** https://push-44.vercel.app

---

## Handover Status (June 2026)

Both integrations are fully functional and production-ready.

- **Base44** — login (email/password + paste-token), app listing, sandbox auto-wake, file fetch all working. Login modal now detects Google-linked accounts and guides them to use the API token tab instead of email/password.
- **Rocket.new** — OTP login, app listing, and file fetching all confirmed working end-to-end by live testing. File fetch uses the production container ping approach (see below). When a container is sleeping, the UI shows a "Container is sleeping" card with a direct link to open the app in Rocket.new and a Try Again button.

---

## What This App Does

1. User logs in with their Base44 **or** Rocket.new account
2. User connects a GitHub Personal Access Token
3. User selects one of their apps
4. App fetches all source files
5. App pushes all files to a GitHub repo in a single commit (Trees API)
6. Push history is saved locally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start v1.167+ (SSR React router) |
| UI | React 19 + Tailwind CSS 4 |
| Build | Vite 8 via `@lovable.dev/vite-tanstack-config` |
| Package manager | **bun** (not npm/yarn) |
| Styling | Tailwind CSS 4 (no config file needed) |
| Toasts | sonner |
| Icons | lucide-react + custom `BrandLogos.tsx` |
| State | React Context (`AppContext`) + localStorage |

---

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx        — root layout + global SEO meta + JSON-LD + OnboardingGuard
│   ├── index.tsx         — Dashboard (greeting, hero, stats, last push, recent repo)
│   ├── push.tsx          — Main push flow (select app → fetch files → pick repo → commit)
│   ├── settings.tsx      — Base44 login + Rocket.new login + GitHub PAT + preferences
│   ├── repositories.tsx  — Lists all user's GitHub repos
│   ├── history.tsx       — Push history from localStorage
│   └── onboarding.tsx    — First-run wizard (login → GitHub connect)
├── lib/
│   ├── base44-api.ts     — All Base44 server functions (login, list apps, wake sandbox, fetch files)
│   ├── rocket-api.ts     — All Rocket.new server functions (OTP login, list apps, fetch files)
│   ├── github-api.ts     — All GitHub server functions (user, repos, create repo, push)
│   ├── storage.ts        — localStorage helpers (credentials + push history)
│   └── utils.ts          — Tailwind cn() helper
├── contexts/
│   └── AppContext.tsx    — Global credential state, persisted to localStorage
├── assets/
│   ├── logo.png                     — App logo: cat in orange box
│   ├── base44-logo.png              — Original Base44 logo
│   └── base44-logo-transparent.png  — Base44 logo with background removed
└── components/
    ├── AppShell.tsx      — Mobile shell (header, bottom nav, SectionCard, AvatarBubble)
    ├── BrandLogos.tsx    — Base44Logo + GitHubLogo + RocketLogo
    ├── RocketModal.tsx   — Rocket.new OTP login UI
    └── ui/               — shadcn/ui components

public/
├── logo.png       — served at /logo.png (OG image meta tag)
├── robots.txt     — allows all crawlers, points to sitemap
└── sitemap.xml    — all 6 routes with priorities
```

---

## ⚠️ Critical: Real Base44 API Endpoints

**Discovered by live testing** — the official docs are wrong/outdated.

| Action | Method | Endpoint |
|---|---|---|
| Login | POST | `https://app.base44.com/api/auth/login` |
| Validate token | GET | `https://app.base44.com/api/auth/me` |
| List apps | GET | `https://app.base44.com/api/apps` |
| Check sandbox | GET | `https://app.base44.com/api/apps/{id}/sandbox/status` |
| Wake sandbox | POST | `https://app.base44.com/api/apps/{id}/sandbox/wake` |
| Fetch files | GET | `https://app.base44.com/api/apps/{id}/sandbox/files` |

**WRONG endpoints (do NOT use):**
- ❌ `https://api.base44.com/v1/...` — returns HTML 404s
- ❌ `/apps/{id}/code` — returns 412 "App does not support direct file reads"

### Login Response Shape
```json
{ "success": true, "access_token": "eyJ...", "user": { "email": "...", "full_name": "...", "api_key": "..." } }
```
Token key is **`access_token`** (NOT `token`). User name is **`full_name`** (NOT `name`).

### `/auth/me` Response
Returns the user object **directly** (no `.user` wrapper).

### `/sandbox/files` Response
```json
{ "app_id": "...", "files": { "package.json": "...", "src/App.jsx": "..." } }
```
Keys are file paths, values are file content strings. Typical app: ~87 files.

The sandbox must be `"alive"` before fetching files. The code auto-wakes it (polls status, retries). UI shows "Waking up sandbox…" after 3 seconds if still waiting.

### Base44 Login — Google Accounts

Base44 email/password login only works for accounts created with email + password. Users who signed up via Google have no password set — their login will always return `"Invalid email or password"` from Base44's server.

The settings modal detects this error and shows a guided prompt: **"Signed up with Google? Use Auth Token →"** which auto-switches to the token tab. The Auth Token tab instructs users to go to [app.base44.com/settings/account](https://app.base44.com/settings/account) and copy their API Key.

---

## ⚠️ Critical: Real Rocket.new API Endpoints

**Reverse-engineered from the Rocket.new JS bundle** — no public docs exist. All confirmed by live testing.

### URL Constants

| Constant | Value |
|---|---|
| `AUTH_BASE` | `https://appuser.dhiwise.com` |
| `BACK_BASE` | `https://back.rocket.new` |
| `APP_BASE` | `https://application.rocket.new` |
| `GATEWAY_BASE` | `https://gateway.rocket.new` |
| `APP_CODE_BASE` | `https://appcodeformat.dhiwise.com` |

### Authentication Flow (OTP)

```
1. POST https://appuser.dhiwise.com/auth/v3/rocket/send-otp
   Body: { email }
   → Returns nothing useful; triggers OTP email

2. POST https://appuser.dhiwise.com/auth/v3/rocket/verify-email-otp
   Body: { email, otp }
   → Returns: { data: { token: "eyJ...", user: { companyId, fullName, ... } } }
```

Token is a **JWT**. Save `companyId` from `data.user.companyId` (NOT `data.companyId`). Response may be AES-256-CBC encrypted — the code handles decryption automatically via the hardcoded bundle key.

### Resolving companyId

`companyId` is required as an HTTP header for all `back.rocket.new` calls. Without it, searches return `context: "general"` — an empty list.

Resolution order (all tried automatically):
1. Decode JWT claims directly (no network cost)
2. `GET https://appuser.dhiwise.com/web/v1/workspace/list` with `Authorization: JWT {token}` → `{ data: { list: [{ companyId: "..." }] } }`
3. Profile endpoints on auth server as last resort

### Listing Apps

```
POST https://back.rocket.new/api/v1/chat-thread/search
Headers: {
  Authorization: Bearer {token},
  companyId: {companyId},
  pageURL: "https://rocket.new"
}
Body: { page: 1, limit: 50 }
```

Paginate until response returns fewer than `limit` items. Response shape:
```json
{
  "data": {
    "list": [{
      "_id": "6a1c99e26581ee0014b82705",
      "displayName": "CallbreakScoreKeeper",
      "threadDetails": {
        "applicationId": "6a1c9a2e8be93c00147a3884",
        "name": "CallbreakScoreKeeper",
        "languageType": "DART"
      }
    }]
  }
}
```

The `_id` is the **thread ID** (used as the app's primary key in the UI). The `threadDetails.applicationId` is the **application ID** (used for all file fetching).

### Fetching Files — Confirmed Working Strategy (June 2026)

Three steps, all confirmed by live end-to-end testing:

#### Step 1 — Ping the production container (no auth needed)
```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId: "..." }
→ Returns: {
    data: {
      production: {
        backendUrl: "https://callbreaks2883back.builtwithrocket.new",
        status: { Name: "running" }
      }
    }
  }
```

- **No auth required at all**
- `status.Name === "running"` → container is live, files accessible
- `backendUrl` is the HTTPS **code-editor container** (e.g. `*.builtwithrocket.new`) — NOT the Flutter app
- If `status.Name !== "running"` → show "Container is sleeping" UI with link to open in Rocket.new

#### Step 2 — Get file list from S3 project-structure (JWT auth required)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Headers: { Authorization: "JWT {token}", Content-Type: application/json }
Body: { applicationId: "..." }
→ Returns directory tree: { name, path, type: "file"|"directory", children: [...] }
```

Works even when the container is sleeping. File paths have leading slash (e.g. `/lib/main.dart`) — strip it before use.

#### Step 3 — Fetch each file from the running container (no auth needed!)
```
POST {backendUrl}/api/file-content
Headers: { Content-Type: application/json }   ← NO Authorization header
Body: { path: "lib/main.dart" }               ← key is "path" — NOT "file", "filePath", etc.
→ Returns: { path: "/lib/main.dart", content: "import 'package:flutter/material.dart';\n..." }
```

- Body key **must** be `path` — any other key returns 422
- No auth, no subscription check
- Returns `500 { error: "Failed to read file content" }` for files not on the container — skip these
- Fetched in parallel batches of 20

#### Container Sleeping UI
When `status.Name !== "running"`, push.tsx shows a purple "Container is sleeping" card with:
- App name
- **"Open in Rocket.new"** button → links to `https://rocket.new/{appId}`
- **"Try again"** button to re-ping after the user wakes it

### S3 File Content — Fallback Only (often broken)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/file-content
Headers: { Authorization: "JWT {token}" }
Body: { applicationId: "...", file: "lib/main.dart" }   ← key is "file" here (NOT "path")
```
Returns 500 for many projects because S3 cache is stale. Used only when the container approach fails entirely.

### CRITICAL: Never call `loginToBack()`

There is no session exchange needed. The JWT token from OTP login works directly on `back.rocket.new` via `Authorization: Bearer`. `loginToBack()` tries 10+ failing endpoints and adds 20–30 seconds of invisible delay. It always returns `null`. The function is kept in the file but never called.

### CRITICAL: Never use the SSE endpoint for file fetching

The SSE stream at `gateway.rocket.new/api/v1/thread/conversation` was the previous fallback strategy. **It does NOT work:**
- Only sends `heartbeat` then `PLACEHOLDER` events
- The `backendUrl` never arrives via SSE, even when the container IS running
- The correct approach is the `production-deploy/ping` REST endpoint (Step 1 above)

### WRONG Rocket.new endpoints (do NOT use)

- ❌ `https://api.base44.com/...` — wrong server entirely
- ❌ `GET {backendUrl}/api/download-project` — returns 400 "You don't have active subscription"
- ❌ `https://application.rocket.new/apis/v1/application/production-deploy/ping` as GET — only POST works
- ❌ Any endpoint on `back.rocket.new` without `companyId` header — returns empty list
- ❌ SSE stream at `gateway.rocket.new/api/v1/thread/conversation` for backendUrl — never delivers it
- ❌ `{ file: "..." }` body key on `{backendUrl}/api/file-content` — must use `{ path: "..." }`

---

## ⚠️ Critical: Floot Publish API

Reverse-engineered June 2026 by live bundle analysis and API probing. All endpoints confirmed working.

### Authentication

Every request uses the session cookie. The Push44 proxy (`/api/floot`) converts the `X-Floot-Token` header into `Cookie: nextauth.session-token={token}` server-side.

### tRPC Body Format

Floot uses **legacy raw tRPC input** — no `{"json":...}` wrapper:

```
✅ POST body: {"type":"prod","id":"..."}
❌ POST body: {"json":{"type":"prod","id":"..."}}   ← returns 400 "Workspace ID is required"
```

Same for queries: `?input={"id":"..."}` raw — never `?input={"json":{...}}`.

### Endpoint: Check Deployment Status

```
GET /_api/workspace/deployment?workspaceId={workspaceId}
```

Response shapes:
```json
{ "type": "notDeployed" }

{ "type": "deploying", "subdomain": "my-app", "status": "building",
  "customDomains": [], "includeMadeWithFloot": true, "buildMobileApps": false }

{ "type": "deployed", "subdomain": "my-app", "customDomains": [],
  "deploymentInfo": { "lastDeployedAt": "2026-06-30T...", "deploymentStatus": "completed" },
  "includeMadeWithFloot": true, "buildMobileApps": false }

{ "type": "error", "subdomain": "my-app", "message": "Build failed: ..." }
```

### Endpoint: Trigger Deploy

```
POST /api/trpc/workspace.requestDeploy
Content-Type: application/json
```

First deploy:
```json
{ "type": "prod", "id": "{workspaceId}", "subdomain": "{slug}",
  "includeMadeWithFloot": true, "buildMobileApps": false }
```

Republish (workspace already deployed):
```json
{ "type": "prodUpdate", "id": "{workspaceId}", "subdomain": "{existing_or_new_slug}",
  "includeMadeWithFloot": true, "buildMobileApps": false }
```

Success response: `{ "result": { "data": {} } }` or `{ "result": { "data": "building" } }`

Live URL after deploy: `https://{slug}.floot.app`

### ⚠️ Corrections vs Research Doc

The original research doc has two errors (disproved by live testing June 2026):

1. **`includeMadeWithFloot: false` does NOT trigger a build.** The API returns `{}` (no error) but the status never leaves `notDeployed`. Must use `true`.
2. **Status is NOT `notDeployed` while building.** Real flow: `notDeployed` → `deploying` (status: `"building"`) → `deployed`.

### Full Publish Flow

```
1. GET /_api/workspace/deployment?workspaceId={id}
   → notDeployed: show subdomain picker
   → deployed:    show live URL + Update option
   → deploying:   show "building…" spinner and start polling

2. Validate subdomain client-side: /^[a-z0-9-]{3,}$/
   (No server-side availability check — none exists; format validation is enough)

3. POST /api/trpc/workspace.requestDeploy  (raw body, includeMadeWithFloot: true)
   → 200 = deploy queued

4. Poll GET /_api/workspace/deployment?workspaceId={id} every 10s
   → deployed: show https://{subdomain}.floot.app  ✅
   → error:    show error message
   Build takes ~45s for first deploy, ~30s for updates
```

### Real-Time Alternative

Floot uses **PartyKit WebSocket** (`publish.completed` / `publish.failed` events) as its in-browser notification mechanism. REST polling via `/_api/workspace/deployment` is equivalent and simpler.

### Error Codes

| Error | Meaning |
|---|---|
| `"Workspace ID is required"` | Used `{"json":{...}}` wrapper — send raw body instead |
| `"Removing Floot logo is a paid feature"` | Sent `includeMadeWithFloot: false` — use `true` |
| 400 with Zod errors | Missing required fields |
| 401 | Session token expired |

---

## ⚠️ Critical: Vite Import Rule

`@lovable.dev/vite-tanstack-config` **blocks any file whose path matches `**/server/**`** from being imported in client code.

**Never put `createServerFn` files in a `server/` subdirectory.** All server functions live directly in `src/lib/`.

---

## ⚠️ Critical: Static Assets

The Vite dev server does **not** serve `public/` in development. Static files needed by the UI must be imported as ES modules from `src/assets/`:

```ts
import appLogo from "@/assets/logo.png";   // ✅ works in dev + prod
// <img src="/logo.png" />                 // ❌ 404 in dev
```

`public/` is served in production only — used for `robots.txt`, `sitemap.xml`, and `logo.png` (OG image).

---

## ⚠️ Critical: SSR Hydration

Any value from `new Date()`, `Math.random()`, or `localStorage` must be initialised inside `useEffect` (client-only), never at render time.

```tsx
const [greeting, setGreeting] = useState("");
useEffect(() => {
  const h = new Date().getHours();
  setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
}, []);
```

---

## ⚠️ Critical: Base44Logo `white` Prop

Always pass `white` when placing the logo on any orange or dark background — without it the orange PNG is invisible:

```tsx
<Base44Logo size={20} white />   // on orange/dark backgrounds
<Base44Logo size={20} />         // on white/light backgrounds
```

---

## ⚠️ Critical: GitHubLogo Opacity

`GitHubLogo` has no `style` prop — inline opacity is silently ignored. Wrap in a `div`:

```tsx
<div style={{ opacity: 0.08 }} className="pointer-events-none">
  <GitHubLogo size={110} className="text-white" />
</div>
```

---

## GitHub Push Flow

Uses GitHub's **Trees API** for efficient bulk commits:

1. `GET /user` — validate token + get username
2. `GET /repos/{owner}/{repo}/git/refs/heads/{branch}` — get current HEAD
3. `GET /repos/{owner}/{repo}/git/commits/{sha}` — get base tree SHA
4. `POST /repos/{owner}/{repo}/git/blobs` — create blob per file (parallel)
5. `POST /repos/{owner}/{repo}/git/trees` — create tree with all blobs
6. `POST /repos/{owner}/{repo}/git/commits` — create commit
7. `PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}` — update branch ref

If repo is brand new/empty (no HEAD), skips steps 2–3 and uses `POST /git/refs` instead of `PATCH`.

---

## Credentials & Storage

All stored in **browser localStorage only** — nothing is ever sent to any server except directly to Base44, Rocket.new, and GitHub APIs.

```typescript
"b44push_credentials"  // {
//   githubToken, githubUsername,
//   base44Token, base44Email,
//   rocketToken, rocketEmail, rocketCompanyId,  ← Rocket.new
//   defaultBranch, displayName, ...
// }
"b44push_history"      // PushRecord[] (max 100 entries)
"b44push_onboarded"    // boolean
```

---

## SEO Setup

All SEO lives in `src/routes/__root.tsx`:

- Global meta: title, description, keywords, robots, theme-color
- Open Graph: og:title, og:description, og:url, og:image (`/logo.png`), og:type
- Twitter Card: summary card with image
- JSON-LD: `WebApplication` schema
- Favicon + Apple touch icon: Vite-imported logo
- Canonical URL: `https://push-44.vercel.app`

Each route has its own `head()` with specific `<title>` and `<meta description>`.

---

## Running the App

```bash
bun run dev    # starts on port 5000
```

---

## What's Working

- ✅ Base44 login (email/password + paste-token)
- ✅ Base44 login — Google account guidance (detects "Invalid email or password" and guides user to API token tab)
- ✅ Rocket.new login (OTP email flow via `/auth/v3/rocket/send-otp` + `/auth/v3/rocket/verify-email-otp`)
- ✅ GitHub PAT connection + validation
- ✅ List all Base44 apps
- ✅ List all Rocket.new apps (paginated `chat-thread/search` with `companyId` header)
- ✅ Base44 sandbox auto-wake before fetching files
- ✅ Base44 file fetch (~87 files)
- ✅ Rocket.new file fetch — ping container → S3 file list → per-file from container (confirmed end-to-end)
- ✅ Rocket.new "Container is sleeping" UI with Open in Rocket.new link + Try again button
- ✅ List all GitHub repos (sorted by last updated)
- ✅ Create new GitHub repo (public or private)
- ✅ Push all files in one commit via Trees API
- ✅ Push history saved to localStorage
- ✅ Dashboard — time-based greeting, hero, stats, last push, recent repo
- ✅ Repositories page — all GitHub repos with metadata
- ✅ History page — all past pushes with status
- ✅ Settings page — manage all credentials
- ✅ First-run onboarding wizard
- ✅ Mobile-first responsive design (~390px, bottom nav, cream `#f3f2ee` palette)
- ✅ Desktop layout — sidebar nav + topbar
- ✅ SEO — meta, OG, Twitter Card, JSON-LD, sitemap, robots
- ✅ Deployed to Vercel at https://push-44.vercel.app

---

## Suggested Next Steps

- **Token expiry detection** — if stored Base44/GitHub token is rejected (401), show a re-login banner automatically instead of a cryptic error
- **File diff preview** — show which files changed since last push before committing
- **Multiple branches** — support branch selection per push (currently always pushes to default branch)
- **GitHub OAuth** — replace manual PAT entry with proper OAuth flow
- **OG image** — create a proper 1200×630 social preview image
- **Google Search Console** — submit sitemap at https://push-44.vercel.app/sitemap.xml

---

## User Preferences

- Keep all server functions in `src/lib/` (never in `src/lib/server/` — blocked by vite config)
- Mobile-first design (~390px wide, bottom nav, no desktop sidebar on mobile)
- Use `bun` for all package operations
- Use `sonner` for toast notifications
- Store credentials in localStorage only, never server-side
- Brand logos in `src/components/BrandLogos.tsx`
- App logo imported as ES module from `src/assets/` — never as `/logo.png` in JSX
- Any `new Date()` / time-sensitive values must be computed in `useEffect` (SSR hydration safety)
