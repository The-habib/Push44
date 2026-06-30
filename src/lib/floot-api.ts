const PROXY = "/api/floot";

async function proxyFetch(path: string, token: string, opts?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Floot-Token": token,
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  return fetch(`${PROXY}${path}`, { ...opts, headers });
}

export interface FlootApp {
  id: string;
  name: string;
  icon?: string;
  updated_at: string;
}

async function fetchFlootSession(token: string): Promise<{ user: any } | null> {
  try {
    const res = await proxyFetch("/api/auth/session", token);
    if (res.ok) {
      const d = await res.json().catch(() => null);
      if (d && (d.user || d.email)) return d;
      if (res.status !== 404) return null;
    }
    if (res.status === 404) throw new Error("PROXY_UNAVAILABLE");
  } catch (e: any) {
    if (e?.message !== "PROXY_UNAVAILABLE") {
      throw new Error("Could not reach Floot. Check your internet connection.");
    }
  }

  throw new Error(
    "Floot connection requires the Replit-hosted version of Push44.\n\n" +
    "Please open Push44 from your Replit preview (the URL in your Replit editor), " +
    "not push44.vercel.app. The Replit version has the secure proxy needed to connect Floot."
  );
}

export async function validateFlootToken({ data }: { data: { token: string } }): Promise<{ email: string; name: string }> {
  const d = await fetchFlootSession(data.token);
  const user = d?.user ?? (d?.email ? d : null);

  if (!user?.email) {
    throw new Error(
      "Your Floot session has expired — this token is no longer valid.\n\n" +
      "To get a fresh token:\n" +
      "1. Go to floot.com and log in\n" +
      "2. Open DevTools (F12) → Application → Cookies → floot.com\n" +
      "3. Copy the Value of the cookie named: nextauth.session-token\n" +
      "4. Paste it here"
    );
  }

  return {
    email: String(user.email),
    name: String(user.name ?? user.displayName ?? user.email),
  };
}

export async function listFlootApps({ data }: { data: { token: string } }): Promise<FlootApp[]> {
  const token = data.token;

  try {
    const res = await proxyFetch("/_api/workspace/list", token);
    if (res.ok) {
      const d = await res.json().catch(() => null);
      if (d) {
        const apps: FlootApp[] = [];
        const seen = new Set<string>();

        const addWorkspace = (ws: any) => {
          if (!ws?.id || !ws?.name) return;
          if (seen.has(ws.id)) return;
          seen.add(ws.id);
          apps.push({
            id: String(ws.id),
            name: String(ws.name),
            updated_at: String(ws.updatedAt ?? ws.createdAt ?? ""),
            icon: ws.iconUrl ?? undefined,
          });
        };

        for (const ws of (d.ownedWorkspaces ?? [])) addWorkspace(ws);
        for (const ws of (d.sharedWorkspaces ?? [])) addWorkspace(ws);
        for (const ws of (d.favoriteWorkspaces ?? [])) addWorkspace(ws);

        if (apps.length > 0) return apps;
      }
    }

    if (res.status === 404) {
      throw new Error(
        "Floot connection requires the Replit-hosted version of Push44.\n\n" +
        "Please open Push44 from your Replit preview, not push44.vercel.app."
      );
    }
  } catch (e: any) {
    if (e?.message?.includes("Replit")) throw e;
  }

  return [];
}

// ─── Publish / Deploy API ─────────────────────────────────────────────────────

export type FlootDeployStatus =
  | { type: "notDeployed" }
  | { type: "deploying";  subdomain: string; deploymentInfo?: any }
  | { type: "deployed";   subdomain: string; deploymentInfo?: any }
  | { type: "error";      subdomain?: string; message: string; deploymentInfo?: any };

export async function getFlootDeploymentStatus({
  data,
}: {
  data: { token: string; workspaceId: string };
}): Promise<FlootDeployStatus> {
  const res = await proxyFetch(
    `/_api/workspace/deployment?workspaceId=${encodeURIComponent(data.workspaceId)}`,
    data.token
  );
  if (!res.ok) throw new Error(`Deployment status error ${res.status}`);
  return res.json();
}

export async function triggerFlootDeploy({
  data,
}: {
  data: { token: string; workspaceId: string; subdomain: string; isUpdate?: boolean };
}): Promise<void> {
  const body = {
    type: data.isUpdate ? "prodUpdate" : "prod",
    id: data.workspaceId,
    subdomain: data.subdomain,
    includeMadeWithFloot: true,
    buildMobileApps: false,
  };
  const res = await proxyFetch("/api/trpc/workspace.requestDeploy", data.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      err?.error?.message ??
      err?.error?.data?.message ??
      err?.message ??
      `Deploy trigger failed (${res.status})`;
    throw new Error(msg);
  }
}


// ─── Badge Removal ────────────────────────────────────────────────────────────

