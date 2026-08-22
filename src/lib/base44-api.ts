const BASE = "https://app.base44.com/api";

async function b44Fetch(
  path: string,
  opts?: RequestInit,
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    if (res.status === 401) throw Object.assign(new Error("Your Base44 token is invalid or has expired. Please reconnect in Settings."), { status: 401 });
    if (res.status === 403) throw Object.assign(new Error("Access denied by Base44 — your token may lack the required permissions."), { status: 403 });
    if (res.status === 429) throw new Error("Too many requests — please wait a moment and try again.");
    if (res.status >= 500) throw new Error("Base44 is experiencing server issues. Please try again in a moment.");
    const body = await res.text().catch(() => "");
    let msg = "An unexpected error occurred with Base44. Please try again.";
    try {
      const p = JSON.parse(body);
      const raw: string = String(p.message ?? p.error ?? p.detail ?? "");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) msg = raw;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function base44Login({ data }: { data: { email: string; password: string } }) {
  const { email, password } = data;
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 400) {
      const body = await res.text().catch(() => "");
      try {
        const p = JSON.parse(body);
        const raw: string = String(p.message ?? p.error ?? p.detail ?? "");
        if (raw.toLowerCase().includes("google") || raw.toLowerCase().includes("oauth")) {
          throw new Error("This account uses Google sign-in. Please use the Auth Token tab instead.");
        }
      } catch (inner) {
        if (inner instanceof Error && inner.message.includes("Auth Token")) throw inner;
      }
      throw new Error("Invalid email or password. If you signed up with Google, use the Auth Token tab instead.");
    }
    if (res.status >= 500) throw new Error("Base44 is experiencing server issues. Please try again in a moment.");
    throw new Error("Login failed — please check your credentials and try again.");
  }
  const d = await res.json();
  const token: string = d.access_token ?? d.token ?? d.accessToken ?? "";
  if (!token) throw new Error("Base44 did not return a session token. Please try again.");
  const user = d.user ?? {};
  return {
    token,
    email: String(user.email ?? email),
    name: String(user.full_name ?? user.name ?? user.username ?? email),
  };
}

export async function validateBase44Token({ data }: { data: { token: string } }) {
  const me = await b44Fetch("/auth/me", undefined, data.token);
  return {
    email: String(me.email ?? ""),
    name: String(me.full_name ?? me.name ?? me.username ?? ""),
  };
}

export interface Base44App {
  id: string;
  name: string;
  updated_at: string;
  files_count?: number;
  icon?: string;
}

export async function listBase44Apps({ data }: { data: { token: string } }): Promise<Base44App[]> {
  const d = await b44Fetch("/apps", undefined, data.token);
  const raw: any[] = Array.isArray(d) ? d : (d.apps ?? d.data ?? d.results ?? []);
  return raw
    .map(
      (a: any): Base44App => ({
        id: String(a.id ?? a._id ?? a.appId ?? ""),
        name: String(a.name ?? a.title ?? a.app_name ?? "Unnamed App"),
        updated_at: String(
          a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()
        ),
        files_count: Number(a.files_count ?? a.filesCount ?? 0),
        icon: a.icon ?? a.logo ?? a.app_icon ?? a.thumbnail ?? a.image
          ?? a.icon_url ?? a.logoUrl ?? a.iconUrl ?? a.logo_url
          ?? a.metadata?.icon ?? a.metadata?.logo ?? a.settings?.icon
          ?? undefined,
      })
    )
    .filter((a) => a.id.trim() !== "");
}

export interface Base44File {
  path: string;
  content: string;
}

async function getSandboxStatus(appId: string, token: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}/apps/${appId}/sandbox/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return "unknown";
    const json = await res.json().catch(() => ({}));
    return json?.status ?? "unknown";
  } catch {
    return "unknown";
  }
}

