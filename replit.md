# Push44

A mobile-first web app that lets users log in with their Base44 account and push their Base44 app source code directly to GitHub — in one tap.

**Live URL:** runs on port 5000 via `bun run dev`

---

## Handover Status (June 2026)

This project is fully functional and production-ready. Everything below describes the current working state so the next developer can pick up immediately.

---

## What This App Does

1. User logs in with their Base44 email + password (or pastes an auth token)
2. User connects a GitHub Personal Access Token
3. User selects one of their Base44 apps
4. App fetches all source files from the Base44 sandbox
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
| Icons | lucide-react + custom `BrandLogos.tsx` (real Base44 + GitHub marks) |
| State | React Context (`AppContext`) + localStorage |

---

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx        — root layout, wraps everything in AppProvider
│   ├── index.tsx         — Dashboard (live stats + recent push)
│   ├── push.tsx          — Main push flow (select app → fetch files → pick repo → commit)
│   ├── settings.tsx      — Base44 login modal + GitHub PAT + preferences
│   ├── repositories.tsx  — Lists all user's GitHub repos
│   ├── history.tsx       — Push history from localStorage
│   └── onboarding.tsx    — First-run wizard (Base44 login → GitHub connect)
├── lib/
│   ├── base44-api.ts     — All Base44 server functions (login, list apps, fetch files)
│   ├── github-api.ts     — All GitHub server functions (user, repos, create repo, push)
│   ├── storage.ts        — localStorage helpers (credentials + push history)
│   └── utils.ts          — Tailwind cn() helper
├── contexts/
│   └── AppContext.tsx    — Global credential state, persisted to localStorage
├── assets/
│   ├── base44-logo.png              — Original Base44 logo (orange circle mark)
│   └── base44-logo-transparent.png  — Same logo with background removed (used in UI)
└── components/
    ├── AppShell.tsx      — Mobile shell (bottom nav, header, SectionCard, AvatarBubble)
    ├── BrandLogos.tsx    — Real brand marks: Base44Logo (img) + GitHubLogo (SVG Invertocat)
    └── ui/               — shadcn/ui components (button, card, etc.)
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

**Important:** The sandbox must be `"alive"` before fetching files. If not alive, show an error asking the user to open their app in Base44 first. The code already checks this.

---

## ⚠️ Critical: Vite Import Rule

`@lovable.dev/vite-tanstack-config` **blocks any file whose path matches `**/server/**`** from being imported in client code.

**Never put `createServerFn` files in a `server/` subdirectory.**

All server functions live directly in `src/lib/` (e.g., `src/lib/base44-api.ts`, `src/lib/github-api.ts`).

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

If the repo is brand new/empty (no HEAD), skips steps 2-3 and uses `POST /git/refs` instead of `PATCH`.

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
- ✅ Fetch all source files from a Base44 app's sandbox (87 files tested)
- ✅ List all GitHub repos (sorted by last updated)
- ✅ Create new GitHub repo (public or private)
- ✅ Push all files in one commit via Trees API
- ✅ Push history saved to localStorage
- ✅ Dashboard (`/`) with live stats (app count, repo count, push count)
- ✅ Repositories page (`/repositories`) — lists all GitHub repos with metadata
- ✅ History page (`/history`) — shows all past pushes with status
- ✅ Settings page (`/settings`) — manage Base44 + GitHub credentials
- ✅ Real brand logos throughout — actual Base44 orange logo + official GitHub Invertocat SVG (via `src/components/BrandLogos.tsx`)
- ✅ Mobile-first responsive design (~390px wide, bottom nav, warm cream `#f3f2ee` palette)
- ✅ User avatar bubble in header showing initials from logged-in user's name

---

## Suggested Next Steps

- **Auto sandbox wake-up:** If sandbox status ≠ "alive", wake it automatically and retry instead of showing an error
- **Token expiry detection:** If stored token is rejected (401), show a re-login banner automatically
- **Org/workspace apps:** Base44 has org-scoped apps — `GET /organizations/{orgId}/apps` — not currently fetched
- **File diff preview:** Show which files changed since the last push before committing
- **Multiple branches:** Currently pushes to one branch; support branch selection per push
- **Auto-commit message:** Generate commit message from app name + timestamp automatically
- **GitHub OAuth:** Replace manual PAT entry with proper GitHub OAuth flow for better UX

---

## User Preferences

- Keep all server functions in `src/lib/` (never in `src/lib/server/` — blocked by vite config)
- Mobile-first design (~390px wide, bottom nav, no desktop sidebar)
- Use `bun` for all package operations
- Use `sonner` for toast notifications
- Store credentials in localStorage only, never server-side
- Brand logos in `src/components/BrandLogos.tsx` — `Base44Logo` and `GitHubLogo` components used everywhere