const BADGE_SELECTOR = "#__Floot-madewithFloot";
const BADGE_CSS_RULE = "\n#__Floot-madewithFloot { display: none !important; }\n";

/**
 * Check whether the badge-hiding CSS rule is already present in the workspace's sketchCss.
 */
export async function getFlootBadgeHidden({
  data,
}: {
  data: { token: string; workspaceId: string };
}): Promise<boolean> {
  const res = await proxyFetch("/_api/workspace/list", data.token);
  if (!res.ok) return false;
  const d = await res.json().catch(() => null);
  if (!d) return false;
  const ws =
    (d.ownedWorkspaces ?? []).find((w: any) => w.id === data.workspaceId) ??
    (d.sharedWorkspaces ?? []).find((w: any) => w.id === data.workspaceId);
  return String(ws?.sketchCss ?? "").includes(BADGE_SELECTOR);
}

/**
 * Inject a CSS rule that hides the "Made with Floot" badge into the workspace's
 * sketchCss via Floot's internal globalChatAndStore mutation API.
 *
 * After this call returns the caller MUST trigger a redeploy — the badge is
 * only visually hidden on the live site after the next build.
 *
 * Approach discovered by reverse-engineering the Floot project-page bundle (June 2026).
 */
export async function removeFlootBadge({
  data,
}: {
  data: { token: string; workspaceId: string };
}): Promise<void> {
  const { token, workspaceId } = data;

  // ── Step 1: Extract serverLastMessageId from project-page HTML ────────────
  // The ID is embedded as JSON in the Next.js RSC payload. It is validated
  // server-side on every /api/llm call — using a wrong ID returns 400.
  const pageRes = await proxyFetch(`/project/${workspaceId}`, token, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "X-Floot-Referer": `https://floot.com/project/${workspaceId}`,
    },
  });
  if (!pageRes.ok) {
    throw new Error(`Could not load Floot project page (${pageRes.status}). Check your session token.`);
  }
  const pageHtml = await pageRes.text();
  const msgIdMatch = pageHtml.match(/"serverLastMessageId":"([^"]+)"/);
  if (!msgIdMatch) {
    throw new Error(
      "Could not find the Floot message ID needed for badge removal. " +
      "Make sure you have at least opened the project in Floot once."
    );
  }
  const serverLastMessageId = msgIdMatch[1];

  // ── Step 2: Get current sketchCss ─────────────────────────────────────────
  const listRes = await proxyFetch("/_api/workspace/list", token);
  if (!listRes.ok) throw new Error(`Failed to load workspace list (${listRes.status})`);
  const listData = await listRes.json();

  const workspace =
    (listData.ownedWorkspaces ?? []).find((w: any) => w.id === workspaceId) ??
    (listData.sharedWorkspaces ?? []).find((w: any) => w.id === workspaceId);

  if (!workspace) throw new Error("This workspace was not found in your Floot account.");

  const currentSketchCss: string = workspace.sketchCss ?? "";

  // Idempotent — skip if rule is already there
  if (currentSketchCss.includes(BADGE_SELECTOR)) return;

  const newCss = currentSketchCss + BADGE_CSS_RULE;

  // ── Step 3: Persist via globalChatAndStore + userModification ─────────────
  // This is the same mutation Floot's editor uses when the user edits globalCss.
  const llmRes = await proxyFetch("/api/llm", token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Floot-Referer": `https://floot.com/project/${workspaceId}`,
    },
    body: JSON.stringify({
      type: "globalChatAndStore",
      workspaceId,
      lastMessageId: serverLastMessageId,
      retryTimes: 0,
      chatVersion: 11,
      toolCallId: "",
      messages: {
        type: "userModification",
        changes: {},
        workspaceChange: {
          globalCss: {
            changes: newCss,
            previous: currentSketchCss,
          },
        },
      },
    }),
  });

  if (!llmRes.ok) {
    const errBody = await llmRes.json().catch(() => ({}));
    const msg =
      errBody?.error ??
      errBody?.message ??
      `Badge CSS injection failed (${llmRes.status})`;
    throw new Error(msg);
  }

  const result = await llmRes.json().catch(() => null);
  if (!result?.id) {
    throw new Error("Badge rule was not saved by Floot. Please try again.");
  }
}

// ─── Reference API ────────────────────────────────────────────────────────────
// Floot exposes /_api/workspace/reference with two actions:
//   • action:"getInfo"   → returns project structure (file list, design info)
//   • action:"readItems" → returns actual source code for a batch of items
//
// Discovered by reverse-engineering the Floot dashboard JS bundle (June 2026).
// The discriminator field is "action" (NOT "type") and workspace field is
// "sourceWorkspaceId" (NOT "workspaceId").

interface FlootProjectInfo {
  name: string;
  description: string | null;
  designChoices: string | null;
  items: {
    components: string[];
    helpers: string[];
    endpoints: string[];
    pages: string[];
    statics: string[];
  };
}

