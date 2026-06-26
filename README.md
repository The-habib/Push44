<div align="center">
  <br />
  <img src="public/logo.png" alt="Push44" width="88" style="border-radius:20px" />
  <h1>Push44</h1>
  <p><strong>Push your Base44 or Rocket.new app source code to GitHub — in one tap.</strong><br/>
  Free, open source, no backend, no accounts.</p>

  <a href="https://push44.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-push--44.vercel.app-8b5cf6?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  &nbsp;
  <a href="https://github.com/The-habib/Push44/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/Built%20with-React%2019-61dafb?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  &nbsp;
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  &nbsp;
  <img src="https://img.shields.io/badge/TanStack%20Start-v1-f97316?style=flat-square" alt="TanStack Start" />

  <br /><br />
</div>

---

## What is Push44?

Push44 is a free, open-source web app that lets you **version-control your vibe-coded apps to GitHub in a single click** — with support for both **Base44** and **Rocket.new** projects.

It fetches all your source files directly from the platform's API and commits them to any GitHub repository using one atomic push — no CLI, no copy-pasting, no manual uploads. For Rocket.new (Flutter/Dart) apps it can also **trigger and download an APK build** directly from the UI.

---

## Features

| | Feature | Description |
|---|---|---|
| ⚡ | **One-tap push** | All source files committed in a single click via GitHub Trees API |
| 🚀 | **Base44 + Rocket.new** | Supports both platforms — switch with one tap |
| 📱 | **APK Build** | Trigger & download Android APK builds for Rocket.new apps |
| 🔄 | **Auto sandbox wake** | Sleeping sandboxes/containers woken automatically before fetching |
| 🌳 | **GitHub Trees API** | Efficient bulk commits — no file-by-file uploads |
| 🔍 | **File diff viewer** | See which files are new, modified, or unchanged before pushing |
| 🗂️ | **Staging browser** | Stage or unstage individual files; mark files for deletion |
| 📦 | **ZIP export** | Download all fetched files as a ZIP before pushing |
| 📋 | **Full push history** | Every push logged with commit hash, file count, branch & timestamp |
| 🔒 | **Zero data stored** | Credentials never leave your browser — no backend server |
| 🌿 | **Any repo, any branch** | Push to existing repos, create new ones, or create branches on the fly |
| 📱 | **Mobile-first** | Works perfectly on iPhone and Android — push from anywhere |
| 🆓 | **Free forever** | No subscription, no rate limits, no account required |

---

## How It Works

```
1. Connect Base44 or Rocket.new  →  2. Select your app
3. Review & stage files          →  4. Pick a GitHub repo
5. Tap Push                      →  Done ✓

Push44 fetches all files from the platform API,
then commits them to GitHub using the Trees API —
all in one atomic commit, in under 10 seconds.
```

**GitHub push flow (under the hood):**

1. `GET /user` — validate token + get username
2. `GET /repos/{owner}/{repo}/git/refs/heads/{branch}` — get current HEAD
3. `GET /repos/{owner}/{repo}/git/commits/{sha}` — get base tree SHA
4. `POST /repos/{owner}/{repo}/git/blobs` — create blob per file (parallel)
5. `POST /repos/{owner}/{repo}/git/trees` — create tree with all blobs
6. `POST /repos/{owner}/{repo}/git/commits` — create commit
7. `PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}` — update branch ref

