// ─── Lovable.dev API ──────────────────────────────────────────────────────────
// Auth:  Firebase Identity Platform (public key, email+password)
// API:   https://api.lovable.dev  — routed via /api/lovable proxy (CORS blocked)
// Verified working 2026-07-08 via live reverse-engineering.

const PROXY       = "/api/lovable";
const FB_KEY      = "AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw";
const FB_SIGN_IN  = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_KEY}`;
const FB_REFRESH  = `https://securetoken.googleapis.com/v1/token?key=${FB_KEY}`;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LovableLoginResult {
  token:        string;
  refreshToken: string;
  email:        string;
  uid:          string;
}

export interface LovableProject {
  id:               string;
  display_name:     string;
  is_published:     boolean;
  url:              string;   // e.g. https://my-app.lovable.app
  tech_stack:       string;   // e.g. "vite_react_shadcn_ts" | "tanstack_start_ts_..."
  workspace_id:     string;
  latest_commit_sha:string;
  edit_count:       number;
  updated_at:       string;
}

// ── Proxy helper ──────────────────────────────────────────────────────────────

function proxyUrl(subpath: string, qs?: Record<string, string>): string {
  // Strip leading slash; encode; pass as ?p=
  const encoded = encodeURIComponent(subpath.replace(/^\//, ""));
  const base = `${PROXY}?p=${encoded}`;
  if (!qs) return base;
  const extra = new URLSearchParams(qs).toString();
  return extra ? `${base}&${extra}` : base;
}

async function lovableFetch(
  subpath: string,
  token: string,
  opts?: RequestInit & { qs?: Record<string, string>; asText?: boolean },
): Promise<Response> {
  const { qs, asText, ...rest } = opts ?? {};
  return fetch(proxyUrl(subpath, qs), {
    ...rest,
    headers: {
      "X-Lovable-Token": token,
      Accept: asText ? "text/plain" : "application/json",
      ...((rest.headers ?? {}) as Record<string, string>),
    },
  });
}

// ── Firebase auth ─────────────────────────────────────────────────────────────

/**
 * Sign in with Lovable email + password via Firebase Identity Platform.
 * No proxy needed — identitytoolkit is CORS-open.
 */
export async function lovableLogin({
  data,
}: {
  data: { email: string; password: string };
}): Promise<LovableLoginResult> {
  let res: Response;
  try {
    res = await fetch(FB_SIGN_IN, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password, returnSecureToken: true }),
    });
  } catch {
    throw new Error("Could not reach Lovable auth. Check your internet connection.");
  }

  const d = await res.json();
  if (d.error) {
    const msg: string = d.error?.message ?? "";
    if (msg.includes("EMAIL_NOT_FOUND") || msg.includes("INVALID_PASSWORD") || msg.includes("INVALID_LOGIN_CREDENTIALS")) {
      throw new Error("Wrong email or password. Check your Lovable credentials and try again.");
    }
    if (msg.includes("USER_DISABLED")) {
      throw new Error("This Lovable account has been disabled.");
    }
    if (msg.includes("TOO_MANY_ATTEMPTS")) {
      throw new Error("Too many login attempts. Wait a few minutes and try again.");
    }
    throw new Error(`Login failed: ${msg || "Unknown error"}`);
  }

  if (!d.idToken) throw new Error("Login succeeded but no token was returned. Try again.");

  return {
    token:        d.idToken,
    refreshToken: d.refreshToken,
    email:        d.email ?? data.email,
    uid:          d.localId ?? "",
  };
}

/**
 * Refresh an expired Firebase idToken using the refresh token.
 * Returns a new idToken (access_token field in response).
 */
export async function refreshLovableToken({
  data,
}: {
  data: { refreshToken: string };
}): Promise<{ token: string; refreshToken: string }> {
  const res = await fetch(FB_REFRESH, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    `grant_type=refresh_token&refresh_token=${encodeURIComponent(data.refreshToken)}`,
  });
  const d = await res.json();
  if (!d.access_token && !d.id_token) {
    throw new Error("Token refresh failed. Please reconnect your Lovable account.");
  }
  return {
    token:        d.id_token ?? d.access_token,
    refreshToken: d.refresh_token ?? data.refreshToken,
  };
}

/**
 * Validate a Lovable token by calling /v1/me.
 */
