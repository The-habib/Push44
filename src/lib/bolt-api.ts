import JSZip from "jszip";

const PROXY = "/api/bolt";

// ── Email / password login ────────────────────────────────────────────────────

/**
 * Log in to bolt.new with email + password.
 * Calls the /api/bolt-login serverless proxy which runs the full
 * PKCE OAuth2 flow (bolt.new → stackblitz.com → bolt.new/oauth2).
 * Returns the __session cookie value and the email used to log in.
 */
export async function boltLogin({
  data,
}: {
  data: { email: string; password: string };
}): Promise<{ token: string; email: string }> {
  let res: Response;
  try {
    res = await fetch("/api/bolt-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: data.email, password: data.password }),
    });
  } catch {
    throw new Error(
      "Could not reach the login service. Check your internet connection."
    );
  }

  const body = await res.json().catch(() => ({})) as any;
  if (!res.ok || body.error) {
    throw new Error(body.error ?? `Login failed (${res.status})`);
  }

  const token: string = body.token ?? "";
  if (!token) {
    throw new Error(
      "Login succeeded but no session was returned. Please try again."
    );
  }
  return { token, email: String(body.email ?? data.email) };
}

// Injected into the user's JS bundle — removes the "Made in Bolt" badge.
const BADGE_BLOCKER_JS =
  `/* Push44 – removes the "Made in Bolt" badge */\n` +
  `;(function removeBoltBadge(){\n` +
  `function isBadge(n){\n` +
  `  if (!n || n.nodeType !== 1) return false;\n` +
  `  if (n.tagName === "DIV" && n.style && (n.style.zIndex === "2147483647" || n.style.position === "fixed") && (n.shadowRoot || n.querySelector(".badge") || (n.innerHTML && (n.innerHTML.includes("bolt.new") || n.innerHTML.includes("Made in Bolt"))))) return true;\n` +
  `  if (n.tagName === "SCRIPT" && n.src && n.src.includes("bolt.new/badge.js")) return true;\n` +
  `  return false;\n` +
  `}\n` +
  `function sweep(){\n` +
  `  try {\n` +
  `    document.querySelectorAll("script[src*='bolt.new/badge.js']").forEach(function(s){ s.remove(); });\n` +
  `    document.querySelectorAll("div").forEach(function(el){\n` +
  `      if (isBadge(el)) el.remove();\n` +
  `      if (el.shadowRoot) {\n` +
  `        var b = el.shadowRoot.querySelector(".badge") || el.shadowRoot.querySelector(".dialog");\n` +
  `        if (b) el.remove();\n` +
  `      }\n` +
  `    });\n` +
  `  } catch(e){}\n` +
  `}\n` +
  `var obs = new MutationObserver(function(muts){\n` +
  `  muts.forEach(function(m){\n` +
  `    m.addedNodes.forEach(function(n){\n` +
  `      if (isBadge(n)) n.remove();\n` +
  `    });\n` +
  `  });\n` +
  `  sweep();\n` +
  `});\n` +
  `try { obs.observe(document.documentElement, { childList: true, subtree: true }); } catch(e){}\n` +
  `sweep(); setTimeout(sweep, 300); setTimeout(sweep, 1000); setTimeout(sweep, 2500);\n` +
  `if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", sweep); }\n` +
  `})();\n`;

async function boltFetch(
  path: string,
  token: string,
  opts?: RequestInit
): Promise<Response> {
  const isBrowser = typeof window !== "undefined";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = isBrowser
    ? `${PROXY}${cleanPath}`
    : `https://bolt.new/api${cleanPath}`;
  const headers: Record<string, string> = {
    ...(isBrowser ? { "X-Bolt-Token": token } : { Cookie: `__session=${token}`, "User-Agent": "Mozilla/5.0" }),
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  return fetch(url, { ...opts, headers });
}

async function fetchBoltSiteFile(siteUrl: string, path: string = ""): Promise<string> {
  const cleanHost = siteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : (path ? `/${path}` : "");
  const fullUrl = `https://${cleanHost}${cleanPath}`;

  const fetchUrl = typeof window !== "undefined"
    ? `${PROXY}/site?url=${encodeURIComponent(fullUrl)}`
    : fullUrl;

  const res = await fetch(fetchUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`Live site returned ${res.status}. Make sure the project is deployed in bolt.new.`);
  }
  return res.text();
}

