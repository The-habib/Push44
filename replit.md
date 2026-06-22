# Push44

A mobile-first web app that lets users log in with their Base44 account and push their Base44 app source code directly to GitHub — in one tap.

**Dev:** runs on port 5000 via `bun run dev`
**Live:** https://push-44.vercel.app

---

## Handover Status (June 2026)

This project is fully functional, production-ready, and SEO-optimised. Everything below describes the current working state so the next developer can pick up immediately.

---

## What This App Does

1. User logs in with their Base44 email + password (or pastes an auth token)
2. User connects a GitHub Personal Access Token
3. User selects one of their Base44 apps
4. App wakes the sandbox if needed, then fetches all source files
5. App pushes all files to a GitHub repo in a single commit (using the Trees API)
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
│   ├── push.tsx          — Main push flow (select app → wake sandbox → fetch files → pick repo → commit)
│   ├── settings.tsx      — Base44 login modal + GitHub PAT + preferences
│   ├── repositories.tsx  — Lists all user's GitHub repos
│   ├── history.tsx       — Push history from localStorage
│   └── onboarding.tsx    — First-run wizard (Base44 login → GitHub connect)
├── lib/
│   ├── base44-api.ts     — All Base44 server functions (login, list apps, wake sandbox, fetch files)
│   ├── github-api.ts     — All GitHub server functions (user, repos, create repo, push)
│   ├── storage.ts        — localStorage helpers (credentials + push history)
│   └── utils.ts          — Tailwind cn() helper
├── contexts/
│   └── AppContext.tsx    — Global credential state, persisted to localStorage
├── assets/
│   ├── logo.png                     — App logo: cat in orange box (used in header, onboarding, favicon)
│   ├── base44-logo.png              — Original Base44 logo (orange circle mark)
│   └── base44-logo-transparent.png  — Base44 logo with background removed
└── components/
    ├── AppShell.tsx      — Mobile shell (left-aligned logo header, bottom nav, SectionCard, AvatarBubble)
    ├── BrandLogos.tsx    — Base44Logo (img, supports `white` prop) + GitHubLogo (SVG Invertocat)
    └── ui/               — shadcn/ui components (button, card, etc.)

public/
├── logo.png       — App logo served at /logo.png (used for OG image meta tag on Vercel)
├── robots.txt     — Allows all crawlers, points to sitemap
└── sitemap.xml    — All 6 routes with priorities and change frequencies
```

---

## ⚠️ Critical: Real Base44 API Endpoints

**These were discovered by live testing** — the official docs are wrong/outdated.

| Action | Method | Endpoint | Notes |
|---|---|---|---|
| Login | POST | `https://app.base44.com/api/auth/login` | Body: `{email, password}` |
| Validate token | GET | `https://app.base44.com/api/auth/me` | Returns user object directly |
| List apps | GET | `https://app.base44.com/api/apps` | Returns plain array |
| Check sandbox | GET | `https://app.base44.com/api/apps/{id}/sandbox/status` | Returns `{"status":"alive"}` |
| Wake sandbox | POST | `https://app.base44.com/api/apps/{id}/sandbox/wake` | Call if status ≠ "alive" |
| **Fetch files** | GET | `https://app.base44.com/api/apps/{id}/sandbox/files` | See below |

**WRONG endpoints (do NOT use):**
- ❌ `https://api.base44.com/v1/...` — this server returns HTML 404s
- ❌ `/apps/{id}/files` — 404
- ❌ `/apps/{id}/code` — returns 412 "App does not support direct file reads"
- ❌ `/auth/device` — 404 (no device code flow exists publicly)

### Login Response Shape
```json
{
  "success": true,
  "access_token": "eyJhbGci...",
  "user": {
    "email": "user@example.com",
    "full_name": "Username",
    "id": "...",
    "api_key": "32charkey..."
  }
}
```
Token key is **`access_token`** (NOT `token`). User name is **`full_name`** (NOT `name`).

### `/auth/me` Response Shape
Returns the user object **directly** (no `.user` wrapper):
```json
{ "email": "...", "full_name": "...", "api_key": "...", ... }
```

