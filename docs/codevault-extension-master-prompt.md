# CodeVault — Master Build Prompt
### The most advanced, easy-to-use Chrome extension for pushing AI-built apps to GitHub

> **How to use this file:** Paste the entire contents into a Replit Agent (or any AI agent) as your opening prompt. It contains everything needed to build the extension from scratch — architecture, all platform APIs, UI spec, and file structure. No external research required.

---

## 1. Project Overview

Build a **Chrome Extension (Manifest V3)** called **CodeVault** that:

- Detects when the user is on a supported AI builder platform (Base44, Rocket.new, Floot, Zite, bolt.new, Lovable)
- Injects a retractable sidebar into that platform's UI
- Lets the user push all source files directly to GitHub in one click
- Supports auto-push, diff preview, snapshot history, secret scanning, and branch management
- Stores everything locally (IndexedDB + `chrome.storage`) — no backend, no account required
- Handles CORS by routing all external API calls through the extension's background service worker

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 19 + Vite** | Fast builds, HMR in dev, familiar to web devs |
| Language | **TypeScript** | Required for maintainability |
| Styling | **Tailwind CSS v4** | Utility-first, no CSS conflicts with host pages |
| State | **Zustand** | Lightweight, works outside React tree |
| Storage | **IndexedDB** (via `idb`) + `chrome.storage.local` | Persist snapshots and credentials |
| Build | **CRXJS Vite Plugin** | First-class MV3 support, HMR in extension pages |
| Package manager | **Bun** | Fast installs |

---

## 3. Replit Setup Instructions

```bash
# 1. Create project
bun create vite codevault --template react-ts
cd codevault

# 2. Install dependencies
bun add zustand idb
bun add -d @crxjs/vite-plugin tailwindcss @tailwindcss/vite

# 3. Tailwind init
bunx tailwindcss init

# 4. Run dev (Vite builds the extension to /dist)
bun run dev
```

**`vite.config.ts`**
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
});
```

**`.replit`** — add this so the Replit preview shows the build output:
```toml
[[workflows.workflow]]
name = "Build Extension"
[[workflows.workflow.tasks]]
task = "shell.exec"
args = "bun run build --watch"
```

> After building, load `/dist` as an unpacked extension in Chrome at `chrome://extensions`.

---

## 4. File Structure

```
codevault/
├── manifest.json                  # MV3 manifest
├── src/
│   ├── background/
│   │   └── index.ts               # Service worker — all external API calls live here
│   ├── content/
│   │   └── index.tsx              # Injected into each platform tab
│   ├── sidebar/
│   │   ├── Sidebar.tsx            # Root sidebar component
│   │   ├── panels/
│   │   │   ├── PushPanel.tsx      # One-click push UI
│   │   │   ├── DiffPanel.tsx      # Diff viewer
│   │   │   ├── HistoryPanel.tsx   # Snapshot timeline
│   │   │   ├── BranchPanel.tsx    # Branch/PR shortcuts
│   │   │   ├── IgnorePanel.tsx    # .gitignore builder
│   │   │   └── SettingsPanel.tsx  # Credentials + prefs
│   │   └── components/
│   │       ├── FileTree.tsx
│   │       ├── DiffView.tsx
│   │       ├── SecretWarning.tsx
│   │       └── StatusDot.tsx
│   ├── popup/
│   │   └── Popup.tsx              # Extension popup (top-level status)
│   ├── lib/
│   │   ├── platforms/
│   │   │   ├── base44.ts
│   │   │   ├── rocket.ts
│   │   │   ├── floot.ts
│   │   │   ├── zite.ts
│   │   │   ├── bolt.ts
│   │   │   └── lovable.ts
│   │   ├── github-api.ts          # GitHub REST API (blobs, trees, commits)
│   │   ├── detector.ts            # Detects current platform from tab URL
│   │   ├── storage.ts             # IndexedDB snapshots + chrome.storage creds
│   │   ├── secret-scanner.ts      # Regex patterns for leaked secrets
│   │   └── diff.ts                # File diff computation
│   └── types.ts                   # Shared TypeScript types
├── public/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── manifest.json
```

---

## 5. Manifest (manifest.json)