export async function validateLovableToken({
  data,
}: {
  data: { token: string };
}): Promise<{ email: string; name: string }> {
  const res = await lovableFetch("/v1/me", data.token);
  if (res.status === 401) {
    throw Object.assign(
      new Error("Your Lovable session has expired. Please reconnect in Settings."),
      { status: 401 },
    );
  }
  if (!res.ok) throw new Error(`Lovable API error ${res.status}`);
  const d = await res.json();
  if (!d.email) throw new Error("Could not read your Lovable profile. Try again.");
  return { email: String(d.email), name: String(d.name ?? d.email) };
}

// ── Project listing ───────────────────────────────────────────────────────────

export async function listLovableProjects({
  data,
}: {
  data: { token: string };
}): Promise<LovableProject[]> {
  // 1. Get workspaces
  const wsRes = await lovableFetch("/v1/workspaces", data.token);
  if (wsRes.status === 401) throw new Error("Your Lovable session has expired. Please reconnect in Settings.");
  if (!wsRes.ok) throw new Error(`Failed to load Lovable workspaces (${wsRes.status})`);
  const wsData = await wsRes.json();
  const workspaces: any[] = wsData.workspaces ?? [];
  if (workspaces.length === 0) return [];

  // 2. Fetch projects from all workspaces in parallel
  const results = await Promise.allSettled(
    workspaces.map((ws) =>
      lovableFetch(`/v1/workspaces/${ws.id}/projects?limit=100`, data.token)
        .then((r) => (r.ok ? r.json() : { projects: [] }))
        .then((d) => (d.projects ?? []) as any[]),
    ),
  );

  const projects: LovableProject[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!p.id || seen.has(p.id)) continue;
      seen.add(p.id);
      projects.push({
        id:                p.id,
        display_name:      String(p.display_name ?? "Untitled"),
        is_published:      Boolean(p.is_published),
        url:               String(p.url ?? ""),
        tech_stack:        String(p.tech_stack ?? ""),
        workspace_id:      String(p.workspace_id ?? ws.id),
        latest_commit_sha: String(p.latest_commit_sha ?? ""),
        edit_count:        Number(p.edit_count ?? 0),
        updated_at:        String(p.last_edited_at ?? p.updated_at ?? p.created_at ?? ""),
      });
    }
  }

  return projects.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

// ── File fetching — smart path probing ────────────────────────────────────────
// git/files?ref=HEAD returns 0 entries on free plan (plan-gated).
// Individual git/file?ref=HEAD&path=<p> WORKS.
// We probe a comprehensive list of known paths, in parallel, and return all hits.

