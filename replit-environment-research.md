# Replit Shell Environment Research
Generated: 2026-08-12T20:14:27+00:00

## 1. Environment Identity

| Attribute | Value |
|---|---|
| **Platform** | Replit (Nix-based Linux container) |
| **OS** | Linux `repl 6.18.44` (SMP, Replit-custom kernel) |
| **Hostname** | `helium` (PostgreSQL host) |
| **User** | `runner` (uid=1000, gid=1000) |
| **Working Dir** | `/home/runner/workspace` |
| **REPL_ID** | `ed538583-2b34-48bd-9dab-c0ea1d0f9962` |
| **Cluster** | `pike` |
| **Container** | `repl` |
| **MicroVM** | Enabled (`REPL_IN_MICROVM=true`) |
| **Nix Channel** | `stable-25_05` |

---

## 2. Project: Push44

**What it is:** A fully client-side React + Vite web app for version-controlling AI-built apps to GitHub. Supports 4 platforms: **Base44**, **Rocket.new**, **Floot**, and **Zite**.

| Attribute | Value |
|---|---|
| **Live URL** | `https://push44.vercel.app` |
| **Stack** | React 19 · Vite 8 · TanStack Router v1 · Tailwind CSS 4 · Bun |
| **Build** | `bun run build` → `dist/` (static, deployed to Vercel) |
| **Dev server** | `bun run dev` → Vite on `0.0.0.0:5000` |
| **Node version** | 20.20.0 (wrapped via Nix) |
| **Bun version** | 1.3.6 |

### Project Structure

```
src/
  routes/           TanStack Router file-based routes
  components/       Shared UI (Radix + Tailwind)
  contexts/         React context providers
  hooks/            Custom hooks
  lib/              API clients (base44, rocket, floot, zite, github)
  assets/           Static assets (ES module imports only)
  seo/              SEO generator
  main.tsx / router.tsx
api/                Vite dev-server proxy plugins (6 files)
scripts/            Bun scripts (fix-mobile.ts, generate-seo.ts)
```

### Key Config Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite config + proxy middleware |
| `tsconfig.json` | TS target ES2022, Bundler moduleResolution, path alias `@/*` → `./src/*` |
| `bunfig.toml` | Bun config |
| `eslint.config.js` | ESLint flat config |
| `package.json` | Dependencies + scripts |
| `vercel.json` | Vercel deployment config |
| `.replit` | Replit workflow + port mappings |
| `AGENTS.md` | **Critical rules** for AI contributors |

---

## 3. Critical Rules (from `AGENTS.md`)

