# Push44 CLI (p44)

> Universal Command-Line Interface for AI vibe-coding platforms.  
> Export source code, synchronize with GitHub, build mobile APKs, deploy live apps, and automate releases.

[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?style=flat-square&logo=bun)](https://bun.sh)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](../LICENSE)

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

### Run Directly with Bun
```bash
bun run cli --help
```

---

## ✦ Quickstart Workflow

```bash
# 1. Authenticate with your platform and GitHub
push44 login rocket
push44 github login

# 2. List your projects across all platforms
push44 apps

# 3. Clone an AI project into a local Git directory
push44 clone my-flutter-app

# 4. Enter project directory, edit code, inspect diff
cd my-flutter-app
push44 diff

# 5. Automatically commit and push changes back to GitHub
push44 sync

# 6. Run doctor to audit environment health & connections
push44 doctor

# 7. Automated release pipeline
push44 release v1.0.0
```

---

## ✦ Command Reference

### `push44 login [platform]`
Authenticate with any supported AI platform or GitHub.
```bash
push44 login base44 --email user@example.com --password mypass
push44 login rocket --email user@example.com --otp 123456
push44 login floot --token <nextauth.session-token>
push44 login github --token <ghp_token>
```

### `push44 auth` (alias: `push44 whoami`)
Inspect connection matrix, account details, and token validity across all platforms.

### `push44 apps [platform]`
List projects across platforms with interactive clone selection.
```bash
push44 apps               # all platforms
push44 apps base44        # specific platform
push44 apps -i            # interactive picker
push44 apps --json        # JSON output
```

### `push44 clone <app-id>`
Reconstruct the complete directory structure, preserve filenames/assets, and initialize local Git.
```bash
push44 clone app_12345 --platform base44 --out my-app
```

### `push44 pull`
Pull latest remote updates from the linked platform into the current directory.

### `push44 diff`
Show file additions (`+`), modifications (`~`), and deletions (`-`) relative to the last sync snapshot.
```bash
push44 diff        # local vs last snapshot
push44 diff --live # local vs live platform version
```

### `push44 sync`
Detect modifications, stage changes, generate a meaningful commit message, and atomically push to GitHub.
```bash
push44 sync
push44 sync -y -m "feat: add user authentication component"
```

### `push44 push`
Atomic multi-file commit via GitHub Trees API (works for existing repos or automatically creates new ones).
```bash
push44 push --repo my-org/my-repo --branch main
```

### `push44 doctor`
Complete environment, runtime, dependency, platform connectivity, and permission audit with actionable recommendations.
```bash
push44 doctor
```

### `push44 backup`
Export all connected AI projects into timestamped ZIP archives.
```bash
push44 backup --all
push44 backup --platform rocket --out ./archives
```

### `push44 apk [build|status|download]`
Manage mobile Android builds on Rocket.new.
```bash
push44 apk build <thread-id> --watch --out ./release.apk
push44 apk status <thread-id>
push44 apk download <thread-id>
```

### `push44 badge remove <platform> [app-id]`
Remove watermark branding badges from Floot, Zite, Bolt, or Lovable.

### `push44 deploy [platform]`
Trigger live hosting deployments (e.g. Floot apps to `https://<subdomain>.floot.app`).

### `push44 watch`
Live file watcher with optional `--auto-sync` on save.

### `push44 release [versionTag]`
End-to-end release pipeline: sync -> commit -> push -> GitHub Release tag -> watch GitHub Actions CI workflow.

---

## ✦ Environment Variables

Push44 CLI seamlessly reads from environment variables (and Replit Secrets):

```bash
export PUSH44_GITHUB_TOKEN="ghp_..."
export PUSH44_BASE44_TOKEN="b44_..."
export PUSH44_ROCKET_TOKEN="eyJ..."
export PUSH44_FLOOT_TOKEN="..."
export PUSH44_ZITE_SESSION="..."
export PUSH44_BOLT_TOKEN="..."
export PUSH44_LOVABLE_TOKEN="..."
```

---

## ✦ Security & Encryption

- Secrets are never printed in plain text to the terminal.
- Credentials stored locally in `~/.push44/credentials.enc` are encrypted with **AES-256-GCM** using a machine-derived key.
- Zero telemetry, zero external third-party logging. Direct HTTPS communication between your shell and the target platform API.

---

## ✦ License

MIT © [Push44 Team](https://push44.vercel.app)