```json
{
  "manifest_version": 3,
  "name": "CodeVault",
  "version": "1.0.0",
  "description": "Push your AI-built apps to GitHub in one click.",
  "icons": {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "128": "icon-128.png"
  },
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": "icon-48.png"
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "https://app.base44.com/*",
        "https://rocket.new/*",
        "https://floot.com/*",
        "https://build.fillout.com/*",
        "https://bolt.new/*",
        "https://lovable.dev/*"
      ],
      "js": ["src/content/index.tsx"],
      "css": ["src/content/sidebar.css"],
      "run_at": "document_idle"
    }
  ],
  "permissions": [
    "storage",
    "cookies",
    "scripting",
    "tabs",
    "identity"
  ],
  "host_permissions": [
    "https://app.base44.com/*",
    "https://appuser.dhiwise.com/*",
    "https://back.rocket.new/*",
    "https://application.rocket.new/*",
    "https://appcodeformat.dhiwise.com/*",
    "https://floot.com/*",
    "https://server.zite.com/*",
    "https://bolt.new/*",
    "https://stackblitz.com/*",
    "https://api.lovable.dev/*",
    "https://identitytoolkit.googleapis.com/*",
    "https://github.com/*",
    "https://api.github.com/*"
  ],
  "oauth2": {
    "client_id": "YOUR_GITHUB_OAUTH_CLIENT_ID",
    "scopes": ["repo", "user"]
  }
}
```

---

## 6. Platform Detector (src/lib/detector.ts)

```ts
export type Platform =
  | "base44"
  | "rocket"
  | "floot"
  | "zite"
  | "bolt"
  | "lovable"
  | null;

export function detectPlatform(url: string): Platform {
  if (url.includes("app.base44.com"))   return "base44";
  if (url.includes("rocket.new"))       return "rocket";
  if (url.includes("floot.com"))        return "floot";
  if (url.includes("build.fillout.com")) return "zite";
  if (url.includes("bolt.new"))         return "bolt";
  if (url.includes("lovable.dev"))      return "lovable";
  return null;
}

export const PLATFORM_META = {
  base44:  { label: "Base44",     color: "#6366f1", domain: "app.base44.com" },
  rocket:  { label: "Rocket.new", color: "#ef4444", domain: "rocket.new" },
  floot:   { label: "Floot",      color: "#3b82f6", domain: "floot.com" },
  zite:    { label: "Zite",       color: "#f59e0b", domain: "build.fillout.com" },
  bolt:    { label: "bolt.new",   color: "#8b5cf6", domain: "bolt.new" },
  lovable: { label: "Lovable",    color: "#ec4899", domain: "lovable.dev" },
};
```

---

## 7. Background Service Worker (src/background/index.ts)

All cross-origin API calls go through the background worker via `chrome.runtime.sendMessage`.
This bypasses CORS entirely since extension service workers are not subject to CORS restrictions.

```ts
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "API_CALL") {
    fetch(msg.url, msg.options)
      .then(async (res) => {
        const text = await res.text();
        sendResponse({ ok: res.ok, status: res.status, body: text });
      })
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true; // keep channel open for async response
  }

  if (msg.type === "GET_COOKIES") {
    chrome.cookies.getAll({ domain: msg.domain }, (cookies) => {
      sendResponse({ cookies });
    });
    return true;
  }
});
```

**Helper used in all platform libs:**
```ts
export async function bgFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const result = await chrome.runtime.sendMessage({
    type: "API_CALL",
    url,
    options: {
      ...options,
      headers: options.headers ?? {},
    },
  });
  if (!result.ok) throw new Error(`${result.status}: ${result.body}`);
  return new Response(result.body, { status: result.status });
}

export async function getCookies(domain: string): Promise<chrome.cookies.Cookie[]> {
  return (await chrome.runtime.sendMessage({ type: "GET_COOKIES", domain })).cookies;
}
```

---

## 8. Platform API Implementations

### 8.1 Base44 (src/lib/platforms/base44.ts)

**Base URL:** `https://app.base44.com/api`
⚠️ NOT `api.base44.com` — that returns Wix 404 pages.

```ts
const BASE = "https://app.base44.com/api";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function base44Login(email: string, password: string) {
  const res = await bgFetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const d = await res.json();
  // Token key is "access_token" NOT "token". Name key is "full_name" NOT "name".
  return { token: d.access_token, email: d.user.email, name: d.user.full_name };
}

export async function base44ValidateToken(token: string) {
  // Returns user object directly — no .user wrapper
  const res = await bgFetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json(); // { email, full_name, api_key, ... }
}

// ── App Listing ───────────────────────────────────────────────────────────────

export async function base44ListApps(token: string) {
  const res = await bgFetch(`${BASE}/apps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Returns a plain array — NOT wrapped in { apps: [] }
  return res.json() as Promise<Array<{
    id: string;
    name: string;
    updated_at: string;
    status: string;
  }>>;
}

// ── File Fetching ─────────────────────────────────────────────────────────────