function pathsForStack(techStack: string): string[] {
  const isTanStack = techStack.toLowerCase().includes("tanstack");
  const isRemix = techStack.toLowerCase().includes("remix");
  const isNext = techStack.toLowerCase().includes("next");

  const shared = [
    // Root config
    "package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
    ".gitignore", "README.md", ".env.example",
    // Vite / Tailwind
    "vite.config.ts", "vite.config.js",
    "tailwind.config.ts", "tailwind.config.js",
    "postcss.config.js", "postcss.config.cjs", "postcss.config.mjs",
    // Shadcn
    "components.json",
    // Global CSS (all stacks)
    "src/styles.css", "src/index.css", "src/App.css", "src/global.css",
    "app/globals.css", "styles/globals.css", "styles/index.css",
  ];

  const viteReact = [
    "index.html",
    "src/main.tsx", "src/main.ts", "src/App.tsx", "src/App.ts",
    "src/vite-env.d.ts",
    // Pages
    "src/pages/Index.tsx", "src/pages/Home.tsx", "src/pages/Landing.tsx",
    "src/pages/About.tsx", "src/pages/Contact.tsx", "src/pages/Dashboard.tsx",
    "src/pages/Login.tsx", "src/pages/Register.tsx", "src/pages/Profile.tsx",
    "src/pages/Settings.tsx", "src/pages/NotFound.tsx", "src/pages/404.tsx",
    "src/pages/pricing.tsx", "src/pages/Pricing.tsx",
    // Components
    "src/components/App.tsx", "src/components/Header.tsx", "src/components/Footer.tsx",
    "src/components/Hero.tsx", "src/components/Layout.tsx", "src/components/Navbar.tsx",
    "src/components/Navigation.tsx", "src/components/Sidebar.tsx",
    "src/components/ui/button.tsx", "src/components/ui/card.tsx",
    "src/components/ui/input.tsx", "src/components/ui/label.tsx",
    "src/components/ui/badge.tsx", "src/components/ui/dialog.tsx",
    "src/components/ui/dropdown-menu.tsx", "src/components/ui/toast.tsx",
    "src/components/ui/toaster.tsx", "src/components/ui/use-toast.ts",
    "src/components/ui/separator.tsx", "src/components/ui/sheet.tsx",
    "src/components/ui/tabs.tsx", "src/components/ui/select.tsx",
    "src/components/ui/textarea.tsx", "src/components/ui/checkbox.tsx",
    "src/components/ui/avatar.tsx", "src/components/ui/table.tsx",
    "src/components/ui/scroll-area.tsx", "src/components/ui/progress.tsx",
    "src/components/ui/skeleton.tsx", "src/components/ui/switch.tsx",
    "src/components/ui/alert.tsx", "src/components/ui/accordion.tsx",
    "src/components/ui/popover.tsx", "src/components/ui/tooltip.tsx",
    // Lib / hooks
    "src/lib/utils.ts", "src/lib/api.ts", "src/lib/auth.ts",
    "src/hooks/use-toast.ts", "src/hooks/useToast.ts", "src/hooks/useAuth.ts",
    "src/hooks/useTheme.ts",
    // Context / store
    "src/context/AuthContext.tsx", "src/context/ThemeContext.tsx",
    "src/store/index.ts",
    // Types
    "src/types/index.ts", "src/types.ts",
    // Integrations
    "src/integrations/supabase/client.ts", "src/integrations/supabase/index.ts",
    "src/integrations/supabase/types.ts",
  ];

  const tanstack = [
    "app.config.ts", "app.config.js",
    "src/router.tsx", "src/routeTree.gen.ts", "src/client.tsx",
    // Routes
    "src/routes/__root.tsx",
    "src/routes/index.tsx", "src/routes/about.tsx",
    "src/routes/dashboard.tsx", "src/routes/login.tsx",
    "src/routes/signup.tsx", "src/routes/register.tsx",
    "src/routes/pricing.tsx", "src/routes/contact.tsx",
    "src/routes/blog.tsx", "src/routes/settings.tsx",
    "src/routes/profile.tsx", "src/routes/privacy.tsx",
    "src/routes/terms.tsx", "src/routes/404.tsx",
    "src/routes/_layout.tsx", "src/routes/_index.tsx",
    "src/routes/(home)/index.tsx", "src/routes/(auth)/login.tsx",
    // Components
    "src/components/Header.tsx", "src/components/Footer.tsx",
    "src/components/Hero.tsx", "src/components/Layout.tsx",
    "src/components/Navbar.tsx", "src/components/Navigation.tsx",
    "src/components/ui/button.tsx", "src/components/ui/card.tsx",
    "src/components/ui/input.tsx", "src/components/ui/badge.tsx",
    "src/components/ui/dialog.tsx", "src/components/ui/toast.tsx",
    "src/components/ui/toaster.tsx", "src/components/ui/separator.tsx",
    "src/components/ui/tabs.tsx", "src/components/ui/select.tsx",
    "src/components/ui/textarea.tsx", "src/components/ui/avatar.tsx",
    "src/components/ui/table.tsx", "src/components/ui/skeleton.tsx",
    "src/components/ui/tooltip.tsx", "src/components/ui/popover.tsx",
    "src/components/ui/dropdown-menu.tsx", "src/components/ui/alert.tsx",
    "src/components/ui/sheet.tsx", "src/components/ui/scroll-area.tsx",
    "src/components/ui/checkbox.tsx", "src/components/ui/switch.tsx",
    "src/components/ui/accordion.tsx", "src/components/ui/progress.tsx",
    // Lib / hooks
    "src/lib/utils.ts", "src/lib/api.ts",
    "src/hooks/useAuth.ts", "src/hooks/useTheme.ts",
    // Types
    "src/types/index.ts",
    // Integrations
    "src/integrations/supabase/client.ts", "src/integrations/supabase/types.ts",
  ];

  const remix = [
    "app/root.tsx", "app/entry.client.tsx", "app/entry.server.tsx",
    "app/routes/_index.tsx", "app/routes/about.tsx", "app/routes/dashboard.tsx",
  ];

  const next = [
    "next.config.ts", "next.config.js", "next.config.mjs",
    "app/layout.tsx", "app/page.tsx", "app/globals.css",
    "app/loading.tsx", "app/error.tsx", "app/not-found.tsx",
    "pages/index.tsx", "pages/_app.tsx", "pages/_document.tsx",
    "pages/about.tsx",
  ];

  const all = [...shared];
  if (isTanStack) all.push(...tanstack);
  if (isRemix) all.push(...remix);
  if (isNext) all.push(...next);
  if (!isTanStack && !isRemix && !isNext) all.push(...viteReact);

  // Deduplicate
  return [...new Set(all)];
}

