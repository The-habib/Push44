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

Push44 currently supports 4 platforms. Each has its own API file in `src/lib/`:

| Platform | File | Auth method |
|---|---|---|
| Base44 | `base44-api.ts` | Email/password or API token |
| Rocket.new | `rocket-api.ts` | OTP email |
| Floot | `floot-api.ts` | Magic link (NextAuth) |
| Zite | `zite-api.ts` | Google / Microsoft / Email |

All reverse-engineered from live JS bundles — no public API docs exist for any of these platforms. See README.md for the confirmed working endpoints.

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