export async function base44CheckSandbox(token: string, appId: string) {
  const res = await bgFetch(`${BASE}/apps/${appId}/sandbox/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = await res.json();
  return d.status === "alive"; // if false, prompt user to open app in Base44 editor
}

export async function base44FetchFiles(token: string, appId: string): Promise<Record<string, string>> {
  // Always check sandbox status first. If sleeping, the user must open the app
  // in Base44's editor to wake it — there's no API to wake it externally.
  const alive = await base44CheckSandbox(token, appId);
  if (!alive) throw new Error("Sandbox is sleeping. Open this app in Base44 to wake it up.");

  const res = await bgFetch(`${BASE}/apps/${appId}/sandbox/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = await res.json();
  // d.files is { "path/to/file.ts": "file content", ... }
  return d.files;
}

// ── Dead endpoints — DO NOT USE ───────────────────────────────────────────────
// GET /apps/{id}/files        → 404
// GET /apps/{id}/code         → 412 "App does not support direct file reads"
// GET /apps/{id}/export       → 404
// api.base44.com/*            → Wix HTML 404
```

---

### 8.2 Rocket.new (src/lib/platforms/rocket.ts)

**Auth format differs by server — critical:**

| Server | Auth Header |
|---|---|
| `appuser.dhiwise.com` | `Authorization: JWT {token}` |
| `back.rocket.new` | `Authorization: Bearer {token}` |
| `application.rocket.new` | `Authorization: Bearer {token}` |
| `appcodeformat.dhiwise.com` | `Authorization: JWT {token}` |
| `{backendUrl}/api/file-content` | **NO auth header at all** |

```ts
// AES-256-CBC decryption — many Rocket responses are encrypted
const ROCKET_KEY_B64 = "dqf8SIWZdQtptMTEH45CHo4A0DJLrkq02y80wmirLYo";

async function rocketDecrypt(payload: { requestAnchor: string; processedContent: string }) {
  const keyBytes = Uint8Array.from(atob(ROCKET_KEY_B64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.requestAnchor), (c) => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(payload.processedContent), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-CBC", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── Auth — OTP flow ───────────────────────────────────────────────────────────

export async function rocketSendOtp(email: string) {
  await bgFetch("https://appuser.dhiwise.com/auth/v3/rocket/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function rocketVerifyOtp(email: string, otp: string) {
  const res = await bgFetch("https://appuser.dhiwise.com/auth/v3/rocket/verify-email-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  let d = await res.json();
  // Response may be AES encrypted
  if (d.requestAnchor) d = await rocketDecrypt(d);
  // companyId lives at data.user.companyId — NOT data.companyId
  return {
    token: d.data.token,
    companyId: d.data.user.companyId,
    name: d.data.user.fullName,
  };
}

// ── App Listing ───────────────────────────────────────────────────────────────

export async function rocketListApps(token: string, companyId: string) {
  // companyId header is REQUIRED — without it returns empty "general" context
  const res = await bgFetch("https://back.rocket.new/api/v1/chat-thread/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,   // Bearer on back.rocket.new
      companyId,
      pageURL: "https://rocket.new",
    },
    body: JSON.stringify({ page: 1, limit: 50 }),
  });
  let d = await res.json();
  if (d.requestAnchor) d = await rocketDecrypt(d);
  return d.data.list as Array<{
    _id: string;                           // threadId — use for APK builds
    displayName: string;
    threadDetails: { applicationId: string; name: string; languageType: string };
  }>;
}

// ── File Fetching — 3-step flow ───────────────────────────────────────────────

export async function rocketFetchFiles(token: string, applicationId: string): Promise<Record<string, string>> {
  // Step 1: Ping production container (no auth required)
  const pingRes = await bgFetch(
    "https://application.rocket.new/apis/v1/application/production-deploy/ping",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    }
  );
  const pingData = await pingRes.json();
  const backendUrl: string = pingData?.data?.production?.backendUrl;
  const isRunning = pingData?.data?.production?.status?.Name === "running";

  if (!isRunning || !backendUrl) {
    throw new Error("Container is sleeping. Open this app in Rocket.new to wake it up.");
  }

  // Step 2: Get file tree (JWT auth on appcodeformat.dhiwise.com)
  const treeRes = await bgFetch(
    "https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${token}`,    // JWT on appcodeformat.dhiwise.com
      },
      body: JSON.stringify({ applicationId }),
    }
  );
  const treeData = await treeRes.json();

  // Collect all file paths from tree — strip leading slash
  const paths = collectPaths(treeData).map((p) => p.replace(/^\//, ""));

  // Step 3: Fetch each file — NO auth header on backendUrl
  const files: Record<string, string> = {};
  const BATCH = 20;
  for (let i = 0; i < paths.length; i += BATCH) {
    const batch = paths.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (path) => {
        const r = await bgFetch(`${backendUrl}/api/file-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Key MUST be "path" — using "file" or "filePath" returns 422
          body: JSON.stringify({ path }),
        });
        const d = await r.json();
        if (d.content !== undefined) files[path] = d.content;
      })
    );
    // 500 = file not found — skip silently
  }
  return files;
}

function collectPaths(node: any, base = ""): string[] {
  if (!node) return [];
  if (node.type === "file") return [`${base}/${node.name}`];
  const children = node.children ?? node.files ?? [];
  return children.flatMap((c: any) => collectPaths(c, `${base}/${node.name ?? ""}`));
}

// ── DO NOT USE ────────────────────────────────────────────────────────────────
// loginToBack() — tries 10+ endpoints that all fail, adds 20-30s delay, always returns null
// SSE at gateway.rocket.new/api/v1/thread/conversation — never delivers backendUrl
// GET instead of POST on production-deploy/ping — method not allowed
// { file: "..." } body key on backendUrl/api/file-content — returns 422
```

---

### 8.3 Floot (src/lib/platforms/floot.ts)

**Auth:** The extension already has access to floot.com cookies. Use `getCookies("floot.com")` directly — no login flow needed.

```ts
// Floot uses a NextAuth magic link flow; the session cookie is already in the browser.
// The extension reads it directly — no credential entry needed.

async function getFlootSession(): Promise<string> {
  const cookies = await getCookies("floot.com");
  const session = cookies.find(
    (c) => c.name === "__Secure-next-auth.session-token" || c.name === "next-auth.session-token"
  );
  if (!session) throw new Error("Not logged in to Floot. Open floot.com first.");
  return session.value; // use as Bearer JWT
}

// ── App Listing ───────────────────────────────────────────────────────────────
// Floot workspace IDs appear in the URL: floot.com/workspace/{workspaceId}
// Parse the current tab URL to get it.

export function parseFlootWorkspaceId(url: string): string | null {
  const m = url.match(/floot\.com\/workspace\/([a-f0-9-]+)/i);
  return m ? m[1] : null;
}

// ── File Fetching — 2-step flow ───────────────────────────────────────────────

export async function flootFetchFiles(workspaceId: string): Promise<Record<string, string>> {
  const token = await getFlootSession();
  const headers = {
    "Content-Type": "application/json",
    Cookie: `__Secure-next-auth.session-token=${token}`,
  };

  // Step 1: getInfo — fetch project structure
  const infoRes = await bgFetch("https://floot.com/_api/workspace/reference", {
    method: "POST",
    headers,
    body: JSON.stringify({
      action: "getInfo",              // Discriminator MUST be "action" not "type"
      sourceWorkspaceId: workspaceId, // MUST be "sourceWorkspaceId" not "workspaceId"
      include: ["items", "dependencies"],
    }),
  });
  const info = await infoRes.json();
  const items = info.items as {
    components: string[];
    helpers: string[];
    pages: string[];
    endpoints: string[];
    statics: string[];
  };

  // Collect all item names for batched readItems
  const allNames = [
    ...items.pages.map((n) => `pages/${n}`),
    ...items.components.map((n) => `components/${n}`),
    ...items.helpers.map((n) => `helpers/${n}`),
    ...items.endpoints.map((n) => `endpoints/${n}`),
    ...items.statics,
  ];

  // Step 2: readItems in batches of 10
  const files: Record<string, string> = {};
  const BATCH = 10;
  for (let i = 0; i < allNames.length; i += BATCH) {
    const batch = allNames.slice(i, i + BATCH);
    const readRes = await bgFetch("https://floot.com/_api/workspace/reference", {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "readItems",
        sourceWorkspaceId: workspaceId,
        itemNames: batch,
      }),
    });
    const readData = await readRes.json();
    for (const [name, item] of Object.entries(readData.items as Record<string, { code?: string; css?: string }>)) {
      // Map to real file extensions
      if (name.startsWith("pages/") || name.startsWith("components/")) {
        if (item.code !== undefined) files[`src/${name}.tsx`] = item.code;    // use !== undefined not !item.code (preserves empty files)
        if (item.css)               files[`src/${name}.module.css`] = item.css;
      } else if (name.startsWith("helpers/") || name.startsWith("endpoints/")) {
        if (item.code !== undefined) files[`src/${name}.ts`] = item.code;
      } else {
        // statics already have extensions
        if (item.code !== undefined) files[`static/${name}`] = item.code;
      }
    }
  }
  return files;
}
```

---

### 8.4 Zite (src/lib/platforms/zite.ts)

**Base URL:** `https://server.zite.com`
**Origin header is mandatory** — requests without it are rejected.

```ts
const ZITE_BASE = "https://server.zite.com";
const ZITE_ORIGIN = "https://build.fillout.com"; // mandatory — matches host app origin

async function getZiteSession(): Promise<{ session: string; csrf: string }> {
  // Try to read cookies directly from the browser (user is on build.fillout.com)
  const cookies = await getCookies("server.zite.com");
  const session = cookies.find((c) => c.name === "connect.sid")?.value;
  const csrf = cookies.find((c) => c.name === "fillout-csrf-token")?.value;
  if (!session || !csrf) throw new Error("Not logged in to Zite. Open build.fillout.com first.");
  return { session, csrf };
}

function ziteHeaders(session: string, csrf: string): Record<string, string> {
  return {
    Cookie: `connect.sid=${session}; fillout-csrf-token=${csrf}`,
    Origin: ZITE_ORIGIN,      // REQUIRED — server rejects without this
    Referer: `${ZITE_ORIGIN}/`,
    "Content-Type": "application/json",
  };
}

// ── Auth (manual login — fallback if cookie read fails) ───────────────────────

export async function ziteLogin(email: string, password: string) {
  const res = await bgFetch(`${ZITE_BASE}/login/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ZITE_ORIGIN },
    body: JSON.stringify({ email, password }),
  });
  // Session + csrf cookies are set in response headers
  // In extension context, chrome.cookies will have them after this call
  return getZiteSession();
}

// ── App Listing ───────────────────────────────────────────────────────────────

export async function ziteListApps(): Promise<Array<{ _id: string; name: string; publicIdentifier: string }>> {
  const { session, csrf } = await getZiteSession();
  const res = await bgFetch(`${ZITE_BASE}/admin/zite/apps`, {
    headers: ziteHeaders(session, csrf),
  });
  return res.json();
}

// ── File Fetching ─────────────────────────────────────────────────────────────

export async function ziteFetchFiles(publicIdentifier: string): Promise<Record<string, string>> {
  const { session, csrf } = await getZiteSession();
  const res = await bgFetch(`${ZITE_BASE}/admin/zite/apps/${publicIdentifier}`, {
    headers: ziteHeaders(session, csrf),
  });
  const data = await res.json();
  // Files live at response.ziteSnapshot.template.files
  // Each value is { content: "..." } — extract .content
  const rawFiles = data?.ziteSnapshot?.template?.files ?? {};
  const files: Record<string, string> = {};
  for (const [path, val] of Object.entries(rawFiles as Record<string, { content: string }>)) {
    files[path] = val.content;
  }
  return files;
}
```

---

### 8.5 Bolt.new (src/lib/platforms/bolt.ts)

```ts
const BOLT_BASE = "https://bolt.new";

async function getBoltSession(): Promise<string> {
  const cookies = await getCookies("bolt.new");
  const session = cookies.find((c) => c.name === "__session");
  if (!session) throw new Error("Not logged in to bolt.new. Open bolt.new first.");
  // URL-decode the raw cookie value
  return decodeURIComponent(session.value);
}

function boltHeaders(token: string): Record<string, string> {
  return {
    Cookie: `__session=${token}`,
    Origin: BOLT_BASE,
    Referer: `${BOLT_BASE}/`,
    "Content-Type": "application/json",
  };
}

// ── Project Validation ────────────────────────────────────────────────────────

export async function boltGetProject(projectId: string): Promise<{ siteUrl: string }> {
  const token = await getBoltSession();
  const res = await bgFetch(`${BOLT_BASE}/api/deploy/${projectId}`, {
    headers: boltHeaders(token),
  });
  const d = await res.json();
  if (d.code === "login-required") throw new Error("Session expired. Log in to bolt.new again.");
  // Strip protocol and trailing slash from site_url
  return { siteUrl: (d.site_url ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "") };
}

// ── App Listing ───────────────────────────────────────────────────────────────
// ownerSlug = StackBlitz username (from their profile, not email)

export async function boltListProjects(ownerSlug: string): Promise<Array<{
  id: string; name: string; framework: string; slug: string;
}>> {
  const token = await getBoltSession();
  const params = new URLSearchParams({
    preset: "bolt",
    ownerSlug,
    ownerType: "user",
    access: "index",
    order: "updatedAt",
    direction: "desc",
    page: "1",
    per_page: "50",
  });
  const res = await bgFetch(`${BOLT_BASE}/api/projects?${params}`, {
    headers: boltHeaders(token),
  });
  return res.json();
}

// ── File Fetching ─────────────────────────────────────────────────────────────
// Bolt.new does not have a direct file-read API in the browser context.
// Files must be fetched by downloading and unzipping the project's deploy package.

export async function boltFetchFiles(projectId: string): Promise<Record<string, string>> {
  const token = await getBoltSession();
  // PUT with empty zip creates a new deploy that returns the current file tree
  // Better approach: read files from the deployed site's source map if available
  // Fallback: prompt user to use the bolt.new "Export" button and upload the zip
  throw new Error(
    "Bolt.new direct file reading requires the user to export from the editor. " +
    "Click 'Export' in bolt.new, then upload the ZIP here."
  );
}
```

> **Note on bolt.new file fetching:** Unlike other platforms, bolt.new has no server-side API to read raw project files from the browser. The `GET /api/deploy/{pid}` endpoint returns deployment metadata, not file contents. The recommended UX is to ask the user to click Export in the bolt.new editor and upload the ZIP, then parse it client-side with `fflate` or `JSZip`.

---

### 8.6 Lovable (src/lib/platforms/lovable.ts)

**Auth:** Firebase Authentication (project: `gpt-engineer-390607`)

```ts
const FIREBASE_KEY = "AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw"; // public web API key
const LOVABLE_API = "https://api.lovable.dev";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function lovableLogin(email: string, password: string) {
  const res = await bgFetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return { idToken: d.idToken, refreshToken: d.refreshToken, email: d.email };
}

export async function lovableRefreshToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await bgFetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );
  const d = await res.json();
  return { idToken: d.access_token, refreshToken: d.refresh_token };
}