async function fetchBoltSiteBuffer(siteUrl: string, path: string = ""): Promise<ArrayBuffer | null> {
  const cleanHost = siteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : (path ? `/${path}` : "");
  const fullUrl = `https://${cleanHost}${cleanPath}`;

  const fetchUrl = typeof window !== "undefined"
    ? `${PROXY}/site?url=${encodeURIComponent(fullUrl)}`
    : fullUrl;

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        Accept: "*/*",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Sanitize and extract the pure session cookie value for bolt.new.
 * Handles:
 * - Cookie header format: "Cookie: __session=...; other=..."
 * - Key-value format: "__session=..."
 * - Quotes: '"..."' or "'...'"
 * - Extra whitespace and newlines
 */
export function cleanBoltToken(token: string): string {
  if (!token) return "";
  let clean = token.trim();

  // Strip leading "Cookie:" or "cookie:"
  clean = clean.replace(/^cookie:\s*/i, "");

  // If user pasted a cookie string containing __session=...
  if (clean.includes("__session=")) {
    const match = clean.match(/(?:^|;\s*)__session=([^;]+)/);
    if (match) {
      clean = match[1].trim();
    } else {
      clean = clean.replace(/^__session=\s*/i, "").trim();
    }
  }

  // Remove surrounding quotes
  clean = clean.replace(/^["']|["']$/g, "").trim();

  // If multiple cookies exist without explicit __session key, take first part
  if (clean.includes(";") && !clean.includes("eyJ")) {
    const first = clean.split(";")[0].trim();
    const eq = first.indexOf("=");
    if (eq !== -1) clean = first.slice(eq + 1).trim();
  }

  return clean;
}

/**
 * Sanitize bolt.new Project ID from various URL patterns:
 * - https://bolt.new/~/sb1-abc123
 * - bolt.new/~/sb1-abc123
 * - https://sb1-abc123.bolt.host
 * - sb1-abc123.bolt.host
 * - ~/sb1-abc123
 * - sb1-abc123
 */
export function cleanBoltProjectId(projectId: string): string {
  if (!projectId) return "";
  let id = projectId.trim();
  id = id.replace(/^https?:\/\//i, "");
  id = id.replace(/^bolt\.new\/(?:~\/|project\/)?/i, "");
  id = id.replace(/^~\//, "");
  id = id.replace(/\.bolt\.host\/?$/i, "");
  id = id.replace(/\/.*$/, "");
  return id.trim();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BoltProject {
  projectId: string;
  siteUrl: string;
  updatedAt: string;
}

export interface BoltProjectItem {
  id: string;
  name: string;
  updated_at: string;
  siteUrl?: string;
}

export type BoltRemoveStep =
  | "fetching-html"
  | "downloading-assets"
  | "building-zip"
  | "uploading"
  | "promoting"
  | "done";

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * List all projects/chats belonging to the authenticated bolt.new user account.
 * Queries GET /api/chats (Bolt apps/workspaces) and GET /api/projects?access=owned (deployed projects).
 */
export async function listBoltProjects({
  data,
}: {
  data: { token: string };
}): Promise<BoltProjectItem[]> {
  const token = cleanBoltToken(data.token);
  if (!token) throw new Error("Enter your bolt.new session token (__session cookie).");

  try {
    const [chatsRes, projRes] = await Promise.all([
      boltFetch("/chats", token).catch(() => null),
      boltFetch("/projects?access=owned", token).catch(() => null),
    ]);

    const items: BoltProjectItem[] = [];
    const seenIds = new Set<string>();

    // 1. Process chats (Bolt.new primary workspace & app container)
    if (chatsRes && chatsRes.ok) {
      const chatsBody = (await chatsRes.json().catch(() => ({}))) as any;
      const chats = Array.isArray(chatsBody?.chats) ? chatsBody.chats : [];
      for (const c of chats) {
        const rawId = String(c.projectId || c.id || "").trim();
        if (!rawId) continue;
        const id = rawId.startsWith("sb1-") ? rawId : `sb1-${rawId}`;
        seenIds.add(id);
        seenIds.add(rawId);
        const name = String(c.description || `Bolt Project ${rawId}`).trim();
        const updatedAt = c.updatedAt || c.createdAt || new Date().toISOString();
        items.push({
          id,
          name,
          updated_at: updatedAt,
          siteUrl: `https://bolt.new/~/sb1-${rawId.replace(/^sb1-/, "")}`,
        });
      }
    }

    // 2. Process deployed projects (if any)
    if (projRes && projRes.ok) {
      const projBody = (await projRes.json().catch(() => ({}))) as any;
      const projects = Array.isArray(projBody?.projects) ? projBody.projects : [];
      for (const p of projects) {
        const rawId = String(p.slug || p.id || p.projectId || "").trim();
        if (!rawId) continue;
        const id = rawId.startsWith("sb1-") ? rawId : `sb1-${rawId}`;
        if (seenIds.has(id) || seenIds.has(rawId)) continue;
        seenIds.add(id);
        seenIds.add(rawId);
        const name = String(p.title || p.name || p.publishedUrl || p.slug || id).trim();
        const updatedAt = p.updatedAt || p.updated_at || p.createdAt || new Date().toISOString();
        items.push({
          id,
          name,
          updated_at: updatedAt,
          siteUrl: p.publishedUrl || p.siteUrl || `https://${rawId}.bolt.host`,
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}

/**
 * Validate a bolt.new session token + project ID.
 * Calls GET /api/deploy/{projectId} and returns the project info.
 */
export async function validateBoltProject({
  data,
}: {
  data: { token: string; projectId: string };
}): Promise<BoltProject> {
  const token = cleanBoltToken(data.token);
  const projectId = cleanBoltProjectId(data.projectId);
  const deployId = projectId.replace(/^sb\d+-/i, "");

  if (!projectId) {
    throw new Error(
      "Enter your Project ID from the bolt.new editor URL: bolt.new/~/PROJECT_ID"
    );
  }

  if (!token) {
    throw new Error(
      "Enter your bolt.new session token (__session cookie)."
    );
  }

  let res: Response;
  try {
    res = await boltFetch(`/deploy/${deployId}`, token);
  } catch {
    throw new Error(
      "Could not reach bolt.new. Check your internet connection."
    );
  }

  if (res.status === 401) {
    throw new Error(
      "Your bolt.new session has expired or is invalid.\n\n" +
        "To get a fresh session token:\n" +
        "1. Go to bolt.new and log in\n" +
        "2. Open DevTools (F12) → Application → Cookies → bolt.new\n" +
        "3. Copy the Value of the cookie named: __session\n" +
        "4. Paste it in the Session Cookie field"
    );
  }

  if (res.ok) {
    const d = await res.json().catch(() => ({}));
    const rawSiteUrl: string = d.site_url ?? "";
    const siteUrl = rawSiteUrl
      ? rawSiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : (projectId.startsWith("sb1-") ? `${projectId}.bolt.host` : `sb1-${deployId}.bolt.host`);
    return { projectId, siteUrl, updatedAt: d.updated_at ?? "" };
  }

  if (res.status === 404) {
    const candidateHost = projectId.startsWith("sb1-") ? `${projectId}.bolt.host` : `sb1-${deployId}.bolt.host`;
    try {
      const liveCheck = await fetch(`https://${candidateHost}/`, {
        method: "HEAD",
        signal: AbortSignal.timeout(6000),
      });
      if (liveCheck.ok || liveCheck.status < 500) {
        return { projectId, siteUrl: candidateHost, updatedAt: "" };
      }
    } catch {
      // live check failed — project may not be published yet
    }
    return { projectId, siteUrl: candidateHost, updatedAt: "" };
  }

  const body = await res.text().catch(() => "");
  throw new Error(
    `bolt.new returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`
  );
}

/**
 * Check whether the server-side badge flag is currently enabled.
 * GET /api/projects/{projectId}/badge → true|false
 */
export async function getBoltBadgeState({
  data,
}: {
  data: { token: string; projectId: string };
}): Promise<boolean> {
  try {
    const deployId = cleanBoltProjectId(data.projectId).replace(/^sb\d+-/i, "");
    const res = await boltFetch(`/projects/${deployId}/badge`, data.token);
    if (!res.ok) return true;
    const text = await res.text();
    return text.trim() !== "false";
  } catch {
    return true;
  }
}

/**
 * Remove the "Made in Bolt" badge from a bolt.new project.
 *
 * Full workflow:
 *  1. Fetch live HTML → parse JS/CSS filenames
 *  2. Download assets (JS bundle, CSS, favicon)
 *  3. Prepend BADGE_BLOCKER_JS to the JS bundle
 *  4. Fire-and-forget: DELETE /api/deploy/{deployId}/badge (server-side flag)
 *  5. Build ZIP (JSZip)
 *  6. PUT /api/deploy/{deployId} → staging
 *  7. POST /api/deploy/{deployId}/promote → live
 */
export async function removeBoltBadge({
  data,
  onStep,
}: {
  data: { token: string; projectId: string; siteUrl?: string };
  onStep?: (step: BoltRemoveStep, detail?: string) => void;
}): Promise<{ siteUrl: string }> {
  const token = cleanBoltToken(data.token);
  const projectId = cleanBoltProjectId(data.projectId);
  const deployId = projectId.replace(/^sb\d+-/i, "");
  const notify = (s: BoltRemoveStep, d?: string) => onStep?.(s, d);

  if (!token) throw new Error("Bolt session token is required.");
  if (!projectId) throw new Error("Bolt project ID is required.");

  let siteUrl = (data.siteUrl || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (!siteUrl) {
    try {
      const info = await validateBoltProject({ data: { token, projectId } });
      siteUrl = info.siteUrl;
    } catch {
      siteUrl = projectId.startsWith("sb1-") ? `${projectId}.bolt.host` : `sb1-${deployId}.bolt.host`;
    }
  }

  // ── Step 1: Fetch live HTML ──────────────────────────────────────────────
  notify("fetching-html");

  let html: string;
  try {
    html = await fetchBoltSiteFile(siteUrl, "/");
  } catch (e: any) {
    if (e?.message?.includes("returned")) throw e;
    throw new Error(
      `Could not fetch live site at ${siteUrl}. Check your internet connection.`
    );
  }

  const jsMatch  = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
  const cssMatch = html.match(/href="\/assets\/(index-[^"]+\.css)"/);

  if (!jsMatch) {
    throw new Error(
      "Could not find the JS bundle filename in the live HTML. " +
        "The site may still be building — try again in 30 seconds."
    );
  }

  const jsFile  = jsMatch[1];
  const cssFile = cssMatch?.[1] ?? null;

  // ── Step 2: Download assets ──────────────────────────────────────────────
  notify("downloading-assets", jsFile);

  const [jsBuf, cssBuf, svgBuf] = await Promise.all([
    fetchBoltSiteBuffer(siteUrl, `/assets/${jsFile}`).then((buf) => {
      if (!buf) throw new Error("Failed to download JS bundle");
      return buf;
    }),
    cssFile ? fetchBoltSiteBuffer(siteUrl, `/assets/${cssFile}`) : Promise.resolve(null),
    fetchBoltSiteBuffer(siteUrl, "/vite.svg"),
  ]);

  // Prepend badge blocker to JS bundle
  const blockerBytes = new TextEncoder().encode(BADGE_BLOCKER_JS);
  const jsWithBlocker = new Uint8Array(blockerBytes.length + jsBuf.byteLength);
  jsWithBlocker.set(blockerBytes, 0);
  jsWithBlocker.set(new Uint8Array(jsBuf), blockerBytes.length);

  // ── Step 3: Disable server-side badge flag (fire-and-forget) ────────────
  boltFetch(`/deploy/${deployId}/badge`, token, { method: "DELETE" }).catch(() => {});

  // ── Step 4: Build ZIP ────────────────────────────────────────────────────
  notify("building-zip");

  const zip = new JSZip();

  const indexHtml =
    `<!doctype html><html lang="en"><head>` +
    `<meta charset="UTF-8" />` +
    `<link rel="icon" type="image/svg+xml" href="/vite.svg" />` +
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` +
    `<script type="module" crossorigin src="/assets/${jsFile}"></script>` +
    (cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : "") +
    `</head><body><div id="root"></div></body></html>`;

  zip.file("index.html", indexHtml);
  zip.file(`assets/${jsFile}`, jsWithBlocker);
  if (cssFile && cssBuf) zip.file(`assets/${cssFile}`, cssBuf);
  if (svgBuf) zip.file("vite.svg", svgBuf);

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // ── Step 5: Upload to staging ─────────────────────────────────────────────
  notify("uploading");

  const putRes = await boltFetch(`/deploy/${deployId}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/zip" } as any,
    body: zipBlob,
  });

  if (!putRes.ok) {
    const errText = await putRes.text().catch(() => "");
    throw new Error(
      `Upload failed (${putRes.status})${errText ? `: ${errText.slice(0, 200)}` : ""}. ` +
        "Your session token may have expired."
    );
  }

  // ── Step 6: Promote to live ───────────────────────────────────────────────
  notify("promoting");

  const promoteRes = await boltFetch(`/deploy/${deployId}/promote`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" } as any,
    body: "{}",
  });

  if (!promoteRes.ok) {
    const errText = await promoteRes.text().catch(() => "");
    throw new Error(
      `Promote failed (${promoteRes.status})${errText ? `: ${errText.slice(0, 200)}` : ""}`
    );
  }

  const result = await promoteRes.json().catch(() => ({}));
  notify("done");

  const rawResult: string = result.site_url ?? siteUrl;
  return { siteUrl: rawResult.replace(/^https?:\/\//, "").replace(/\/$/, "") };
}
