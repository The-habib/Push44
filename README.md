<div align="center">
  <br />
  <img src="public/logo.png" alt="Push44" width="88" style="border-radius:20px" />
  <h1>Push44</h1>
  <p><strong>Push your Base44 apps to GitHub in one tap.</strong><br/>
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

  <img src="public/logo.png" alt="Push44 Screenshot" width="680" />

  <br /><br />
</div>

---

## What is Push44?

Push44 is a free, open-source web app that lets you **version-control your Base44 app source code to GitHub in a single click**.

It fetches all your app files directly from the Base44 sandbox and commits them to any GitHub repository using one atomic push — no CLI, no copy-pasting, no manual uploads.

> **Base44** is a vibe-coding platform. Push44 solves the missing link: giving your generated apps proper version control on GitHub.

---

## Features

| | Feature | Description |
|---|---|---|
| ⚡ | **One-tap push** | All 87+ source files committed in a single click |
| 🌳 | **GitHub Trees API** | Efficient bulk commits — no file-by-file uploads |
| 🔄 | **Auto sandbox wake** | Sleeping sandboxes are woken automatically before fetching |
| 📋 | **Full push history** | Every push logged with commit hash, file count, branch & timestamp |
| 🔒 | **Zero data stored** | Credentials never leave your browser — no backend server |
| 🌿 | **Any repo, any branch** | Push to existing repos or create a new one on the fly |
| 📱 | **Mobile-first** | Works perfectly on iPhone and Android — push from anywhere |
| 🆓 | **Free forever** | No subscription, no rate limits, no account required |

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│  1. Connect Base44    →   2. Select your app        │
│  3. Pick a GitHub repo →  4. Tap Push               │
│                                                     │
│  Push44 fetches all files via the sandbox API,      │
│  then commits them to GitHub using the Trees API    │
│  — all in one atomic commit, in under 5 seconds.   │
└─────────────────────────────────────────────────────┘
```

**Under the hood — GitHub push flow:**

1. `GET /user` — validate token + get username
2. `GET /repos/{owner}/{repo}/git/refs/heads/{branch}` — get current HEAD
3. `GET /repos/{owner}/{repo}/git/commits/{sha}` — get base tree SHA
4. `POST /repos/{owner}/{repo}/git/blobs` — create blob for each file (parallel)
5. `POST /repos/{owner}/{repo}/git/trees` — create tree with all blobs
6. `POST /repos/{owner}/{repo}/git/commits` — create commit
7. `PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}` — update branch ref

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) v1.167+ (SSR React router) |
| UI | React 19 + [Tailwind CSS 4](https://tailwindcss.com) |
| Build | Vite 8 |
| Animations | [Framer Motion](https://www.framer.com/motion/) 12 |
| Package manager | **bun** |
| Toasts | [sonner](https://sonner.emilkowal.ski/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A [Base44](https://app.base44.com) account
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
│   ├── index.tsx          Landing page (public, SEO-optimised)
│   ├── dashboard.tsx      Main dashboard with stats & recent activity
│   ├── push.tsx           Core push flow (select app → fetch → commit)
│   ├── settings.tsx       Credential management
│   ├── repositories.tsx   GitHub repo browser
│   ├── history.tsx        Push history
│   └── onboarding.tsx     First-run setup wizard
├── lib/
│   ├── base44-api.ts      Base44 API client (server functions)
│   ├── github-api.ts      GitHub API client (server functions)
│   └── storage.ts         localStorage helpers
├── components/
│   ├── AppShell.tsx       Layout shell (sidebar + mobile nav)
│   └── BrandLogos.tsx     Base44Logo + GitHubLogo components
└── contexts/
    └── AppContext.tsx     Global credential state
```

---

## Privacy & Security

Push44 has **no backend server**. Everything runs in your browser:

- Your Base44 credentials go directly to `app.base44.com`
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
- [ ] File diff preview before committing
- [ ] Multiple branch support per push
- [ ] Organisation/workspace app support
- [ ] Token expiry auto-detection with re-auth prompt
- [ ] Proper OG image (1200×630)

---

## Base44 API Reference

> The official docs are outdated. These endpoints were discovered by live testing.

| Action | Method | Endpoint |
|---|---|---|
| Login | POST | `https://app.base44.com/api/auth/login` |
| Validate token | GET | `https://app.base44.com/api/auth/me` |
| List apps | GET | `https://app.base44.com/api/apps` |
| Check sandbox | GET | `https://app.base44.com/api/apps/{id}/sandbox/status` |
| Wake sandbox | POST | `https://app.base44.com/api/apps/{id}/sandbox/wake` |
| Fetch files | GET | `https://app.base44.com/api/apps/{id}/sandbox/files` |

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>
    Built with ❤️ for the Base44 community<br/>
    <a href="https://push-44.vercel.app">push-44.vercel.app</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/The-habib/Push44/issues">Report a bug</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/The-habib/Push44/issues">Request a feature</a>
  </p>
</div>