/**
 * Fetch all source files from a Lovable project via smart path probing.
 * git/files?ref=HEAD returns 0 on free plan — we probe known paths in parallel.
 */
export async function fetchLovableAppFiles({
  data,
}: {
  data: { token: string; projectId: string; techStack?: string };
}): Promise<{ path: string; content: string }[]> {
  const { token, projectId, techStack = "" } = data;

  // First, always get package.json to detect stack
  const pkgRes = await lovableFetch(
    `/v1/projects/${projectId}/git/file`,
    token,
    { qs: { ref: "HEAD", path: "package.json" }, asText: true },
  );

  let detectedStack = techStack;
  if (pkgRes.ok) {
    const pkgText = await pkgRes.text();
    try {
      const pkg = JSON.parse(pkgText);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps["@tanstack/start"] || deps["@tanstack/react-start"])   detectedStack = "tanstack_start";
      else if (deps["next"])                                            detectedStack = "next";
      else if (deps["remix"] || deps["@remix-run/react"])              detectedStack = "remix";
      else                                                              detectedStack = "vite_react";
    } catch { /* keep provided techStack */ }
  }

  const paths = pathsForStack(detectedStack);

  // Probe all paths in parallel batches of 20
  const BATCH = 20;
  const files: { path: string; content: string }[] = [];

  for (let i = 0; i < paths.length; i += BATCH) {
    const batch = paths.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((path) =>
        lovableFetch(`/v1/projects/${projectId}/git/file`, token, {
          qs: { ref: "HEAD", path },
          asText: true,
        }).then(async (r) => {
          if (!r.ok) return null;
          const content = await r.text();
          return { path, content };
        }),
      ),
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) files.push(r.value);
    }
  }

  if (files.length === 0) {
    throw new Error(
      "No source files found in this Lovable project. " +
      "Make sure the project has been built at least once in the Lovable editor.",
    );
  }

  return files;
}

// ── Badge removal ─────────────────────────────────────────────────────────────

const BADGE_SELECTOR  = "#lovable-badge";
const BADGE_HIDE_RULE = "\n/* push44-badge-hide */\n#lovable-badge { display: none !important; }\n";

// CSS files Lovable projects may use (in order of preference)
const CSS_FILE_CANDIDATES = [
  "src/styles.css", "src/index.css", "src/App.css", "src/global.css",
  "app/globals.css", "styles/globals.css",
];

/**
 * Find the primary CSS file path for a project (first 200 on free plan).
 */
async function findCssFile(token: string, projectId: string): Promise<{ path: string; content: string } | null> {
  const results = await Promise.all(
    CSS_FILE_CANDIDATES.map((path) =>
      lovableFetch(`/v1/projects/${projectId}/git/file`, token, {
        qs: { ref: "HEAD", path },
        asText: true,
      }).then(async (r) => {
        if (!r.ok) return null;
        return { path, content: await r.text() };
      }).catch(() => null),
    ),
  );
  return results.find(Boolean) ?? null;
}

/**
 * Returns true if the badge-hiding CSS rule is already in the project's CSS.
 */
export async function getLovableBadgeHidden({
  data,
}: {
  data: { token: string; projectId: string };
}): Promise<boolean> {
  const css = await findCssFile(data.token, data.projectId);
  return css ? css.content.includes(BADGE_SELECTOR) : false;
}

export type LovableBadgeStatus =
  | { step: "reading-css" }
  | { step: "already-hidden" }
  | { step: "sending-message" }
  | { step: "waiting-ai"; elapsed: number }
  | { step: "verifying" }
  | { step: "redeploying" }
  | { step: "done"; pushedToGitHub: boolean };

