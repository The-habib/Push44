# Contributing to Push44

Thanks for your interest in contributing! Push44 is a fully client-side open-source app — no backend, no database, no accounts. Every feature lives in plain TypeScript + React and talks directly to external APIs.

---

## Table of Contents

1. [Development Setup](#1-development-setup)
2. [Architecture Overview](#2-architecture-overview)
3. [Code Style & Conventions](#3-code-style--conventions)
4. [Adding a New Platform Integration](#4-adding-a-new-platform-integration)
5. [Key Gotchas & Traps](#5-key-gotchas--traps)
6. [Pull Request Process](#6-pull-request-process)
7. [Good First Issues](#7-good-first-issues)

---

## 1. Development Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| [Bun](https://bun.sh/) | ≥ 1.1 | `curl -fsSL https://bun.sh/install \| bash` |
| Node.js | ≥ 20 (fallback only) | — |
| Git | any | — |

### First-time setup

```bash
git clone https://github.com/The-habib/Push44.git
cd Push44
bun install
bun run dev        # starts on http://localhost:5000
```

### Environment

There are **no environment variables**. Push44 is fully client-side — all credentials are entered by the user in the Settings UI and stored only in their browser's `localStorage`.

### Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Dev server on port 5000 with HMR |
| `bun run build` | Production build into `dist/` |
| `bun run preview` | Serve the production build locally |

---

## 2. Architecture Overview

### Directory layout

```
src/
├── routes/          TanStack Start file-based routes (each file = one page)
├── lib/             All API logic — one file per external platform
├── components/      Shared React components
├── contexts/        Global React state (credentials, persisted to localStorage)
└── assets/          Images imported as ES modules (not served from public/)
```

### Data flow

```
User action
  → React component (routes/)
      → server function call (lib/*.ts)
          → fetch() directly to external API
              → response back to component
                  → state update → re-render
```

There is no intermediary server. All `fetch()` calls go directly to the external platform APIs (Base44, Rocket.new, GitHub) from the user's browser.

### Routing

Push44 uses **TanStack Start** (file-based SSR router). Each file in `src/routes/` automatically becomes a route. The `__root.tsx` file is the root layout — it contains the `AppShell` (header + nav) and global `<head>` meta tags.

The `OnboardingGuard` in `__root.tsx` redirects unauthenticated users to `/onboarding` before they can reach any protected page.

### State management

All credential state lives in `src/contexts/AppContext.tsx`. It exposes:

```ts
const { creds, setCreds, isLoaded } = useApp();
```

`creds` is a single object persisted to `localStorage` under `b44push_credentials`. It contains:

```ts
{
  githubToken, githubUsername,
  base44Token, base44Email,
  rocketToken, rocketEmail, rocketCompanyId,
  defaultBranch, displayName,
}
```

Push history is stored separately under `b44push_history` (array of `PushRecord`, max 100 entries). File snapshots for diff tracking are stored under `push44_snapshots_{appId}`.

### API layer (`src/lib/`)

Each platform has its own file. All functions that make network requests are plain `async` functions exported from the file. They are called directly from route components — there is no store, no React Query, no middleware layer.

```
src/lib/
├── base44-api.ts    Base44 REST API (login, list apps, sandbox, files)
├── rocket-api.ts    Rocket.new (OTP auth, list apps, file fetch, APK build)
├── github-api.ts    GitHub REST API (user, repos, branches, Trees API push)
└── storage.ts       localStorage read/write helpers
```

---

## 3. Code Style & Conventions

### General

- **TypeScript everywhere** — no `any` unless you're intentionally handling an unknown external payload
- **Tailwind CSS 4** — no config file, utility classes inline in JSX
- **Framer Motion** for all animations — use `AnimatePresence` for enter/exit, `motion.div` for transitions
- **sonner** for toast notifications — `toast.success()`, `toast.error()`
- **lucide-react** for icons

### Component patterns

```tsx
// ✅ Local state with useEffect for anything that touches Date, Math.random, or localStorage
const [greeting, setGreeting] = useState("");
useEffect(() => {
  setGreeting(new Date().getHours() < 12 ? "Good morning" : "Good afternoon");
}, []);

// ❌ Never at render time — breaks SSR hydration
const greeting = new Date().getHours() < 12 ? "Good morning" : "Good afternoon";
```

```tsx
// ✅ Import images as ES modules
import logo from "@/assets/logo.png";
<img src={logo} />

// ❌ Never as /public path in JSX — 404s in dev
<img src="/logo.png" />
```

```tsx
// ✅ Wrap opacity on GitHubLogo in a div
<div style={{ opacity: 0.08 }}>
  <GitHubLogo size={110} className="text-white" />
</div>

// ❌ GitHubLogo has no style prop — inline opacity is silently ignored
<GitHubLogo size={110} style={{ opacity: 0.08 }} />
```

### Brand colors

```ts
const ROCKET_COLOR  = "#7f22fe";
const ROCKET_GRAD   = "linear-gradient(135deg,#9810fa,#7008e7)";
const ROCKET_LIGHT  = "rgba(127,34,254,0.06)";
const ROCKET_BORDER = "rgba(127,34,254,0.2)";
const ROCKET_TEXT   = "#6d28d9";

// Base44
const B44_GRAD   = "linear-gradient(135deg,#fb923c,#f97316)";
const B44_COLOR  = "#f97316";
```

### File placement rule

> **Never put files in a `server/` subdirectory.**

`@lovable.dev/vite-tanstack-config` blocks any import whose path matches `**/server/**`. All API functions (including `createServerFn` calls) must live directly in `src/lib/`, not in `src/lib/server/`.

---

## 4. Adding a New Platform Integration

This is the most common type of contribution. Here's the full pattern:

### Step 1 — Create `src/lib/{platform}-api.ts`

```ts
// src/lib/myplatform-api.ts

const API_BASE = "https://api.myplatform.com";

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginToMyPlatform({
  data,
}: {
  data: { email: string; password: string };
}): Promise<{ token: string; username: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, password: data.password }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const json = await res.json();
  return { token: json.token, username: json.user.name };
}

// ── Apps ────────────────────────────────────────────────────────────────────

export async function listMyPlatformApps({
  data,
}: {
  data: { token: string };
}): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`${API_BASE}/apps`, {
    headers: { Authorization: `Bearer ${data.token}` },
  });
  if (!res.ok) throw new Error(`Failed to list apps (${res.status})`);
  const json = await res.json();
  return json.apps.map((a: any) => ({ id: a.id, name: a.name }));
}

// ── Files ────────────────────────────────────────────────────────────────────

export async function fetchMyPlatformFiles({
  data,
}: {
  data: { token: string; appId: string };
}): Promise<Array<{ path: string; content: string }>> {
  const res = await fetch(`${API_BASE}/apps/${data.appId}/files`, {
    headers: { Authorization: `Bearer ${data.token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch files (${res.status})`);
  const json = await res.json();
  // Return an array of { path, content } — this is what the push flow expects
  return Object.entries(json.files as Record<string, string>).map(
    ([path, content]) => ({ path, content })
  );
}
```

### Step 2 — Add credentials to `AppContext`

Open `src/contexts/AppContext.tsx` and add your credential fields:

```ts
export interface Credentials {
  // ...existing fields...
  myPlatformToken?: string;
  myPlatformEmail?: string;
}
```

### Step 3 — Add a login UI to Settings

Open `src/routes/settings.tsx`. Add a new credential card following the same pattern as the Base44 or Rocket.new card. The card should:
- Show a "Connected" badge when `creds.myPlatformToken` is set
- Have a form to enter credentials
- Call your login API function on submit
- Call `setCreds({ ...creds, myPlatformToken: token })` on success

### Step 4 — Wire into the push flow

Open `src/routes/push.tsx`:

1. Add your platform to the `Platform` type:
   ```ts
   type Platform = "base44" | "rocket" | "myplatform";
   ```

2. Add a tab to `PlatformToggle` following the existing pattern.

3. Add a branch to `loadApps()`:
   ```ts
   } else if (platform === "myplatform") {
     setApps(await listMyPlatformApps({ data: { token: creds.myPlatformToken! } }));
   }
   ```

4. Add a branch to `handleSelectApp()`:
   ```ts
   } else if (platform === "myplatform") {
     loadedFiles = await fetchMyPlatformFiles({ data: { token: creds.myPlatformToken!, appId: app.id } });
   }
   ```

5. Add a brand logo to `src/components/BrandLogos.tsx`.

### Step 5 — Add to `storage.ts` localStorage key

Open `src/lib/storage.ts` and add your token to the `Credentials` interface and the `b44push_credentials` localStorage key shape. No migration is needed — missing fields default to `undefined`.

---

## 5. Key Gotchas & Traps

### SSR hydration

TanStack Start renders on the server first. Anything that differs between server and client — `new Date()`, `Math.random()`, `localStorage` — must only run inside `useEffect`, never at the top level of a component or in initial state.

```tsx
// ✅ Safe
const [time, setTime] = useState("");
useEffect(() => { setTime(new Date().toLocaleTimeString()); }, []);

// ❌ Breaks hydration
const time = new Date().toLocaleTimeString();
```

### Vite server/ path block

`@lovable.dev/vite-tanstack-config` statically blocks imports from any path matching `**/server/**`. This is enforced at build time. Keep all API functions in `src/lib/*.ts`.

### Base44Logo white prop

Always pass `white` when the logo sits on an orange or dark background:

```tsx
<Base44Logo size={20} white />   // on orange/dark bg
<Base44Logo size={20} />         // on white/light bg
```

Without `white`, the orange PNG is invisible against an orange background.

### Rocket.new response encryption

Many Rocket.new API responses are AES-256-CBC encrypted (shape: `{ requestAnchor, processedContent }`). Always pipe them through `rocketDecrypt()` (defined at the top of `rocket-api.ts`) before reading any fields. The AES key is hardcoded from the Rocket.new JS bundle.

### Rocket.new companyId header

Every call to `back.rocket.new` requires a `companyId` HTTP header. Without it the endpoint returns `context: "general"` — an empty app list with no error. Pass `companyId` from `creds.rocketCompanyId`.

### Rocket.new auth header format varies by server

| Server | Header |
|---|---|
| `appuser.dhiwise.com` | `Authorization: JWT {token}` |
| `back.rocket.new` | `Authorization: Bearer {token}` |
| `application.rocket.new` | `Authorization: Bearer {token}` |
| `appcodeformat.dhiwise.com` | `Authorization: JWT {token}` |
| `{backendUrl}/api/file-content` | **No auth header** |

---

## 6. Pull Request Process

1. **Fork** the repo and create a branch: `git checkout -b feature/your-feature`
2. Make your changes. Run `bun run dev` and test the affected flows manually.
3. Keep commits focused — one logical change per commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add Rocket.new APK download`
   - `fix: handle empty repo on first push`
   - `docs: update Rocket.new API reference`
4. Push and open a PR against `main`. Fill in the PR template with:
   - **What** — what does this PR add or fix?
   - **Why** — what problem does it solve?
   - **How tested** — what did you test manually?
5. PRs are reviewed and merged by the maintainer. There are no automated tests — manual testing of the affected flow is expected.

### Commit message format

```
<type>(<scope>): <short description>

feat(rocket):   add APK build progress polling
fix(github):    handle empty repo on first push
fix(base44):    detect Google-linked account on login error
docs:           update Rocket.new API reference in README
refactor(push): extract StagingBrowser into its own component
```

---

## 7. Good First Issues

If you're new to the codebase, these are self-contained and well-scoped:

- **APK build history** — Store past APK build timestamps/status in `localStorage` and display them in the History page
- **iOS/IPA export** — Rocket.new may support IPA builds; research the bundle endpoint and add support alongside the APK panel
- **Dark mode** — Add a `prefers-color-scheme` toggle; the Tailwind 4 setup should make this straightforward
- **OG image** — Create a proper 1200×630 social preview image and update the `<meta og:image>` tag in `__root.tsx`
- **Token expiry banner** — Detect 401 responses and show a persistent re-auth banner without a full page error (partial support already exists in `push.tsx`)
- **GitHub OAuth** — Replace manual PAT entry with a proper OAuth flow (requires a small redirect-handling server or a serverless function)

---

<div align="center">
  <p>Questions? Open an <a href="https://github.com/The-habib/Push44/issues">issue</a> or start a <a href="https://github.com/The-habib/Push44/discussions">discussion</a>.</p>
</div>