async function wakeAndWaitForSandbox(
  appId: string,
  token: string,
  onStatus?: (status: string) => void,
  timeoutMs = 60_000
): Promise<void> {
  onStatus?.("Base44 sandbox is sleeping. Sending wake signal...");
  for (const path of [
    `/apps/${appId}/sandbox/start`,
    `/apps/${appId}/sandbox/wake`,
  ]) {
    try {
      await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
    } catch {}
  }

  const startTime = Date.now();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onStatus?.(`Waking Base44 sandbox container... (${elapsed}s elapsed)`);
    const status = await getSandboxStatus(appId, token);
    if (status === "alive") {
      onStatus?.("Base44 sandbox is active. Fetching source files...");
      return;
    }
    await new Promise((r) => setTimeout(r, 2_500));
  }

  const err: any = new Error(
    "The Base44 sandbox is sleeping or taking too long to start. Please open your app on Base44 to start the container, then try again."
  );
  err.isContainerSleeping = true;
  err.platform = "base44";
  throw err;
}

export async function fetchBase44AppFiles({
  data,
  onStatus,
}: {
  data: { token: string; appId: string };
  onStatus?: (status: string) => void;
}): Promise<Base44File[]> {
  const { token, appId } = data;
  onStatus?.("Checking Base44 sandbox status...");
  const status = await getSandboxStatus(appId, token);
  if (status !== "alive") {
    await wakeAndWaitForSandbox(appId, token, onStatus);
  }

  onStatus?.("Downloading source files from Base44 sandbox...");
  const d = await b44Fetch(`/apps/${appId}/sandbox/files`, undefined, token);
  const filesObj: Record<string, string> = d?.files ?? {};

  return Object.entries(filesObj)
    .filter(([path, content]) => path.trim() !== "" && content !== undefined && content !== null)
    .map(
      ([path, content]): Base44File => ({
        path,
        content: typeof content === "string" ? content : (() => { try { return JSON.stringify(content, null, 2); } catch { return String(content); } })(),
      })
    );
}

export interface Base44BadgeResult {
  cleanedCount: number;
  files: Base44File[];
  modifiedFiles: string[];
}

/**
 * Removes "Made with Base44" / Base44 watermarks and badges from project files.
 * Injects CSS hiding rules and cleans badge JSX/HTML from all components and layouts.
 */