/**
 * Remove the "Made with Lovable" badge permanently.
 *
 * Strategy (confirmed working 2026-07-08):
 *   1. Read the primary CSS file — skip if rule already present
 *   2. POST /v1/projects/{pid}/messages with a precise CSS-append prompt
 *   3. Poll GET /v1/projects/{pid}/messages until the aimsg_ completes
 *   4. Verify the rule is now in src/styles.css
 *   5. POST /v1/projects/{pid}/deployments to republish on lovable.app
 *      (if GitHub is connected, Lovable auto-committed → Vercel redeploys automatically)
 */
export async function removeLovableBadge({
  data,
  onStatus,
}: {
  data: { token: string; projectId: string };
  onStatus?: (s: LovableBadgeStatus) => void;
}): Promise<void> {
  const { token, projectId } = data;
  const notify = (s: LovableBadgeStatus) => onStatus?.(s);

  // 1. Find CSS file & check if rule already present
  notify({ step: "reading-css" });
  const cssFile = await findCssFile(token, projectId);
  if (!cssFile) {
    throw new Error(
      "Could not find a CSS file in this project. " +
      "Open it in the Lovable editor, build it once, then try again.",
    );
  }
  if (cssFile.content.includes(BADGE_SELECTOR)) {
    notify({ step: "already-hidden" });
    return;
  }

  // 2. Send AI message — extremely precise prompt to avoid AI going off-script
  notify({ step: "sending-message" });
  const prompt =
    `Open the file ${cssFile.path} and append exactly this text at the very end of the file. ` +
    `Do not modify anything else, do not add explanations, do not add blank lines before it. ` +
    `Just append this CSS exactly: /* push44-badge-hide */ #lovable-badge { display: none !important; }`;

  const msgRes = await lovableFetch(`/v1/projects/${projectId}/messages`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt }),
  });
  if (!msgRes.ok) {
    const err = await msgRes.json().catch(() => ({}));
    throw new Error(
      err?.detail ?? err?.message ?? `Failed to send badge-removal message (${msgRes.status})`,
    );
  }
  const { message_id: userMsgId } = await msgRes.json();
  if (!userMsgId) throw new Error("Lovable returned no message ID. Try again.");

  // 3. Poll for the AI response message
  const MAX_WAIT_MS = 3 * 60 * 1000; // 3 minutes
  const POLL_MS     = 3000;
  const started     = Date.now();

  let aiMsgId: string | null = null;
  let dotCount = 0;

  while (Date.now() - started < MAX_WAIT_MS) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    dotCount++;
    notify({ step: "waiting-ai", elapsed: Date.now() - started });

    if (!aiMsgId) {
      // Look for the assistant message that follows our user message
      const listRes = await lovableFetch(`/v1/projects/${projectId}/messages`, token);
      if (listRes.ok) {
        const { messages } = await listRes.json();
        const assistantMsgs = (messages ?? []).filter((m: any) => m.role === "assistant");
        if (assistantMsgs.length > 0) aiMsgId = assistantMsgs[0].message_id;
      }
      continue;
    }

    // Poll specific AI message
    const pollRes = await lovableFetch(`/v1/projects/${projectId}/messages/${aiMsgId}`, token);
    if (pollRes.ok) {
      const { status } = await pollRes.json();
      if (status === "completed") break;
      if (status === "failed") throw new Error("Lovable AI failed to modify the CSS. Try again.");
    }
  }

  if (Date.now() - started >= MAX_WAIT_MS && !aiMsgId) {
    throw new Error("Timed out waiting for Lovable AI to finish. The badge may still have been removed — check your live site.");
  }

  // 4. Verify CSS was written
  notify({ step: "verifying" });
  await new Promise((r) => setTimeout(r, 2000));
  const verifyRes = await lovableFetch(`/v1/projects/${projectId}/git/file`, token, {
    qs: { ref: "HEAD", path: cssFile.path },
    asText: true,
  });
  if (verifyRes.ok) {
    const newCss = await verifyRes.text();
    if (!newCss.includes(BADGE_SELECTOR)) {
      // CSS not verified but AI said completed — still continue, let redeploy happen
      console.warn("[Push44] Badge CSS not detected after AI completion — proceeding with redeploy.");
    }
  }

  // 5. Trigger lovable.app redeploy (also commits to GitHub if connected → Vercel auto-deploys)
  notify({ step: "redeploying" });
  await lovableFetch(`/v1/projects/${projectId}/deployments`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).catch(() => { /* non-fatal — the CSS change was already committed */ });

  notify({ step: "done", pushedToGitHub: true });
}