// idToken expires in 1 hour — call refreshToken() when you get a 401

// ── App Listing ───────────────────────────────────────────────────────────────

export async function lovableGetWorkspaces(idToken: string) {
  const res = await bgFetch(`${LOVABLE_API}/v1/workspaces`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const d = await res.json();
  return d.workspaces as Array<{ id: string; name: string; num_projects: number }>;
}

export async function lovableListProjects(idToken: string, workspaceId: string) {
  const res = await bgFetch(`${LOVABLE_API}/v1/workspaces/${workspaceId}/projects`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const d = await res.json();
  return d.projects as Array<{
    id: string; display_name: string; is_published: boolean;
    latest_screenshot_url: string; last_edited_at: string;
  }>;
}

// ── File Fetching ─────────────────────────────────────────────────────────────
// ⚠ File tree listing is plan-gated — returns 0 files on free plan.
// Use the file-list endpoint to get paths, then fetch each file individually.

export async function lovableFetchFiles(idToken: string, projectId: string): Promise<Record<string, string>> {
  const headers = { Authorization: `Bearer ${idToken}` };

  // Get file list
  const listRes = await bgFetch(
    `${LOVABLE_API}/v1/projects/${projectId}/git/files?ref=HEAD`,
    { headers }
  );
  const listData = await listRes.json();
  const filePaths: string[] = (listData?.data?.files ?? [])
    .filter((f: any) => !f.binary)
    .map((f: any) => f.path);

  if (filePaths.length === 0) {
    throw new Error(
      "File listing requires a paid Lovable plan. Upgrade at lovable.dev to use this feature."
    );
  }

  // Fetch each file in parallel batches of 10
  const files: Record<string, string> = {};
  const BATCH = 10;
  for (let i = 0; i < filePaths.length; i += BATCH) {
    const batch = filePaths.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (path) => {
        const res = await bgFetch(
          `${LOVABLE_API}/v1/projects/${projectId}/git/file?ref=HEAD&path=${encodeURIComponent(path)}`,
          { headers: { ...headers, Accept: "text/plain" } }
        );
        files[path] = await res.text();
      })
    );
  }
  return files;
}
```

---

## 9. GitHub API (src/lib/github-api.ts)

```ts
const GH = "https://api.github.com";

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

