# Agent & AI Contributor Guidelines

This file contains guidance for AI coding agents (GitHub Copilot, Cursor, Claude, etc.) contributing to Push44.

---

## Project Summary

Push44 is a **fully client-side** React + Vite web app. There is no backend server, no database, and no environment variables. All credentials are stored in the user's browser `localStorage` and all API calls go directly from the browser to external services (Base44, Rocket.new, Floot, Zite, GitHub).

**Live:** https://push44.vercel.app  
**Stack:** TanStack Start v1 · React 19 · Tailwind CSS 4 · Vite 8 · Bun

---

## Critical Rules

### 1. Never put files in a `server/` directory

`@lovable.dev/vite-tanstack-config` blocks any import whose path matches `**/server/**` at build time. All API functions and server functions must live in `src/lib/*.ts`, never in `src/lib/server/`.

### 2. SSR hydration — no Date/random/localStorage at render time

TanStack Start renders on the server first. Values that differ between server and client must be initialized in `useEffect`, not at the top level of a component:

```tsx
// ✅ Safe
const [greeting, setGreeting] = useState("");
useEffect(() => {
  const h = new Date().getHours();
  setGreeting(h < 12 ? "Good morning" : "Good afternoon");
}, []);

// ❌ Breaks hydration
const greeting = new Date().getHours() < 12 ? "Good morning" : "Good afternoon";
```

### 3. Static assets must be imported as ES modules

The Vite dev server does not serve `public/` in development. Import images from `src/assets/`:

```ts
import logo from "@/assets/logo.png"; // ✅
// <img src="/logo.png" />            // ❌ 404 in dev
```

### 4. Use bun — not npm or yarn

All package operations use `bun`. Never run `npm install` or `yarn add`.

### 5. No backend, no secrets, no server-side state

Never add: Express/Fastify servers, database connections, `.env` secrets, server-side sessions, or any infrastructure that requires a server process. Push44 is intentionally zero-backend.

---

## Supported Platforms

Push44 currently supports 6 AI vibe-coding platforms:

| Platform | File | Auth method | Key Features |
|---|---|---|---|
| Base44 | `base44-api.ts` | Email/password or API token | File extraction, AI CSS injection, Live badge removal, Deploy trigger |
| Bolt.new | `bolt-api.ts` | Session cookie or PKCE login | Auto /chats discovery, Live HTML/bundle extraction, Staging & Promote |
| Rocket.new | `rocket-api.ts` | OTP email | Container files, Android APK build compilation & polling |
| Floot | `floot-api.ts` | Magic link (NextAuth) | Project extraction, Custom subdomain deploy, Mobile build |
| Zite | `zite-api.ts` | Google / Microsoft / Email | Snapshot templates, Cloudflare Worker CSS blocker injection |
| Lovable.dev | `lovable-api.ts` | Session token | Project extraction, AI code editing for badge removal |

---

## Confirmed Working Endpoints

All endpoints below were reverse-engineered from production JS bundles and verified in live sessions:

### 1. Base44 (`app.base44.com/api`)
- **Auth Login**: `POST /auth/login` (Payload: `{ email, password }` -> returns `{ access_token, user }`)
- **Auth Check**: `GET /auth/me` (Bearer auth -> returns `{ email, full_name, id }`)
- **List Apps**: `GET /apps` (Bearer auth -> returns `Base44App[]` with `id`, `name`, `slug`, `last_deployed_at`)
- **App Published URL**: `GET /apps/platform/:appId/published-url` (Returns `{ url: "https://<slug>.base44.app" }`)
- **Sandbox Files Tree**: `GET /apps/:appId/sandbox/files` (Returns full source tree `{ files: [{ path, content }] }`)
- **Sandbox Status**: `GET /apps/:appId/sandbox/status` (Returns `{ status: "alive" }`)
- **Sandbox File Read**: `GET /apps/:appId/sandbox/files/content?path=<path>` (Returns file content `{ content: string }`)
- **Sandbox Direct File Write**: `PUT /apps/:appId/sandbox/files/content` (Payload: `{ path, content }` -> writes directly to sandbox with zero AI credits needed)
- **Create Checkpoint**: `POST /apps/:appId/app-checkpoints` (Payload: `{ name }` -> creates version checkpoint from sandbox `{ id, created: true }`)
- **Static Build Status**: `GET /apps/:appId/static/build-status` (Returns `{ build_ready: boolean, commit_hash: string }`)
- **Live Deployment Trigger**: `POST /apps/:appId/deploy`
  - Rebuilds production Vite bundle with the injected stylesheet and deploys live to Cloudflare edge (`https://<slug>.base44.app`).
  - Payload: `{ checkpoint_id?: string }`
  - Response: `{ id, slug, last_deployed_at, last_deployed_checkpoint_id, status: { state: "ready" } }`

### 2. Bolt.new (`bolt.new/api`)
- **PKCE OAuth2 Login**: `POST /api/bolt-login` (Proxied login -> StackBlitz OAuth -> returns `__session` token)
- **Auto Workspace Discovery**: `GET /chats` (Headers: `X-Bolt-Token: <token>` -> returns list of all user workspaces and project chats without requiring manual project IDs)
- **Project Details**: `GET /projects/:projectId` (Returns project metadata, deployment info, and live URL `https://<slug>.bolt.host`)
- **Live Asset Extraction**: `GET https://<slug>.bolt.host/` (Fetches HTML to resolve `/assets/index-*.js` bundle)
- **Staging Deploy**: `POST /projects/:projectId/deploys` (Uploads modified ZIP with prepended MutationObserver blocker)
- **Promote to Production**: `POST /projects/:projectId/deploys/:deployId/promote` (Promotes staging build to production URL)

---

## localStorage Keys

```
b44push_credentials   — all platform tokens + GitHub PAT
b44push_history       — PushRecord[] (max 100)
b44push_onboarded     — boolean
push44_snapshots_{id} — per-app file snapshots for diff tracking
```

Never introduce new localStorage keys without updating `src/lib/storage.ts`.

---

## Git Hygiene

- Do not force-push or rebase published commits on `main`
- Keep `main` in a working, deployable state at all times
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- One logical change per commit
