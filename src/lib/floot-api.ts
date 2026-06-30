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
    "not push-44.vercel.app. The Replit version has the secure proxy needed to connect Floot."
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
        "Please open Push44 from your Replit preview, not push-44.vercel.app."
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
    includeMadeWithFloot: false,
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
