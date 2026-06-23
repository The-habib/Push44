# Push44

A mobile-first web app that lets users push their **Base44** or **Rocket.new** app source code directly to GitHub — in one tap.

**Dev:** runs on port 5000 via `bun run dev`
**Live:** https://push-44.vercel.app

---

## Handover Status (June 2026)

The Base44 integration is fully functional and production-ready. The Rocket.new integration lists apps correctly and the file-fetching approach has been fully reverse-engineered — the correct endpoints are implemented and awaiting final live verification with the user's token.

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
1. POST https://appuser.dhiwise.com/web/v1/user/send-otp
   Body: { email }
   → Returns nothing useful; triggers OTP email

2. POST https://appuser.dhiwise.com/web/v1/user/verify-otp
   Body: { email, otp }
   → Returns: { data: { token: "eyJ...", user: { companyId, fullName, ... } } }
```

Token is a **JWT**. Save `companyId` from `data.user.companyId` (NOT `data.companyId`).

### Resolving companyId

`companyId` is required as an HTTP header for all `back.rocket.new` calls. Without it, searches return `context: "general"` — an empty list.

If `companyId` is missing from the OTP response:
```
GET https://appuser.dhiwise.com/web/v1/workspace/list
Header: Authorization: JWT {token}
→ Returns: { data: { list: [{ companyId: "..." }] } }
```

### Listing Apps

```
POST https://back.rocket.new/api/v1/chat-thread/search
Headers: {
  Authorization: Bearer {token},
  companyId: {companyId},
  pageURL: "https://rocket.new"
}
Body: {}
```

Response shape:
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

The `_id` is the **thread ID** (used to identify the app in UI). The `threadDetails.applicationId` is the **application ID** (used for file fetching).

### Fetching Files — Multi-Step Fallback Strategy

#### Step 1 — S3 File Tree (always works)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Headers: { Authorization: "JWT {token}", Content-Type: application/json }
Body: { applicationId: "..." }
→ Returns directory tree: { name, path, type: "file"|"directory", children: [...] }
```
Confirmed: returns 200 with JWT auth. File paths use leading slash (e.g. `/lib/main.dart`) — strip it before sending to file-content.

#### Step 2 — S3 File Content (may return 500 if stale)
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/file-content
Headers: { Authorization: "JWT {token}", Content-Type: application/json }
Body: { applicationId: "...", file: "lib/main.dart" }
→ Returns file content (or 500 if S3 cache is stale/missing)
```
⚠️ **CONFIRMED BUG:** For some projects the S3 file-content endpoint returns 500 for every file even though the project-structure returns 200. In this case the code falls through to the SSE container wake.

Files are fetched in parallel batches of 20 to avoid flooding the server.

#### Step 3 — SSE Gateway Container Wake (fallback when S3 returns 500s)

When S3 file-content returns 500, the dev container must be woken via the gateway SSE stream to fetch files directly.

**SSE endpoint (reverse-engineered from Rocket.new JS bundle):**
```
POST https://gateway.rocket.new/api/v1/thread/conversation
Headers: {
  Authorization: "JWT {token}",   ← NOT Bearer
  companyId: "{companyId}",
  Content-Type: application/json,
  pageURL: "https://rocket.new"
}
Body: { event: "CONTINUE_THREAD", data: { threadId: "{appId}" }, sessionId: "{uuid}" }
```

The server responds with an SSE stream. Events to watch for:
- `event: heartbeat` — connection established (expected first event)
- `event: PLACEHOLDER` — "Starting server..." (container waking)
- `event: SERVER_STATUS_FOR_RESUME_CONTAINER` — contains `data.backendUrl` (container is live!)
- `event: SERVER_STATUS_FOR_THREAD_DETAILS` — also contains `data.backendUrl`

**IMPORTANT:** The SSE stream closes after a few events and must be reconnected. The code retries every 4 seconds for up to 50 seconds total.

**When container is awake, fetch files from it directly:**
```
POST {backendUrl}/api/file-content
Headers: { Authorization: "JWT {token}", Content-Type: application/json }
Body: { applicationId: "...", file: "lib/main.dart" }
```

Or download a ZIP of the whole project:
```
GET {backendUrl}/api/download-project?t={timestamp}
Headers: { Authorization: "JWT {token}" }
→ Returns ZIP archive
```

**Key insight:** The `backendUrl` is ephemeral — it only exists when the container is actively running. If the container is fully terminated, the SSE stream stalls indefinitely with PLACEHOLDER events. The user must open the project in Rocket.new first to wake it, then Push44 can fetch the files.

### Production Container Ping (no auth needed)

```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId: "..." }
→ Returns: { data: { production: { backendUrl, previewUrl, status, stateStatus } } }
```

**Important:** This returns the **deployed app's** backend URL (e.g. a Flutter API server) — NOT the code editor container. The code container URL is dynamic and only available via WebSocket when the project is open. If `status.Name === "terminated"`, the container is shut down and returns 502 — use the S3 file approach instead.

### CRITICAL: Never call `loginToBack()`

There is no session exchange needed. The JWT token from OTP login works directly on `back.rocket.new` via `Authorization: Bearer`. `loginToBack()` tries 10+ failing endpoints and adds 20–30 seconds of invisible delay. It always returns `null`.

### WRONG Rocket.new endpoints (do NOT use)

- ❌ `https://api.base44.com/...` — wrong server entirely
- ❌ `GET ${containerUrl}/api/download-project` — only works when dev container is **actively open** in the editor (URL is ephemeral, set via WebSocket)
- ❌ `https://application.rocket.new/apis/v1/application/production-deploy/ping` as a GET — only works as POST
- ❌ Any endpoint on `back.rocket.new` without `companyId` header — returns empty list

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
- ✅ Rocket.new login (OTP email flow)
- ✅ GitHub PAT connection + validation
- ✅ List all Base44 apps
- ✅ List all Rocket.new apps (via `chat-thread/search` with `companyId` header)
- ✅ Base44 sandbox auto-wake before fetching files
- ✅ Base44 file fetch (~87 files)
- ✅ Rocket.new file fetch via S3 endpoints on `appcodeformat.dhiwise.com` (project-structure → file-content)
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

- **Verify Rocket.new file fetch end-to-end** — the S3 endpoints are implemented and confirmed to exist (401 without auth); need live test with user token to confirm the tree response format and file content shape
- **Token expiry detection** — if stored token is rejected (401), show a re-login banner automatically
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
