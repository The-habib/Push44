import JSZip from "jszip";

const PROXY = "/api/bolt";

// Injected into the user's JS bundle — removes the "Made in Bolt" badge.
// badge.js creates a <div> with zIndex 2147483647 in a Shadow DOM.
// We fingerprint by zIndex (not innerHTML, which doesn't penetrate Shadow DOM).
// The `f` guard flag in badge.js ensures once we remove it, it stays gone.
const BADGE_BLOCKER_JS =
  `/* Push44 – removes the "Made in Bolt" badge */\n` +
  `;(function removeBoltBadge(){` +
  `function isBadge(n){return n&&n.nodeType===1&&n.tagName==="DIV"&&n.style&&n.style.zIndex==="2147483647"&&n.style.position==="fixed";}` +
  `function sweep(){try{document.querySelectorAll("div").forEach(function(el){if(isBadge(el))el.remove();});}catch(e){}}` +
  `var obs=new MutationObserver(function(muts){muts.forEach(function(m){m.addedNodes.forEach(function(n){if(isBadge(n))n.remove();});});});` +
  `obs.observe(document.documentElement,{childList:true,subtree:true});` +
  `sweep();setTimeout(sweep,500);setTimeout(sweep,1700);setTimeout(sweep,3000);` +
  `document.addEventListener("DOMContentLoaded",sweep);` +
  `})();\n`;

async function boltFetch(
  path: string,
  token: string,
  opts?: RequestInit
): Promise<Response> {
  const headers: Record<string, string> = {
    "X-Bolt-Token": token,
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  return fetch(`${PROXY}${path}`, { ...opts, headers });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BoltProject {
  projectId: string;
  siteUrl: string;
  updatedAt: string;
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
 * Validate a bolt.new session token + project ID.
 * Calls GET /api/deploy/{projectId} and returns the project info.
 */
export async function validateBoltProject({
  data,
}: {
  data: { token: string; projectId: string };
}): Promise<BoltProject> {
  const { token, projectId } = data;

  let res: Response;
  try {
    res = await boltFetch(`/api/deploy/${projectId}`, token);
  } catch {
    throw new Error(
      "Could not reach bolt.new. Check your internet connection."
    );
  }

  if (res.status === 401) {
    throw new Error(
      "Your bolt.new session has expired.\n\n" +
        "To get a fresh token:\n" +
        "1. Go to bolt.new and log in\n" +
        "2. Open DevTools (F12) → Application → Cookies → bolt.new\n" +
        "3. Copy the Value of the cookie named: __session\n" +
        "4. Paste it here"
    );
  }
  if (res.status === 404) {
    throw new Error(
      `Project ${projectId} not found. Double-check the ID from your bolt.new editor URL (bolt.new/~/PROJECT_ID).`
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `bolt.new returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }

  const d = await res.json().catch(() => ({}));
  const rawSiteUrl: string = d.site_url ?? "";
  if (!rawSiteUrl) {
    throw new Error(
      "Project exists but has no live URL yet. Deploy it once from the bolt.new editor first, then come back."
    );
  }

  // Normalize to bare host (strip https:// or http://) so URL construction
  // in removeBoltBadge (`https://${siteUrl}/...`) is always well-formed.
  const siteUrl = rawSiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return { projectId, siteUrl, updatedAt: d.updated_at ?? "" };
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
    const res = await boltFetch(`/api/projects/${data.projectId}/badge`, data.token);
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
 * Full workflow (see docs/research/bolt-new-api.md for background):
 *  1. Fetch live HTML → parse JS/CSS filenames
 *  2. Download assets (JS bundle, CSS, favicon)
 *  3. Prepend BADGE_BLOCKER_JS to the JS bundle
 *  4. Fire-and-forget: DELETE /api/deploy/{pid}/badge (server-side flag)
 *  5. Build ZIP (JSZip)
 *  6. PUT /api/deploy/{pid} → staging
 *  7. POST /api/deploy/{pid}/promote → live
 *
 * The badge removal is permanent until the user makes a new deploy from
 * the bolt.new editor (which generates a new content-hashed JS bundle).
 * Users should re-run Push44 after each new editor deployment.
 */
export async function removeBoltBadge({
  data,
  onStep,
}: {
  data: { token: string; projectId: string; siteUrl: string };
  onStep?: (step: BoltRemoveStep, detail?: string) => void;
}): Promise<{ siteUrl: string }> {
  const { token, projectId, siteUrl } = data;
  const notify = (s: BoltRemoveStep, d?: string) => onStep?.(s, d);

  // ── Step 1: Fetch live HTML ──────────────────────────────────────────────
  notify("fetching-html");

  let html: string;
  try {
    const htmlRes = await fetch(`https://${siteUrl}/`);
    if (!htmlRes.ok) {
      throw new Error(
        `Live site returned ${htmlRes.status}. Make sure the project is deployed in bolt.new.`
      );
    }
    html = await htmlRes.text();
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
    fetch(`https://${siteUrl}/assets/${jsFile}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to download JS bundle (${r.status})`);
        return r.arrayBuffer();
      }),
    cssFile
      ? fetch(`https://${siteUrl}/assets/${cssFile}`)
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .catch(() => null)
      : Promise.resolve(null),
    fetch(`https://${siteUrl}/vite.svg`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null),
  ]);

  // Prepend badge blocker to JS bundle
  const blockerBytes = new TextEncoder().encode(BADGE_BLOCKER_JS);
  const jsWithBlocker = new Uint8Array(blockerBytes.length + jsBuf.byteLength);
  jsWithBlocker.set(blockerBytes, 0);
  jsWithBlocker.set(new Uint8Array(jsBuf), blockerBytes.length);

  // ── Step 3: Disable server-side badge flag (fire-and-forget) ────────────
  boltFetch(`/api/deploy/${projectId}/badge`, token, { method: "DELETE" }).catch(() => {});

  // ── Step 4: Build ZIP ────────────────────────────────────────────────────
  notify("building-zip");

  const zip = new JSZip();

  // index.html is ignored by bolt.new's CDN (they serve their own HTML),
  // but we include it so the ZIP is structurally valid.
  const indexHtml =
    `<!doctype html><html lang="en"><head>` +
    `<meta charset="UTF-8" />` +
    `<link rel="icon" type="image/svg+xml" href="/vite.svg" />` +
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` +
    `<script type="module" crossorigin src="/assets/${jsFile}"></script>` +
    (cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : "") +
    `</head><body></body></html>`;

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

  const putRes = await boltFetch(`/api/deploy/${projectId}`, token, {
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

  const promoteRes = await boltFetch(`/api/deploy/${projectId}/promote`, token, {
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