export function cleanBase44Files(files: Base44File[]): Base44BadgeResult {
  const BADGE_CSS =
    "\n\n/* Push44 – Hide Base44 branding badge */\n" +
    "#base44-edit-badge, #base44-badge, .base44-badge, a[href*='base44.com'], [data-base44-badge], .made-with-base44 {\n" +
    "  display: none !important;\n" +
    "  visibility: hidden !important;\n" +
    "  opacity: 0 !important;\n" +
    "  pointer-events: none !important;\n" +
    "}\n";

  const BADGE_HTML_BLOCKER =
    `\n    <!-- Push44 – Base44 Badge Blocker -->\n` +
    `    <style>#base44-edit-badge,#base44-badge,.base44-badge,a[href*='base44.com'],[data-base44-badge],.made-with-base44{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}</style>\n`;

  let cleanedCount = 0;
  const modifiedFiles: string[] = [];

  const updatedFiles = files.map((file) => {
    let content = file.content;
    let modified = false;

    // 1. Clean CSS files
    if (
      file.path.endsWith(".css") ||
      file.path === "src/index.css" ||
      file.path === "src/App.css" ||
      file.path === "src/styles.css" ||
      file.path === "src/globals.css"
    ) {
      if (!content.includes("Hide Base44 branding badge")) {
        content = content + BADGE_CSS;
        modified = true;
      }
    }

    // 2. Clean index.html
    if (file.path.endsWith("index.html")) {
      const stripped = content
        .replace(/<script[^>]*base44[^>]*><\/script>/gi, "")
        .replace(/<a[^>]*href=["'][^"']*base44\.com[^"']*["'][^>]*>.*?<\/a>/gi, "");

      if (stripped !== content) {
        content = stripped;
        modified = true;
      }

      if (!content.includes("Base44 Badge Blocker")) {
        if (content.includes("</head>")) {
          content = content.replace("</head>", `${BADGE_HTML_BLOCKER}</head>`);
          modified = true;
        } else if (content.includes("<body")) {
          content = content.replace("<body", `${BADGE_HTML_BLOCKER}<body`);
          modified = true;
        }
      }
    }

    // 3. Clean JSX / TSX components
    if (file.path.endsWith(".jsx") || file.path.endsWith(".tsx") || file.path.endsWith(".js") || file.path.endsWith(".ts")) {
      const cleaned = content
        .replace(/<a[^>]*href=["'][^"']*base44\.com[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
        .replace(/<div[^>]*className=["'][^"']*(?:base44-badge|made-with-base44)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");

      if (cleaned !== content) {
        content = cleaned;
        modified = true;
      }
    }

    if (modified) {
      cleanedCount++;
      modifiedFiles.push(file.path);
    }

    return { path: file.path, content };
  });

  return { cleanedCount, files: updatedFiles, modifiedFiles };
}

/**
 * Remove Base44 badge / watermark from an app's files.
 */
export async function removeBase44Badge({
  files,
}: {
  files: Base44File[];
}): Promise<Base44BadgeResult> {
  return cleanBase44Files(files);
}

export type Base44LiveRemoveStep =
  | "waking-sandbox"
  | "checking-css"
  | "sending-instruction"
  | "waiting-ai"
  | "deploying"
  | "done";

export interface Base44LiveRemoveResult {
  publishedUrl: string;
  checkpointId?: string;
}

/**
 * Permanently removes the "Made with Base44" / Edit badge from the LIVE Base44 deployed website.
 *
 * Flow:
 * 1. Checks current project files in sandbox for CSS badge hiding rules.
 * 2. If needed, instructs Base44 AI to inject the badge blocker into index.css.
 * 3. Triggers POST /api/apps/:appId/deploy so Base44 rebuilds and deploys the live site without the badge.
 */
export async function removeBase44LiveBadge({
  data,
  onStep,
}: {
  data: { token: string; appId: string };
  onStep?: (step: Base44LiveRemoveStep) => void;
}): Promise<Base44LiveRemoveResult> {
  const { token, appId } = data;
  const notify = (s: Base44LiveRemoveStep) => { try { onStep?.(s); } catch {} };

  notify("checking-css");

  // 1. Fetch published URL
  let publishedUrl = "";
  try {
    const pubRes = await b44Fetch(`/apps/platform/${appId}/published-url`, undefined, token);
    publishedUrl = pubRes?.url || "";
  } catch {}

  if (!publishedUrl) {
    try {
      const app = await b44Fetch(`/apps/${appId}`, undefined, token);
      if (app?.slug) {
        publishedUrl = `https://${app.slug}.base44.app`;
      }
    } catch {}
  }

  // 2. Check if CSS is already hiding the badge in sandbox files
  let hasBlocker = false;
  try {
    const files = await fetchBase44AppFiles({
      data: { token, appId },
      onStatus: (st) => {
        if (st.toLowerCase().includes("waking") || st.toLowerCase().includes("sleeping")) {
          notify("waking-sandbox");
        }
      },
    });
    const css = files.find(f => f.path.endsWith(".css") || f.path === "src/index.css");
    if (css?.content && css.content.includes("base44-edit-badge")) {
      hasBlocker = true;
    }
  } catch {}

  // 3. If not present, send prompt to Base44 AI to inject CSS blocker
  if (!hasBlocker) {
    notify("sending-instruction");
    await b44Fetch(`/apps/${appId}/chat/message`, {
      method: "POST",
      body: JSON.stringify({
        content: "Add CSS to src/index.css to permanently hide the Base44 branding badge: #base44-edit-badge, #base44-badge, div[id*='base44'], .base44-badge { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }",
        role: "user",
        file_urls: [],
        custom_context: [],
        additional_message_params: {
          from_mobile: false,
        },
      }),
    }, token);

    notify("waiting-ai");
    await new Promise((r) => setTimeout(r, 8_000));
  }

  // 4. Trigger live deploy on Base44
  notify("deploying");
  const deployRes = await b44Fetch(`/apps/${appId}/deploy`, {
    method: "POST",
    body: JSON.stringify({}),
  }, token);

  notify("done");

  return {
    publishedUrl: publishedUrl || (deployRes?.slug ? `https://${deployRes.slug}.base44.app` : "https://app.base44.com"),
    checkpointId: deployRes?.last_deployed_checkpoint_id,
  };
}
