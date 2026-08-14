# Push44 CLI (p44)

> Universal Command-Line Interface for AI vibe-coding platforms.  
> Export source code, synchronize with GitHub, build mobile APKs, deploy live apps, automate releases, and inspect project architecture.

[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?style=flat-square&logo=bun)](https://bun.sh)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](../LICENSE)

---

## ✦ Features & Modern Design

- **Claude Code Interactive REPL**: Run `push44` with no args to enter an interactive session with quick slash commands.
- **Anthropic-Styled Aesthetic**: Warm TrueColor gradient banners, rounded cards (`╭─╮`, `│`, `╰─╯`), status badges, and tree views.
- **AI-Assisted Commit Generator**: Automatically formats conventional commits (`feat(ui)`, `feat(auth)`, `chore(config)`) based on code diffs.
- **Tech Stack & Architecture Inspector**: Detects Frameworks (React 19, Vite, TanStack, Next.js, Flutter), UI kits, and dependencies.
- **Activity & Streak Dashboard**: Visual weekly synchronization frequency chart and push streak tracker.
- **Cross-Platform Project Comparator**: Compare project versions and file divergences side-by-side.
- **Platform Migration Analyzer**: Assess code compatibility when migrating between AI platforms.
- **Universal Zero-Dependency Bundle**: Self-contained 850 KB executable running on Node.js 18+ and Bun.

---

## ✦ Supported Platforms

| Platform | Web Address | Auth Method | Capabilities |
|---|---|---|---|
| **Base44** | `app.base44.com` | Email + Password / API Token | Full Source Export, Sandbox Auto-Wake |
| **Rocket.new** | `rocket.new` | Email OTP / API Token | Flutter Code Export, APK Build & Download, Keystore Gen |
| **Floot** | `floot.com` | Session Token | Reference API Export, Web Deployment, Badge Removal |
| **Zite** | `build.fillout.com` | Email + Password / Session | Snapshot Export, Badge Removal, Auto-Publish |
| **Bolt.new** | `bolt.new` | Session Cookie | Live Bundle Export, Badge Removal |
| **Lovable.dev** | `lovable.dev` | Email + Password / Firebase Token | Smart Path Probing, Git Tree Export, Badge Removal |
| **GitHub** | `github.com` | Personal Access Token | Atomic Trees API Commits, Repo Management, Releases, CI Watch |

---

## ✦ Installation

### Quick Install (Linux, macOS, Replit, Termux)
```bash
curl -fsSL https://raw.githubusercontent.com/The-habib/Push44/main/install.sh | sh
```

### Global Install via Bun / npm
```bash
bun add -g push44
# or
npm install -g push44
```

### Run Directly in Workspace
```bash
bun run cli
```

---

## ✦ Command Reference

### `push44` (or `push44 shell`)
Launch the interactive terminal REPL with live status ribbons and quick slash commands (`/apps`, `/diff`, `/sync`, `/inspect`, `/stats`, `/doctor`).

### `push44 stats` (alias: `push44 dashboard`)
Inspect weekly push frequency charts, push streak counter, and commit history.

### `push44 inspect`
Deep architectural analysis detecting Frameworks, Tailwind/CSS engines, UI primitives, integrations, and visual file trees with icons.

### `push44 compare <app1> <app2>`
Side-by-side comparison of two AI projects showing common files, unique files, and size divergence.

### `push44 migrate <appId> <targetPlatform>`
Analyze compatibility and translate project files when migrating across platforms.

### `push44 login [platform]`
Authenticate with any supported AI platform or GitHub.

### `push44 auth` (alias: `push44 whoami`)
Inspect connection matrix, account details, and token validity across all platforms.

### `push44 apps [platform]`
List projects across platforms with interactive clone selection (`-i`).

### `push44 clone <app-id>`
Reconstruct the complete directory structure, preserve filenames/assets, and initialize local Git.

### `push44 pull`
Pull latest remote updates from the linked platform into the current directory.

### `push44 diff`
Visual colored file additions (`+`), modifications (`~`), and deletions (`-`) relative to the last sync snapshot.

### `push44 sync`
Detect modifications, stage changes, generate an AI-assisted commit message, and atomically push to GitHub.

### `push44 push`
Atomic multi-file commit via GitHub Trees API.

### `push44 doctor`
Complete environment, runtime, dependency, platform connectivity, and permission audit with actionable `--fix` recommendations.

### `push44 backup`
Export all connected AI projects into timestamped ZIP archives.

### `push44 config [list|get|set]`
Manage global CLI preferences (default branch, default platform, default repo).

### `push44 completion [bash|zsh|fish]`
Generate shell tab auto-completion scripts.

---

## ✦ License

MIT © [Push44 Team](https://push44.vercel.app)
