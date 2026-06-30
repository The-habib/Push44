<div align="center">
  <br />
  <img src="public/logo.png" alt="Push44" width="88" style="border-radius:20px" />
  <h1>Push44</h1>
  <p><strong>Push your AI-built app source code to GitHub — in one tap.</strong><br/>
  Supports Base44, Rocket.new, Floot, and Zite. Free, open source, no backend, no accounts.</p>

  <a href="https://push-44.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-push--44.vercel.app-8b5cf6?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo" /></a>
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

Push44 is a free, open-source web app that lets you **version-control your AI-built apps to GitHub in a single click** — with support for **Base44**, **Rocket.new**, **Floot**, and **Zite**.

It fetches all your source files directly from the platform's API and commits them to any GitHub repository using one atomic push — no CLI, no copy-pasting, no manual uploads. For Rocket.new (Flutter/Dart) apps it can also **trigger and download an APK build** directly from the UI.

---

## Supported Platforms

| Platform | Login | App Listing | File Fetch | APK Build |
|---|---|---|---|---|
| [Base44](https://app.base44.com) | Email/password + API token | ✅ | ✅ (sandbox wake) | — |
| [Rocket.new](https://rocket.new) | OTP email | ✅ | ✅ (container ping) | ✅ |
| [Floot](https://floot.com) | Magic link | ✅ | ✅ | — |
| [Zite](https://build.fillout.com) | Google / Microsoft / Email | ✅ | ✅ | — |

---

## Features

| | Feature | Description |
|---|---|---|
| ⚡ | **One-tap push** | All source files committed in a single click via GitHub Trees API |
| 🌐 | **4 platforms** | Base44, Rocket.new, Floot, Zite — switch with one tap |
| 📱 | **APK Build** | Trigger & download Android APK builds for Rocket.new apps (no push required) |
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
1. Connect Base44, Rocket.new, Floot, or Zite  →  2. Select your app
3. Review & stage files                         →  4. Pick a GitHub repo
5. Tap Push                                     →  Done ✓

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
- An account on one or more of the supported platforms
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
│   ├── index.tsx          Redirects to /dashboard or /onboarding
│   ├── dashboard.tsx      Dashboard (greeting, stats, recent pushes)
│   ├── push.tsx           Core push flow (select app → fetch → diff → pick repo → commit)
│   ├── settings.tsx       Credential management (all platforms + GitHub PAT)
│   ├── repositories.tsx   GitHub repo browser
│   ├── history.tsx        Push history from localStorage
│   └── onboarding.tsx     First-run setup wizard
├── lib/
│   ├── base44-api.ts      Base44 API client (login, list apps, wake sandbox, fetch files)
│   ├── rocket-api.ts      Rocket.new API client (OTP login, list apps, fetch files, APK build)
│   ├── floot-api.ts       Floot API client (magic link auth, list apps, fetch files)
│   ├── zite-api.ts        Zite API client (login, list apps, fetch files)
│   ├── github-api.ts      GitHub API client (user, repos, branches, push via Trees API)
│   ├── storage.ts         localStorage helpers (credentials, push history, file snapshots)
│   └── utils.ts           Tailwind cn() helper
├── components/
│   ├── AppShell.tsx       Mobile shell (header, bottom nav) + desktop sidebar
│   ├── BrandLogos.tsx     Base44Logo, GitHubLogo, RocketLogo, FlootLogo, ZiteLogo
│   ├── RocketModal.tsx    Rocket.new OTP login modal
│   ├── FileDiffViewer.tsx Side-by-side file diff viewer
│   └── ui/               shadcn/ui components
├── contexts/
│   └── AppContext.tsx     Global credential state, persisted to localStorage
└── assets/
    ├── logo.png
    ├── base44-logo-transparent.webp
    ├── rocket-logo.png
    ├── floot-logo.png
    └── zite-logo.png

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
- Your Floot credentials go directly to `floot.com`
- Your Zite credentials go directly to `build.fillout.com`
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

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide including how to add a new platform integration.

### Ideas for contributions

- [ ] GitHub OAuth flow (replace manual PAT entry)
- [ ] iOS build support (IPA export for Rocket.new apps)
- [ ] APK build history stored in localStorage
- [ ] Multiple branch support per push
- [ ] Organisation/workspace app support
- [ ] Proper OG image (1200×630)
- [ ] Dark mode
- [ ] Token expiry detection — show re-login banner on 401

---

## API References

> All endpoints below were discovered by reverse-engineering platform JS bundles and confirmed by live testing — no public API documentation exists for any of these platforms.

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

#### Authentication — OTP Flow

```
1. POST https://appuser.dhiwise.com/auth/v3/rocket/send-otp
   Body: { email }

2. POST https://appuser.dhiwise.com/auth/v3/rocket/verify-email-otp
   Body: { email, otp }
   → { data: { token: "eyJ...", user: { companyId, fullName, ... } } }
```

`companyId` from `data.user.companyId` — required as HTTP header for all `back.rocket.new` calls.

Many responses are **AES-256-CBC encrypted** (shape: `{ requestAnchor, processedContent }`). The app handles decryption automatically.

#### Fetch Files — 3 Steps

**Step 1 — Ping container (no auth)**
```
POST https://application.rocket.new/apis/v1/application/production-deploy/ping
Body: { applicationId }
→ { data: { production: { backendUrl, status: { Name: "running" } } } }
```

**Step 2 — File tree (JWT auth)**
```
POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
Authorization: JWT {token}
Body: { applicationId }
```

**Step 3 — Fetch each file (no auth)**
```
POST {backendUrl}/api/file-content
Body: { path: "lib/main.dart" }   ← key MUST be "path"
```

#### APK Build

```
POST https://application.rocket.new/web/v1/playground/make-apk-build    { threadId }
POST https://application.rocket.new/web/v1/playground/apk-build-status  { threadId }
POST https://application.rocket.new/web/v1/playground/download-apk      { threadId }
```

Status codes: `IN_QUEUE=1, IN_PROCESS=2, COMPLETED=3, FAILED=4, REJECTED=5, IDLE=6`

---

### Floot API

> Reverse-engineered from the Floot Next.js bundle. Confirmed by live testing.

| Action | Method | Endpoint |
|---|---|---|
| Request magic link | POST | `https://floot.com/_api/auth/magic-link` |
| Session (via magic link token) | GET | `https://floot.com/_api/auth/session` |
| List apps | POST | `https://floot.com/_api/workspace/reference` with `action: "getInfo"` |
| Fetch files | POST | `https://floot.com/_api/workspace/reference` with `action: "readItems"` |

Auth header: `Authorization: Bearer {JWT session token}`

---

### Zite API

> Reverse-engineered from the Zite/Fillout JS bundle. Confirmed by live testing.

| Action | Method | Endpoint |
|---|---|---|
| Login (proxy) | POST | `https://server.zite.com/admin/zite/auth/login` |
| List apps | GET | `https://server.zite.com/admin/zite/apps` |
| Fetch files | GET | `https://server.zite.com/admin/zite/apps/{id}` |

Files are nested in `response.ziteSnapshot.template.files`.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>
    Built with ❤️ for the AI app-building community<br/>
    <a href="https://push-44.vercel.app">push-44.vercel.app</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/The-habib/Push44/issues">Report a bug</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/The-habib/Push44/issues">Request a feature</a>
  </p>
</div>