interface FlootItemContent {
  code?: string;
  css?: string;
  error?: string;
}

async function getFlootProjectInfo(token: string, workspaceId: string): Promise<FlootProjectInfo> {
  const res = await proxyFetch("/_api/workspace/reference", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getInfo",
      sourceWorkspaceId: workspaceId,
      include: ["items", "dependencies"],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Floot API error ${res.status}`);
  }

  return res.json();
}

async function readFlootItems(
  token: string,
  workspaceId: string,
  itemNames: string[]
): Promise<Record<string, FlootItemContent>> {
  const res = await proxyFetch("/_api/workspace/reference", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "readItems",
      sourceWorkspaceId: workspaceId,
      itemNames,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Floot readItems error ${res.status}`);
  }

  const d = await res.json();
  return d?.items ?? {};
}

/** Determine file extension for a Floot item type */
function itemExtension(itemType: "pages" | "helpers" | "components" | "endpoints" | "statics", name: string): string {
  if (itemType === "statics") {
    // statics already carry their extension in the name (e.g. "readme.md")
    return "";
  }
  if (itemType === "helpers" || itemType === "endpoints") return ".ts";
  return ".tsx"; // pages and components are TSX
}

/** Convert a Floot item type + name into a filesystem path prefix */
function itemPath(itemType: "pages" | "helpers" | "components" | "endpoints" | "statics", name: string): string {
  const dirMap: Record<string, string> = {
    pages: "pages",
    helpers: "helpers",
    components: "components",
    endpoints: "endpoints",
    statics: "static",
  };
  const dir = dirMap[itemType] ?? itemType;
  return `${dir}/${name}`;
}

/**
 * Fetch all source files for a Floot workspace.
 *
 * Uses the undocumented /_api/workspace/reference endpoint discovered by
 * reverse-engineering the Floot dashboard bundle. Steps:
 *   1. getInfo  → get full list of items (pages, components, helpers, endpoints, statics)
 *   2. readItems (batched) → get code + CSS for each item
 *   3. Emit {path, content}[] compatible with Push44's staging pipeline
 */
export async function fetchFlootAppFiles({
  data,
}: {
  data: { token: string; appId: string; appName?: string };
}): Promise<{ path: string; content: string }[]> {
  const { token, appId } = data;

  // ── Step 1: get project structure ────────────────────────────────────────
  const info = await getFlootProjectInfo(token, appId);

  const { components = [], helpers = [], endpoints = [], pages = [], statics = [] } = info.items ?? {};

  // Build the flat list of (itemType, name) pairs to fetch
  type ItemRef = { type: "pages" | "helpers" | "components" | "endpoints" | "statics"; name: string };
  const allItems: ItemRef[] = [
    ...pages.map((n) => ({ type: "pages" as const, name: n })),
    ...helpers.map((n) => ({ type: "helpers" as const, name: n })),
    ...components.map((n) => ({ type: "components" as const, name: n })),
    ...endpoints.map((n) => ({ type: "endpoints" as const, name: n })),
    ...statics.map((n) => ({ type: "statics" as const, name: n })),
  ];

  if (allItems.length === 0) {
    throw new Error("This Floot project has no files yet. Open it in Floot and build something first.");
  }

  // ── Step 2: readItems in batches of 10 ──────────────────────────────────
  const BATCH = 10;
  const contentMap: Record<string, FlootItemContent> = {};

  for (let i = 0; i < allItems.length; i += BATCH) {
    const batch = allItems.slice(i, i + BATCH);
    // Floot itemNames format: "pages/_index", "helpers/themeMode", etc.
    const itemNames = batch.map((ref) => `${ref.type}/${ref.name}`);
    const batchResult = await readFlootItems(token, appId, itemNames);
    Object.assign(contentMap, batchResult);
  }

  // ── Step 3: Convert to {path, content}[] ─────────────────────────────────
  const files: { path: string; content: string }[] = [];

  // Include design choices as a markdown doc if present
  if (info.designChoices?.trim()) {
    files.push({
      path: "docs/design-system.md",
      content: `# Design System\n\n${info.designChoices}`,
    });
  }

  for (const ref of allItems) {
    const key = `${ref.type}/${ref.name}`;
    const item = contentMap[key];
    if (!item || item.error) continue;

    const basePath = itemPath(ref.type, ref.name);
    const ext = itemExtension(ref.type, ref.name);

    // Code file
    if (item.code !== undefined) {
      const codePath = ref.type === "statics" ? basePath : `${basePath}${ext}`;
      files.push({ path: codePath, content: item.code });
    }

    // CSS module (pages and components can have accompanying .module.css)
    if (item.css !== undefined && ref.type !== "statics") {
      files.push({ path: `${basePath}.module.css`, content: item.css });
    }
  }

  if (files.length === 0) {
    throw new Error("No file content was returned from Floot. The project may be empty or still generating.");
  }

  return files;
}