Empty repos (no HEAD) are handled automatically — uses `POST /git/refs` instead of `PATCH`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) v1.167+ (SSR React router) |
| UI | React 19 + [Tailwind CSS 4](https://tailwindcss.com) |
| Build | Vite 8 via `@lovable.dev/vite-tanstack-config` |
| Animations | [Framer Motion](https://www.framer.com/motion/) 12 |
| Package manager | **bun** |
| Toasts | [sonner](https://sonner.emilkowal.ski/) |
| Icons | [lucide-react](https://lucide.dev/) |
| ZIP | [jszip](https://stuk.github.io/jszip/) |
| Deployment | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A [Base44](https://app.base44.com) account **and/or** a [Rocket.new](https://rocket.new) account
- A [GitHub](https://github.com) Personal Access Token with `repo` + `user` scopes

### Run locally

```bash
# Clone the repo
git clone https://github.com/The-habib/Push44.git
cd Push44

# Install dependencies
bun install

# Start the dev server (runs on port 5000)
bun run dev
```

Open [http://localhost:5000](http://localhost:5000) and follow the onboarding flow.

### Build for production

```bash
bun run build
```

---

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx         Root layout, global SEO meta, JSON-LD, OnboardingGuard
│   ├── index.tsx          Dashboard (greeting, stats, last push, recent repo)
│   ├── push.tsx           Core push flow (select app → fetch → diff → pick repo → commit)
│   ├── settings.tsx       Credential management (Base44, Rocket.new, GitHub PAT)
│   ├── repositories.tsx   GitHub repo browser
│   ├── history.tsx        Push history from localStorage
│   └── onboarding.tsx     First-run setup wizard
├── lib/
│   ├── base44-api.ts      Base44 API client (login, list apps, wake sandbox, fetch files)
│   ├── rocket-api.ts      Rocket.new API client (OTP login, list apps, fetch files, APK build)
│   ├── github-api.ts      GitHub API client (user, repos, branches, push via Trees API)
│   ├── storage.ts         localStorage helpers (credentials, push history, file snapshots)
│   └── utils.ts           Tailwind cn() helper
├── components/
│   ├── AppShell.tsx       Mobile shell (header, bottom nav) + desktop sidebar
│   ├── BrandLogos.tsx     Base44Logo, GitHubLogo, RocketLogo SVG components
│   ├── RocketModal.tsx    Rocket.new OTP login modal
│   ├── FileDiffViewer.tsx Side-by-side file diff viewer
│   ├── AnimatedCorner.tsx Decorative animated background corner
│   └── ui/               shadcn/ui components
├── contexts/
│   └── AppContext.tsx     Global credential state, persisted to localStorage
└── assets/
    ├── logo.png
    ├── base44-logo.png
    └── base44-logo-transparent.png

public/
├── logo.png       OG image (served in production only)
├── robots.txt
└── sitemap.xml
```

---

## Privacy & Security

Push44 has **no backend server**. Everything runs in your browser:

- Your Base44 credentials go directly to `app.base44.com`
- Your Rocket.new credentials go directly to `appuser.dhiwise.com` and `back.rocket.new`
- Your GitHub token goes directly to `api.github.com`
- Nothing is ever stored, logged, or transmitted through our infrastructure
- All data is kept in browser `localStorage` only

You can audit every API call in the `src/lib/` directory.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test them locally with `bun run dev`
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a **Pull Request**

### Ideas for contributions

- [ ] GitHub OAuth flow (replace manual PAT entry)
- [ ] iOS build support (IPA export for Rocket.new apps)
- [ ] APK build history stored in localStorage
- [ ] Multiple branch support per push
- [ ] Organisation/workspace app support
- [ ] Proper OG image (1200×630)
- [ ] Dark mode

---

## API References

> All endpoints below were discovered by reverse-engineering the Rocket.new JS bundle and Base44 live testing — no public API documentation exists for either platform.

### Base44 API

| Action | Method | Endpoint |
|---|---|---|
| Login | POST | `https://app.base44.com/api/auth/login` |
| Validate token | GET | `https://app.base44.com/api/auth/me` |
| List apps | GET | `https://app.base44.com/api/apps` |
| Check sandbox | GET | `https://app.base44.com/api/apps/{id}/sandbox/status` |
| Wake sandbox | POST | `https://app.base44.com/api/apps/{id}/sandbox/wake` |
| Fetch files | GET | `https://app.base44.com/api/apps/{id}/sandbox/files` |

**Login response:** `{ success, access_token, user: { email, full_name, api_key } }`
Token key is `access_token` (not `token`). User name is `full_name` (not `name`).

**`/sandbox/files` response:** `{ app_id, files: { "src/App.jsx": "<content>", ... } }` — keys are paths, values are file content strings.

---

### Rocket.new API

> No public docs exist. All endpoints reverse-engineered from `assets.rocket.new` JS bundles and confirmed by live testing.

#### Base URLs

| Name | URL |
|---|---|
| `AUTH_BASE` | `https://appuser.dhiwise.com` |
| `BACK_BASE` | `https://back.rocket.new` |
| `APP_BASE` | `https://application.rocket.new` |
| `APP_CODE_BASE` | `https://appcodeformat.dhiwise.com` |
| `GATEWAY_BASE` | `https://gateway.rocket.new` |

#### Response Encryption

Many responses are **AES-256-CBC encrypted**. Detect by shape `{ requestAnchor, processedContent }`. Hardcoded AES key from the bundle: `dqf8SIWZdQtptMTEH45CHo4A0DJLrkq02y80wmirLYo` (base64, 32 bytes).

#### Authentication — OTP Flow

```
1. POST https://appuser.dhiwise.com/auth/v3/rocket/send-otp
   Body: { email }
   → triggers OTP email

2. POST https://appuser.dhiwise.com/auth/v3/rocket/verify-email-otp
   Body: { email, otp }
   → { data: { token: "eyJ...", user: { companyId, fullName, ... } } }
```

`companyId` from `data.user.companyId` — required as HTTP header for all `back.rocket.new` calls.

#### List Apps

```
POST https://back.rocket.new/api/v1/chat-thread/search
Headers: { Authorization: "Bearer {token}", companyId: "{companyId}", pageURL: "https://rocket.new" }
Body: { page: 1, limit: 50 }
```

Response list item: `{ _id (thread ID), displayName, threadDetails: { applicationId, languageType } }`. Paginate until fewer than `limit` items returned.

#### Fetch Files — 3 Steps

**Step 1 — Ping container (no auth)**
```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId }
→ { data: { production: { backendUrl: "https://xxx.builtwithrocket.new", status: { Name: "running" } } } }
```

**Step 2 — File tree (JWT auth)**
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Authorization: JWT {token}
Body: { applicationId }
→ directory tree { name, path, type, children }
```

**Step 3 — Fetch each file (no auth)**
```
POST {backendUrl}/api/file-content
Body: { path: "lib/main.dart" }   ← key MUST be "path"
→ { path, content }
```

#### APK Build

DEPLOY_PROGRESS status codes (numeric): `IN_QUEUE=1, IN_PROCESS=2, COMPLETED=3, FAILED=4, QUEUE_BUILD_REJECTED=5, IDLE=6`

```
# Check status
POST https://application.rocket.new/web/v1/playground/apk-build-status
Body: { threadId }   ← _id from app listing, NOT applicationId
→ { data: { status: 1–6, updatedAt } }

# Trigger build
POST https://application.rocket.new/web/v1/playground/make-apk-build
Body: { threadId }

# Get download URL (when status === 3)
POST https://application.rocket.new/web/v1/playground/download-apk
Body: { threadId }
→ { data: { url: "https://s3.amazonaws.com/..." } }
```

All APK endpoints: `Authorization: Bearer {token}`, `companyId` header, `pageURL: https://rocket.new`.

#### Critical Gotchas

- ❌ **Never call `loginToBack()`** — tries 10+ failing endpoints, adds 20-30s delay, always returns `null`
- ❌ **Never use SSE** at `gateway.rocket.new/api/v1/thread/conversation` for file fetching — only sends `heartbeat` then `PLACEHOLDER`, backendUrl never arrives
- ❌ **`back.rocket.new` without `companyId` header** — returns empty list with `context: "general"`
- ❌ **Body key `file` on `{backendUrl}/api/file-content`** — must be `path`, anything else returns 422
- ❌ **`GET /api/download-project`** — returns `400 "You don't have active subscription"`

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>
    Built with ❤️ for the Base44 and Rocket.new community<br/>
    <a href="https://push-44.vercel.app">push-44.vercel.app</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/The-habib/Push44/issues">Report a bug</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/The-habib/Push44/issues">Request a feature</a>
  </p>
</div>