1. **No `server/` directories** — `@lovable.dev/vite-tanstack-config` blocks `**/server/**` imports at build time. All API functions must be in `src/lib/*.ts`.
2. **No SSR hydration mismatches** — never use `Date`, `Math.random()`, or `localStorage` at component render time; use `useEffect`.
3. **Static assets via ES modules** — import from `src/assets/`, never reference `/public/` paths (Vite dev doesn't serve `public/`).
4. **Use `bun` only** — never `npm install` or `yarn add`.
5. **Zero backend** — no Express, databases, `.env` secrets, or server-side state. All credentials in browser `localStorage`.

---

## 4. Available System Tools & Binaries

### Language Runtimes
| Tool | Version | Path |
|---|---|---|
| **bun** | 1.3.6 | `/nix/store/.../bun-1.3.6/bin/bun` |
| **node** | 20.20.0 (wrapped) | `/nix/store/.../nodejs-20.20.0-wrapped/bin/node` |
| **npm** | (bundled with node 20) | same as node |
| **npx** | (bundled) | `/nix/store/.../npx/bin/npx` |
| **python3** | 3.13.4 | `/nix/store/.../python3-3.13.4/bin/python3` |
| **pnpm** | 10.26.1 | in PATH |
| **yarn** | 1.22.22 | in PATH |

### Package Managers in PATH
`bun`, `npm`, `npx`, `pnpm`, `yarn`, `prettier` (global)

### System Utilities (partial list from `/usr/bin` and `/bin`)
`bash`, `cat`, `chmod`, `chown`, `cp`, `curl`, `cut`, `date`, `dd`, `df`, `diff`, `du`, `env`, `find`, `grep`, `gzip`, `head`, `kill`, `less`, `ln`, `ls`, `mkdir`, `mv`, `ps`, `pwd`, `rm`, `sed`, `sleep`, `sort`, `ssh`, `tail`, `tar`, `tee`, `time`, `touch`, `tr`, `uniq`, `unzip`, `wc`, `which`, `xargs`, `zip`, `awk`, `base64`, `openssl`, `git`, `node`, `python3`, `perl`

### GitHub / VCS
| Tool | Notes |
|---|---|
| **git** | `/repl/ctls/bin/git` (Replit-managed) |
| **gh** | `/repl/ctls/bin/gh` (GitHub CLI) |

### Replit-Specific Tools
| Tool | Path |
|---|---|
| `artifact-router` | `/nix/store/.../artifact-router-0.1.0/bin/artifact-router` |
| `replit` CLI | `/nix/store/.../replit-cli-0.0.1/bin/replit` |
| `pid1` | `/nix/store/.../pid1-0.0.1/bin/pid0` |
| `replit-runtime-path` | env helper |
| `gcloud` | `/repl/ctls/bin/gcloud` |

### Dev / LSP Tools (running as processes)
| Tool | Version | Notes |
|---|---|---|
| **vite** | 8.1.0 | Dev server (process 186) |
| **typescript-language-server** | 5.1.3 | TS language server |
| **vscode-html-language-server** | 4.10.0 | HTML language server |
| **vscode-css-language-server** | 4.10.0 | CSS language server |
| **taplo** | 0.patched | TOML language server |
| **tsserver** | (from node_modules) | TypeScript compiler server (2 instances) |
| **prettier** | 3.6.2 | Code formatter |
| **eslint** | 10.5.0 | Linter |
| **playwright** | 1.61.1 | E2E testing (Chromium available) |
| **kilo** | (current agent) | AI coding agent CLI |

---

## 5. Running Processes

| PID | CPU | MEM | Command | Role |
|---|---|---|---|---|
| 1 | 0.0% | 4MB | `pid0` | PID 1 init |
| 14 | 0.5% | 46MB | `pid1` | Replit container manager |
| 29 | 0.7% | 318MB | `pid2` | Replit host services |
| 59 | 0.0% | 10MB | `nix-editor` | Nix evaluation |
| **179** | **0.0%** | **10MB** | `bun run dev` | **Vite dev server** |
| **186** | **0.1%** | **155MB** | `node ... vite` | **Vite Node process** |
| 16945 | 0.0% | 6MB | `typescript-language-server --stdio` | TS LSP |
| 16946 | 0.0% | 64MB | `node ... tsserver` | TS server process |
| 16953 | 0.0% | 9MB | `vscode-html-language-server --stdio` | HTML LSP |
| 16956 | 0.2% | 120MB | `node ... html-langserver` | HTML server process |
| 16957 | 0.0% | 9MB | `vscode-css-language-server --stdio` | CSS LSP |
| 16958 | 0.1% | 89MB | `node ... css-langserver` | CSS server process |
| 16959 | 0.0% | 9MB | `taplo lsp -c ... stdio` | TOML LSP |
| 16960 | 0.1% | 89MB | `taplo lsp` | TOML server process |
| 17027 | 0.1% | 103MB | `tsserver.js --serverMode partialSemantic` | TS semantic |
| 17028 | 0.1% | 103MB | `tsserver.js` | TS check |
| 17274 | 0.0% | 6MB | `bash -rcfile ...` | Interactive shell |
| 17304 | 0.0% | 45MB | `node ... kilo` | Kilo agent |
| **17312** | **24.2%** | **1.03GB** | `.kilo` | **Kilo main process (current)** |

---

## 6. Network & Ports

### Configured Ports (from `.replit`)
| Local | External | Exposed | Status |
|---|---|---|---|
| 3000 | — | No | Not active |
| **5000** | **80** | **Yes** | **Active (Vite dev)** |
| 5001 | 3001 | Yes | Available |

### Active TCP Listeners (from `/proc/net/tcp`)
| Address | Port (hex) | Port (dec) | Status |
|---|---|---|---|
| 0.0.0.0 | `0x1388` | **5000** | LISTEN (Vite) |
| 0.0.0.0 | `0x0016` | **22** | LISTEN (SSH) |
| 127.0.0.1 | `0x205B` | 8283 | LISTEN (pid2) |
| 127.0.0.1 | `0x205C` | 8284 | LISTEN (pid2) |
| 127.0.0.1 | `0x0050` | 80 | LISTEN (localhost proxy) |
| 127.0.0.1 | `0x46A0` | 18080 | LISTEN |
| 127.0.0.1 | `0x0452` | 1106 | LISTEN |

### External Connections (ESTABLISHED)
Multiple established connections to `20.24.140.172:43234` (Replit backend services).

---

## 7. Database

| Variable | Value |
|---|---|
| **DATABASE_URL** | `postgresql://postgres:password@helium/heliumdb?sslmode=disable` |
| **PGHOST** | `helium` |
| **PGPORT** | `5432` |
| **PGUSER** | `postgres` |
| **PGPASSWORD** | `password` |
| **PGDATABASE** | `heliumdb` |

> PostgreSQL is available but Push44 itself does **not** use it (no backend). It may be used by Replit infrastructure or other tools.

---

## 8. Skills System

The `.local/skills/` directory contains **~50 specialized skills** available to agents, including:

| Category | Skills |
|---|---|
| **Web/App** | react-vite, expo, slides, mockup-sandbox |
| **AI/LLM** | llm-query, deep-research, ai-recruiter, ai-sdr |
| **Media** | media-generation, image-search, video-editing, remove-image-background |
| **Data** | excel-generator, pdf-processing, stock-analyzer, real-estate-analyzer |
| **Business** | invoicing, meal-planner, travel-assistant, seo-auditor |
| **DevOps** | deployment, repl-setup, replit-migration-guardrails |
| **Security** | security-scan, threat-modeling, environment-secrets |
| **E-commerce** | shopify, stripe, whop, revenuecat |
| **Design** | canvas, design-exploration, infographic-builder, storyboard |
| **Code** | skill-creator, skill-finder, code-review, testing |

---

## 9. Memory / Knowledge Base

The `.agents/memory/` directory contains **~30 detailed research documents** reverse-engineering the 4 supported platforms:

| Document | Content |
|---|---|
| `base44-real-api.md` | Real Base URL: `app.base44.com/api`; token key: `access_token`; files via `/sandbox/files` |
| `base44-google-login.md` | Google-linked accounts can't use email/password |
| `bolt-api.md` | PKCE OAuth2 via stackblitz.com; `POST /api/users/sessions` |
| `floot-auth-reverse-engineering.md` | NextAuth magic link on `floot.com`; session token = Bearer JWT |
| `floot-reference-api.md` | `/_api/workspace/reference` with `action:"getInfo"/"readItems"` |
| `rocket-api-patterns.md` | Ping→file-list→container fetch; `companyId` header required |
| `rocket-apk-max-failed-attempt.md` | APK build reset flow |
| `zite-integration.md` | `build.fillout.com` apps; proxy to `server.zite.com` |
| `zite-badge-removal-api.md` | 4-step badge removal flow |
| `lovable-badge-removal.md` | CSS injection via chat→AI writes to `src/styles.css`→redeploy |
| `github-trees-push.md` | Bulk push: blobs→tree→commit→update ref |
| `file-snapshot-diff.md` | Per-app snapshots in `push44_snapshots_{id}` |
| `MEMORY.md` | Consolidated knowledge base |

---

## 10. Key Environment Variables

| Variable | Value |
|---|---|
| `KILO=1` | Kilo agent active |
| `KILO_PROCESS_ROLE=worker` | Kilo worker mode |
| `KILO_RUN_ID` | `02f242b9-c885-445a-8259-bdc1e6be504b` |
| `REPLIT_DEV_DOMAIN` | `ed538583-...pike.replit.dev` |
| `REPLIT_ENVIRONMENT` | `production` |
| `REPLIT_HELIUM_ENABLED` | `true` |
| `REPLIT_CONNECTORS_HOSTNAME` | `connectors.replit.com` |
| `DATABASE_URL` | PostgreSQL (helium) |
| `PIP_INDEX_URL` | `http://package-firewall.replit.local/pypi/simple/` |
| `GOPROXY` | `http://package-firewall.replit.local/go/` |
| `npm_config_registry` | `http://package-firewall.replit.local/npm/` |

---

## 11. What You Can Do From This Shell

You have full access to:
- **File operations**: read, write, edit, search, glob
- **Command execution**: bash, background processes
- **Web access**: fetch, search (via Kilo tools)
- **Git operations**: git, gh (GitHub CLI)
- **Package management**: `bun install`, `bun add`, `npm install`
- **Dev server**: `bun run dev` (already running on port 5000)
- **Build**: `bun run build`, `bun run preview`
- **Linting/formatting**: eslint, prettier, typescript compiler
- **Testing**: playwright (Chromium available)
- **Agent frameworks**: Kilo (current), OpenCode (installed in `.opencode/`)
- **50+ specialized skills** for development, design, deployment, SEO, media, etc.
- **Extensive reverse-engineered API knowledge** for Base44, Rocket.new, Floot, Zite, Lovable, Bolt