### `/sandbox/files` Response Shape
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
Keys are file paths, values are file content strings. A typical app has **~87 files**.

**Important:** The sandbox must be `"alive"` before fetching files. The code auto-wakes the sandbox (POST to wake endpoint, polls status, retries) before fetching files. The push UI shows "Waking up sandbox…" after a 3-second delay if still waiting.

---

## ⚠️ Critical: Vite Import Rule

`@lovable.dev/vite-tanstack-config` **blocks any file whose path matches `**/server/**`** from being imported in client code.

**Never put `createServerFn` files in a `server/` subdirectory.**

All server functions live directly in `src/lib/` (e.g., `src/lib/base44-api.ts`, `src/lib/github-api.ts`).

---

## ⚠️ Critical: Static Assets

The Vite dev server does **not** serve the `public/` directory in development. Static files needed by the UI (logo, etc.) must be imported as ES modules from `src/assets/`:

```ts
import appLogo from "@/assets/logo.png";   // ✅ works in dev + prod
// <img src="/logo.png" />                 // ❌ 404 in dev
```

The `public/` directory **is** served by Nitro/Vercel in production — it's used only for files that must be accessible at a bare URL path: `robots.txt`, `sitemap.xml`, and `logo.png` (for the OG image meta tag).

---

## ⚠️ Critical: SSR Hydration

This is a TanStack Start SSR app. Any value computed from `new Date()`, `Math.random()`, or `localStorage` must be initialised inside `useEffect` (client-only), never at render time. Otherwise React throws a hydration mismatch error.

**Pattern for time-sensitive values:**
```tsx
const [greeting, setGreeting] = useState("");
useEffect(() => {
  const h = new Date().getHours();
  setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
}, []);
```

---

## ⚠️ Critical: Base44Logo `white` Prop

The `Base44Logo` component (`src/components/BrandLogos.tsx`) accepts a `white` boolean prop. **Always pass `white` when placing the logo on any orange or dark background** — without it the orange PNG logo is invisible against orange:

```tsx
<Base44Logo size={20} white />   // on orange/dark backgrounds
<Base44Logo size={20} />         // on white/light backgrounds
```

---

## ⚠️ Critical: GitHubLogo Opacity

`GitHubLogo` only accepts `className`, `size`, `color`, and `strokeWidth` props — **no `style` prop**. Inline `style={{ opacity: ... }}` is silently ignored. Always wrap in a `div` to apply opacity:

```tsx
<div style={{ opacity: 0.08 }} className="pointer-events-none">
  <GitHubLogo size={110} className="text-white" />
</div>
```

---

## GitHub Push Flow

Uses GitHub's **Trees API** for efficient bulk commits (no file-by-file uploads):

1. `GET /user` — validate token + get username
2. `GET /repos/{owner}/{repo}/git/refs/heads/{branch}` — get current HEAD
3. `GET /repos/{owner}/{repo}/git/commits/{sha}` — get base tree SHA
4. `POST /repos/{owner}/{repo}/git/blobs` — create blob for each file (parallel)
5. `POST /repos/{owner}/{repo}/git/trees` — create tree with all blobs
6. `POST /repos/{owner}/{repo}/git/commits` — create commit
7. `PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}` — update branch ref

If the repo is brand new/empty (no HEAD), skips steps 2–3 and uses `POST /git/refs` instead of `PATCH`.

---

## Credentials & Storage

All stored in **browser localStorage only** — nothing is ever sent to any server except directly to Base44 and GitHub APIs.

```typescript
// localStorage keys:
"b44push_credentials"  // { githubToken, githubUsername, base44Token, base44Email, defaultBranch, displayName, ... }
"b44push_history"      // PushRecord[] (max 100 entries)
"b44push_onboarded"    // boolean — whether the user has completed first-run onboarding
```

The `AppContext` loads these on mount and provides `updateCreds()` / `signOut()`.

---

## SEO Setup

All SEO lives in `src/routes/__root.tsx`. Key things in place:

- **Global meta:** title, description, keywords, author, robots, theme-color
- **Open Graph:** og:title, og:description, og:url, og:image (`/logo.png`), og:type, og:locale
- **Twitter Card:** summary card with image
- **JSON-LD structured data:** `WebApplication` schema (name, URL, category: DeveloperApplication, free offer, feature list)
- **Favicon:** `<link rel="icon">` pointing to the Vite-imported `logoUrl`
- **Apple touch icon:** same logo
- **Canonical URL:** `https://push-44.vercel.app`
- **Sitemap link:** `<link rel="sitemap">`

Each route has its own `head()` with a specific `<title>` and `<meta description>`.

**To get Google to index it:** submit the site + sitemap (`/sitemap.xml`) in Google Search Console.

---

## Running the App

```bash
bun run dev    # starts on port 5000
```

The workflow "Start application" runs this automatically.

---

## What's Working (fully built)

- ✅ First-run onboarding wizard (`/onboarding`) — multi-step: welcome → Base44 login → GitHub PAT connect
- ✅ Base44 login (email/password modal with two tabs: login & paste-token)
- ✅ GitHub Personal Access Token connection + validation
- ✅ List all Base44 apps
- ✅ Auto sandbox wake-up — polls status and wakes automatically before fetching files
- ✅ Fetch all source files from a Base44 app's sandbox (~87 files)
- ✅ List all GitHub repos (sorted by last updated)
- ✅ Create new GitHub repo (public or private)
- ✅ Push all files in one commit via Trees API
- ✅ Push history saved to localStorage
- ✅ Dashboard (`/`) — time-based greeting, hero card, live stats, last push, recent repo
- ✅ Repositories page (`/repositories`) — lists all GitHub repos with metadata
- ✅ History page (`/history`) — shows all past pushes with status
- ✅ Settings page (`/settings`) — manage Base44 + GitHub credentials
- ✅ Custom app logo (cat in orange box) — in header, onboarding, browser tab, iOS home screen
- ✅ Mobile header — logo left-aligned, avatar right (no empty spacer)
- ✅ Real brand logos — Base44Logo (PNG, `white` prop) + GitHubLogo (SVG Invertocat)
- ✅ Mobile-first responsive design (~390px wide, bottom nav, cream `#f3f2ee` palette)
- ✅ Desktop layout — sidebar nav + topbar
- ✅ User avatar bubble showing initials from logged-in user's name
- ✅ SEO — meta tags, OG, Twitter Card, JSON-LD, sitemap.xml, robots.txt, per-route titles
- ✅ Deployed to Vercel at https://push-44.vercel.app

---

## Suggested Next Steps

- **Public landing page:** A static `/` route that Google can crawl without JavaScript — hero, feature bullets, screenshots, CTA
- **Token expiry detection:** If stored token is rejected (401), show a re-login banner automatically
- **Org/workspace apps:** Base44 has org-scoped apps — `GET /organizations/{orgId}/apps` — not currently fetched
- **File diff preview:** Show which files changed since the last push before committing
- **Multiple branches:** Currently pushes to one branch; support branch selection per push
- **GitHub OAuth:** Replace manual PAT entry with proper GitHub OAuth flow for better UX
- **OG image:** Create a proper 1200×630 social preview image (current OG image is the square logo)
- **Google Search Console:** Submit sitemap at https://push-44.vercel.app/sitemap.xml to accelerate indexing

---

## User Preferences

- Keep all server functions in `src/lib/` (never in `src/lib/server/` — blocked by vite config)
- Mobile-first design (~390px wide, bottom nav, no desktop sidebar on mobile)
- Use `bun` for all package operations
- Use `sonner` for toast notifications
- Store credentials in localStorage only, never server-side
- Brand logos in `src/components/BrandLogos.tsx` — `Base44Logo` (with `white` prop) and `GitHubLogo`
- App logo (`src/assets/logo.png`) imported as ES module — never referenced as `/logo.png` in JSX
- Any `new Date()` / time-sensitive values must be computed in `useEffect` (SSR hydration safety)