// ── Validation ────────────────────────────────────────────────────────────────

export async function getGitHubUser(token: string) {
  const res = await bgFetch(`${GH}/user`, { headers: ghHeaders(token) });
  return res.json();
}

// ── Repo Management ───────────────────────────────────────────────────────────

export async function listRepos(token: string) {
  const res = await bgFetch(`${GH}/user/repos?per_page=100&sort=updated`, {
    headers: ghHeaders(token),
  });
  return res.json();
}

export async function createRepo(token: string, name: string, isPrivate = true) {
  const res = await bgFetch(`${GH}/user/repos`, {
    method: "POST",
    headers: ghHeaders(token),
    body: JSON.stringify({ name, private: isPrivate, auto_init: false }),
  });
  return res.json();
}

// ── Push Files (Git Trees API — bulk push pattern) ────────────────────────────
// Correct order: blobs → tree → commit → update ref
// Handle empty repo (no HEAD commit) separately

export async function pushFilesToGitHub(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: Record<string, string>,
  commitMessage: string
) {
  const headers = ghHeaders(token);

  // 1. Create blobs for all files
  const blobs = await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const res = await bgFetch(`${GH}/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content, encoding: "utf-8" }),
      });
      const d = await res.json();
      return { path, mode: "100644" as const, type: "blob" as const, sha: d.sha };
    })
  );

  // 2. Get base tree SHA (handle empty repo — no HEAD)
  let baseTree: string | undefined;
  try {
    const refRes = await bgFetch(`${GH}/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
    const refData = await refRes.json();
    const commitRes = await bgFetch(refData.object.url, { headers });
    const commitData = await commitRes.json();
    baseTree = commitData.tree.sha;
  } catch {
    baseTree = undefined; // empty repo — create without base_tree
  }

  // 3. Create tree
  const treeRes = await bgFetch(`${GH}/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers,
    body: JSON.stringify({ base_tree: baseTree, tree: blobs }),
  });
  const tree = await treeRes.json();

  // 4. Create commit
  const parentShas: string[] = [];
  if (baseTree) {
    const refRes = await bgFetch(`${GH}/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
    const refData = await refRes.json();
    parentShas.push(refData.object.sha);
  }

  const commitRes = await bgFetch(`${GH}/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: commitMessage,
      tree: tree.sha,
      parents: parentShas,
    }),
  });
  const commit = await commitRes.json();

  // 5. Update ref (force push on first commit to create branch)
  const method = parentShas.length === 0 ? "POST" : "PATCH";
  const refUrl =
    parentShas.length === 0
      ? `${GH}/repos/${owner}/${repo}/git/refs`
      : `${GH}/repos/${owner}/${repo}/git/refs/heads/${branch}`;
  await bgFetch(refUrl, {
    method,
    headers,
    body: JSON.stringify(
      parentShas.length === 0
        ? { ref: `refs/heads/${branch}`, sha: commit.sha }
        : { sha: commit.sha, force: false }
    ),
  });

  return commit.sha;
}
```

---

## 10. Secret Scanner (src/lib/secret-scanner.ts)

```ts
const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "GitHub PAT",              pattern: /ghp_[A-Za-z0-9]{36}/g },
  { name: "GitHub OAuth Token",      pattern: /gho_[A-Za-z0-9]{36}/g },
  { name: "AWS Access Key",          pattern: /AKIA[0-9A-Z]{16}/g },
  { name: "AWS Secret Key",          pattern: /(?:aws_secret|AWS_SECRET)[^=]*=\s*["']?([A-Za-z0-9\/+=]{40})["']?/gi },
  { name: "Stripe Secret Key",       pattern: /sk_(?:live|test)_[A-Za-z0-9]{24,}/g },
  { name: "Stripe Publishable Key",  pattern: /pk_(?:live|test)_[A-Za-z0-9]{24,}/g },
  { name: "OpenAI API Key",          pattern: /sk-[A-Za-z0-9]{32,}/g },
  { name: "Firebase API Key",        pattern: /AIza[0-9A-Za-z-_]{35}/g },
  { name: "Supabase Anon Key",       pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJyb2xlIjoiYW5vbiI/g },
  { name: "Private Key Block",       pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Generic Secret",          pattern: /(?:secret|password|passwd|token|api_key)\s*[:=]\s*["']([A-Za-z0-9_\-\.]{16,})["']/gi },
  { name: ".env assignment",         pattern: /^[A-Z_]+=(?!.*\/\/)[^\s]{12,}$/gm },
];

export interface SecretFinding {
  file: string;
  line: number;
  col: number;
  secretType: string;
  preview: string; // first 6 chars + *** + last 4 chars
}

export function scanFiles(files: Record<string, string>): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const [path, content] of Object.entries(files)) {
    // Skip known safe files
    if (path.endsWith(".lock") || path.includes("node_modules")) continue;
    const lines = content.split("\n");
    for (const { name, pattern } of SECRET_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const before = content.slice(0, match.index);
        const lineNum = before.split("\n").length;
        const col = match.index - before.lastIndexOf("\n");
        const raw = match[0];
        findings.push({
          file: path,
          line: lineNum,
          col,
          secretType: name,
          preview: raw.slice(0, 6) + "***" + raw.slice(-4),
        });
      }
    }
  }
  return findings;
}
```

---

## 11. Sidebar UI — Component Spec

### Root structure (src/content/index.tsx)
```tsx
// Mount a shadow DOM to avoid CSS leakage into the host page
const host = document.createElement("div");
host.id = "codevault-root";
document.body.appendChild(host);
const shadow = host.attachShadow({ mode: "open" });

// Inject Tailwind styles inside shadow DOM
const style = document.createElement("style");
style.textContent = TAILWIND_CSS; // injected by Vite build
shadow.appendChild(style);

// Mount React
const container = document.createElement("div");
shadow.appendChild(container);
createRoot(container).render(<Sidebar />);
```

### Sidebar layout
```
┌─ [tab] ──────────────────────────────────────┐
│                                               │
│  ╔═══════════════════════════════════════╗    │
│  ║  🦊 CodeVault      [Base44] ● live   ║    │
│  ╠═══════════════════════════════════════╣    │
│  ║  [Push] [Diff] [History] [⚙]        ║    │
│  ╠═══════════════════════════════════════╣    │
│  ║                                       ║    │
│  ║   Active panel content here           ║    │
│  ║                                       ║    │
│  ╚═══════════════════════════════════════╝    │
│                                               │
└───────────────────────────────────────────────┘
```

- Sidebar is `position: fixed; right: 0; top: 0; height: 100vh; width: 360px; z-index: 2147483647`
- Collapses to a 40px tab when user clicks the edge handle
- State (open/closed) persists in `chrome.storage.local`

---

## 12. Auto-Push (Autopilot Mode)

```ts
// In content script — intercept fetch to detect file saves
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const result = await originalFetch(...args);
  const url = typeof args[0] === "string" ? args[0] : args[0].url;
  // Detect save events by URL pattern per platform
  if (isSaveEvent(url)) {
    chrome.runtime.sendMessage({ type: "FILE_SAVED", platform: detectPlatform(location.href) });
  }
  return result;
};
```

Platform save-event URL patterns:
| Platform | Save Event Pattern |
|---|---|
| Base44 | `POST /apps/{id}/sandbox/files` |
| Floot | `POST /_api/workspace/reference` with action `saveItem` |
| bolt.new | `POST /api/project/{id}/files` |
| Lovable | `POST /v1/projects/{id}/messages` |

---

## 13. Storage Schema (src/lib/storage.ts)

```ts
// chrome.storage.local — credentials (encrypted at rest by Chrome)
interface Credentials {
  githubToken: string;
  githubUsername: string;
  base44Token?: string;
  rocketToken?: string;
  rocketCompanyId?: string;
  boltSession?: string;
  lovableIdToken?: string;
  lovableRefreshToken?: string;
}

// IndexedDB — snapshot history (via idb)
interface Snapshot {
  id: string;                         // crypto.randomUUID()
  platform: Platform;
  projectId: string;
  projectName: string;
  timestamp: number;
  files: Record<string, string>;      // full file contents
  commitSha?: string;                 // set after successful push
  repo?: string;
  branch?: string;
  commitMessage?: string;
}
```

---

## 14. Build & Load in Chrome

```bash
# Development (HMR)
bun run dev

# Production build
bun run build

# Load extension:
# 1. Open chrome://extensions
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked"
# 4. Select the /dist folder
# 5. Pin CodeVault from the extensions menu
```

After any code change in dev mode, click the refresh icon on the extension card in `chrome://extensions`.

---

## 15. Known Platform Quirks & Gotchas

| Platform | Gotcha |
|---|---|
| Base44 | Sandbox must be "alive" before `/sandbox/files` works. Check status first, prompt user to open app if sleeping. |
| Base44 | API base is `app.base44.com/api` not `api.base44.com` (returns Wix 404). |
| Rocket | Auth header format differs per subdomain (JWT vs Bearer — see table in §8.2). |
| Rocket | `companyId` header is required on ALL `back.rocket.new` calls. Without it, returns empty list. |
| Rocket | AES-256-CBC decrypt all responses before reading fields. |
| Rocket | File body key on `{backendUrl}/api/file-content` must be `"path"` not `"file"` or `"filePath"`. |
| Floot | Discriminator field is `"action"` not `"type"`. Workspace field is `"sourceWorkspaceId"` not `"workspaceId"`. |
| Floot | Use `item.code !== undefined` (not `!item.code`) to preserve intentionally empty files. |
| Zite | `Origin: https://build.fillout.com` header is mandatory — requests without it are rejected. |
| bolt.new | `__session` cookie value must be URL-decoded before use. |
| bolt.new | No direct file-read API — must export ZIP from editor. |
| Lovable | File tree listing is plan-gated — returns 0 files on free plan. |
| Lovable | Firebase `idToken` expires in 1 hour — implement auto-refresh using `refreshToken`. |
| GitHub | Empty repo (no HEAD) needs `POST /git/refs` to create branch, not `PATCH /git/refs/heads/{branch}`. |

---

## 16. Extension Permissions Rationale

| Permission | Why |
|---|---|
| `cookies` | Read session tokens from platform tabs without user needing to copy/paste credentials |
| `storage` | Persist credentials and snapshot history |
| `scripting` | Inject sidebar into platform pages |
| `tabs` | Detect current platform from URL |
| `identity` | GitHub OAuth flow |
| `host_permissions` | CORS-free fetch to all platform APIs from service worker |

---

*End of master prompt. Paste this entire file as your opening message to an AI agent to build CodeVault from scratch.*
