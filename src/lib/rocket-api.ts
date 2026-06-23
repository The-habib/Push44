// Rocket.new API — reverse-engineered from assets.rocket.new JS bundles (June 2026).
//
// API constants discovered in chunk 0na6fda2v8.fm.js:
//   AUTH_BASE  = https://appuser.dhiwise.com      (r in bundle)
//   BACK_BASE  = https://back.rocket.new          (s in bundle)
//   GATEWAY    = https://gateway.rocket.new       (i in bundle)
//   APP_BASE   = https://application.rocket.new   (c in bundle)
//   PROJECT    = https://project.rocket.new       (p in bundle)
//   path prefixes: auth/v3 (h), api/v1 (m), web/v1 (f), web/v3 ($)
//
// Token format: "JWT <token>"  (NOT "Bearer") for appuser.dhiwise.com
// back.rocket.new uses server-side sessions — must establish via loginToBack()
// Responses may be AES-256-CBC encrypted.

const AUTH_BASE    = "https://appuser.dhiwise.com";
const BACK_BASE    = "https://back.rocket.new";
const GATEWAY_BASE = "https://gateway.rocket.new";
const APP_BASE     = "https://application.rocket.new";

// AES-256-CBC key — hardcoded in the Rocket.new JS bundle (decryptObject function)
const AES_KEY_B64 = "dqf8SIWZdQtptMTEH45CHo4A0DJLrkq02y80wmirLYo";

// ─── Decryption ───────────────────────────────────────────────────────────────

function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function importAesKey(keyB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    b64ToBytes(keyB64),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
}

function isEncryptedPayload(v: any): v is { requestAnchor: string; processedContent: string } {
  return (
    v &&
    typeof v === "object" &&
    typeof v.requestAnchor === "string" &&
    typeof v.processedContent === "string" &&
    v.requestAnchor.length > 0 &&
    v.processedContent.length > 0
  );
}

async function rocketDecrypt(data: any): Promise<any> {
  if (!isEncryptedPayload(data)) return data;
  try {
    const key = await importAesKey(AES_KEY_B64);
    const iv = b64ToBytes(data.requestAnchor);
    const ciphertext = b64ToBytes(data.processedContent);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, ciphertext);
    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text);
  } catch {
    return data;
  }
}

// ─── JWT decode ───────────────────────────────────────────────────────────────
// Extract companyId/workspaceId from the JWT payload without any API call.
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    // Strip "JWT " or "Bearer " prefix if present
    const raw = token.replace(/^(JWT|Bearer)\s+/i, "");
    const parts = raw.split(".");
    if (parts.length < 2) return null;
    // Base64url → base64 → decode
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64.padEnd(b64.length + (4 - b64.length % 4) % 4, "="));
    return JSON.parse(json);
  } catch { return null; }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

// Headers for appuser.dhiwise.com (auth service) — uses "JWT" prefix
function authHeaders(token: string, extra?: Record<string, string>): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `JWT ${token}`,
    pageURL: "https://rocket.new",
    ...extra,
  };
}

// Headers for back.rocket.new — tries Bearer first, falls back to JWT
function backHeaders(token: string, companyId?: string): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    pageURL: "https://rocket.new",
  };
  if (companyId) h.companyId = companyId;
  return h;
}

// Alternative: JWT format for back.rocket.new
function backHeadersJWT(token: string, companyId?: string): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `JWT ${token}`,
    pageURL: "https://rocket.new",
  };
  if (companyId) h.companyId = companyId;
  return h;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = await res.text().catch(() => "");
  try {
    const p = JSON.parse(body);
    const plain = p.message ?? p.error ?? p.detail ?? p.msg;
    if (plain) return String(plain);
    const dec = await rocketDecrypt(p).catch(() => p);
    return String(dec?.message ?? dec?.error ?? fallback);
  } catch {
    return body.trim() || fallback;
  }
}

// ─── Session establishment ────────────────────────────────────────────────────
// back.rocket.new uses Sails.js server-side sessions.
// We must call a login endpoint on back.rocket.new to create a session,
// then use the returned token for all subsequent back.rocket.new calls.

async function loginToBack(authToken: string): Promise<string | null> {
  const log = (label: string, val: any) =>
    console.warn(`[push44:login] ${label}`, JSON.stringify(val).slice(0, 400));

  // Possible back.rocket.new login endpoints (Sails.js conventions)
  const loginEndpoints = [
    `${BACK_BASE}/api/v1/auth/user-login`,
    `${BACK_BASE}/api/v1/auth/login`,
    `${BACK_BASE}/api/v1/user/login`,
    `${BACK_BASE}/api/v1/auth/sso-login`,
    `${BACK_BASE}/api/v1/auth/token-login`,
  ];

  for (const url of loginEndpoints) {
    // Try with JWT header
    for (const headers of [
      { "Content-Type": "application/json", Authorization: `JWT ${authToken}`, pageURL: "https://rocket.new" },
      { "Content-Type": "application/json", Authorization: `Bearer ${authToken}`, pageURL: "https://rocket.new" },
    ]) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ token: authToken }),
        });
        const raw = await res.json().catch(() => null);
        if (!raw) continue;
        const d = await rocketDecrypt(raw);
        log(`${res.status} login attempt ${url}`, d);
        if (res.ok && d) {
          const p = d.data ?? d;
          const tok = p.token ?? p.access_token ?? p.sessionToken ?? p.backToken ?? p.jwt;
          if (tok) { log("back session token obtained", "ok"); return String(tok); }
        }
      } catch { /* try next */ }
    }
  }

  log("loginToBack", "no session established, proceeding with auth token directly");
  return null;
}

// ─── OTP auth ────────────────────────────────────────────────────────────────

export async function rocketRequestOTP({ data }: { data: { email: string } }) {
  const res = await fetch(`${AUTH_BASE}/auth/v3/rocket/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email }),
  });
  if (!res.ok) throw new Error(await parseError(res, `Failed to send OTP (${res.status})`));
}

export async function rocketVerifyOTP({ data }: { data: { email: string; otp: string } }) {
  const res = await fetch(`${AUTH_BASE}/auth/v3/rocket/verify-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, otp: data.otp }),
  });
  if (!res.ok) throw new Error(await parseError(res, `OTP verification failed (${res.status})`));
  const raw = await res.json();
  const d = await rocketDecrypt(raw);
  console.warn("[push44:otp] full response", JSON.stringify(d).slice(0, 3000));
  const payload = d.data ?? d;
  // Capture ALL possible tokens from auth response
  const token: string =
    payload.token ?? payload.access_token ?? payload.accessToken ??
    payload.jwtToken ?? payload.authToken ?? payload.jwt ?? "";
  if (!token) throw new Error("No token returned from Rocket.new. Check your OTP code.");
  const user = payload.user ?? payload;
  // companyId may live at data.companyId OR data.user.companyId
  const companyId: string =
    payload.companyId ?? payload.company_id ??
    payload.workspaceId ?? payload.workspace_id ??
    user.companyId ?? user.company_id ??
    user.workspaceId ?? user.workspace_id ?? "";
  return {
    token,
    companyId,
    email: String(user.email ?? data.email),
    name: String(user.name ?? user.fullName ?? user.full_name ?? user.username ?? user.displayName ?? data.email),
  };
}

// ─── Token validation ─────────────────────────────────────────────────────────

export async function validateRocketToken({ data }: { data: { token: string } }) {
  for (const url of [
    `${AUTH_BASE}/auth/v3/get-user-from-token-r`,
    `${AUTH_BASE}/web/v1/user/get-profile`,
  ]) {
    try {
      const res = await fetch(url, { method: "GET", headers: authHeaders(data.token) });
      if (!res.ok) continue;
      const raw = await res.json();
      const d = await rocketDecrypt(raw);
      console.warn("[push44:validate] profile", JSON.stringify(d).slice(0, 3000));
      const payload = d.data ?? d;
      const user = payload.user ?? payload;
      const email = String(user.email ?? payload.email ?? "");
      const name  = String(user.name ?? user.full_name ?? user.username ?? user.displayName ?? payload.full_name ?? "");
      const companyId = String(
        payload.companyId ?? payload.company_id ??
        user.companyId ?? user.company_id ??
        user.defaultWorkspaceId ?? user.workspaceId ??
        payload.defaultWorkspaceId ?? payload.workspaceId ?? ""
        // Note: do NOT fall back to _id — the companyId must be a real workspace ID
      );
      if (email) return { email, name, companyId };
    } catch { /* try next */ }
  }
  throw new Error("Token validation failed. Make sure you pasted the correct Rocket.new API token.");
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface RocketApp {
  id: string;           // thread _id (used as primary key throughout the app)
  applicationId?: string; // threadDetails.applicationId — used for file fetching
  name: string;
  updated_at: string;
  icon?: string;
}

function deepFindApps(v: any, depth = 0): any[] {
  if (depth > 5) return [];
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") return v;
  if (v && typeof v === "object") {
    for (const key of ["chatThreads", "threads", "applications", "projects", "apps",
                       "playgroundProjects", "items", "results", "list", "records"]) {
      if (Array.isArray(v[key]) && v[key].length > 0) return v[key];
    }
    for (const key of ["data", "payload", "result", "response", "body"]) {
      if (v[key] !== undefined) {
        const found = deepFindApps(v[key], depth + 1);
        if (found.length > 0) return found;
      }
    }
  }
  return [];
}

function mapToRocketApp(a: any): RocketApp {
  // threadDetails holds applicationId and app name for chat-thread items
  const td = a.threadDetails ?? {};
  return {
    id: String(a._id ?? a.id ?? a.threadId ?? a.chatThreadId ?? a.projectId ?? ""),
    applicationId: td.applicationId ?? td._id ?? a.applicationId ?? undefined,
    name: String(
      a.displayName ?? a.title ?? a.name ?? a.appName ??
      td.name ?? td.appName ??
      a.threadName ?? a.chatThreadName ?? a.projectName ?? a.subject ?? "Untitled"
    ),
    updated_at: String(a.updatedAt ?? a.updated_at ?? a.modifiedAt ?? new Date().toISOString()),
    icon: a.icon ?? a.logo ?? a.thumbnail ?? a.image ?? undefined,
  };
}

export async function listRocketApps({ data }: { data: { token: string; companyId?: string } }): Promise<RocketApp[]> {
  const authToken = data.token;
  let companyId = data.companyId ?? "";

  const log = (label: string, val?: any) =>
    console.warn(`[push44] ${label}`, val !== undefined ? JSON.stringify(val).slice(0, 800) : "");

  // ── Step 1: Resolve companyId — needed as a header for all back.rocket.new calls.
  // (loginToBack is intentionally skipped — it makes 10+ failing requests and adds 20-30s delay.)

  if (!companyId) {
    // 1a. Try JWT claims (no network cost)
    const claims = decodeJwtPayload(authToken);
    if (claims) {
      log("JWT claims", claims);
      companyId = String(
        claims.companyId ?? claims.company_id ??
        claims.workspaceId ?? claims.workspace_id ??
        claims.cid ?? claims.wid ?? ""
      );
      if (companyId) log("companyId from JWT", companyId);
    }
  }

  if (!companyId) {
    // 1b. GET /web/v1/workspace/list on auth server — confirmed working.
    //     Response: { data: { list: [{ companyId: "...", ... }] } }
    try {
      const res = await fetch(`${AUTH_BASE}/web/v1/workspace/list`, {
        method: "GET",
        headers: authHeaders(authToken),
      });
      if (res.ok) {
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        log("workspace/list", d);
        const u = d.data ?? d;
        // Response may be { list: [...] } or { data: { list: [...] } }
        const list: any[] = Array.isArray(u.list) ? u.list
          : Array.isArray(u) ? u : [];
        if (list.length > 0) {
          // companyId is the actual workspace ID, NOT _id
          companyId = String(list[0].companyId ?? list[0].company_id ?? "");
          if (companyId) log("companyId from workspace/list", companyId);
        }
      }
    } catch { /* ignore */ }
  }

  if (!companyId) {
    // 1c. Try profile endpoints as last resort
    for (const url of [
      `${AUTH_BASE}/auth/v3/get-user-from-token-r`,
      `${AUTH_BASE}/web/v1/user/get-profile`,
    ]) {
      try {
        const res = await fetch(url, { method: "GET", headers: authHeaders(authToken) });
        if (!res.ok) continue;
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        const u = d.data ?? d;
        const user = u.user ?? u;
        const cid = String(
          u.companyId ?? u.company_id ??
          user.companyId ?? user.company_id ??
          u.workspaceId ?? user.workspaceId ?? ""
        );
        if (cid && cid !== "undefined") { companyId = cid; log("companyId from profile", cid); break; }
      } catch { /* try next */ }
    }
  }

  log("companyId final", companyId || "(none)");

  if (!companyId) {
    throw new Error(
      "NEEDS_OTP_LOGIN: Your Rocket.new API key doesn't carry workspace info. " +
      "Please reconnect using Login with Email (OTP) to list your projects."
    );
  }

  // ── Step 2: Fetch chat threads — the canonical project list.
  // Confirmed: Bearer auth + companyId header → returns workspace projects.
  const threadHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    companyId,
    pageURL: "https://rocket.new",
  };

  const seen = new Set<string>();
  const allApps: RocketApp[] = [];

  function addApps(arr: any[]) {
    for (const item of arr) {
      const mapped = mapToRocketApp(item);
      if (mapped.id && mapped.id !== "undefined" && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        allApps.push(mapped);
      }
    }
  }

  // Fetch all pages from chat-thread/search (confirmed working with companyId header).
  // Rocket.new returns a paginated list — we must keep fetching until we get an empty page.
  const PAGE_LIMIT = 50;

  async function fetchAllPages(
    url: string,
    headers: Record<string, string>,
    authVariant: "Bearer" | "JWT"
  ): Promise<boolean> {
    let page = 1;
    let gotAny = false;
    while (true) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { ...headers, Authorization: `${authVariant} ${authToken}` },
          body: JSON.stringify({ page, limit: PAGE_LIMIT }),
        });
        if (!res.ok) break;
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        log(`chat-thread/search page=${page} (${authVariant})`, { count: deepFindApps(d).length });
        const arr = deepFindApps(d);
        if (arr.length === 0) break;
        addApps(arr);
        gotAny = true;
        if (arr.length < PAGE_LIMIT) break; // last page
        page++;
      } catch { break; }
    }
    return gotAny;
  }

  // Try back.rocket.new with Bearer auth (primary, confirmed working)
  const baseHeaders = { "Content-Type": "application/json", companyId, pageURL: "https://rocket.new" };
  let gotResults = await fetchAllPages(`${BACK_BASE}/api/v1/chat-thread/search`, baseHeaders, "Bearer");

  // Try JWT format if Bearer returned nothing
  if (!gotResults) {
    gotResults = await fetchAllPages(`${BACK_BASE}/api/v1/chat-thread/search`, baseHeaders, "JWT");
  }

  // Fallback: gateway
  if (!gotResults) {
    try {
      const res = await fetch(`${GATEWAY_BASE}/api/v1/chat-thread/search`, {
        method: "POST",
        headers: { ...baseHeaders, Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ page: 1, limit: PAGE_LIMIT }),
      });
      if (res.ok) {
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        log("gw/chat-thread/search", d);
        addApps(deepFindApps(d));
      }
    } catch { /* ignore */ }
  }

  log("FINAL app count", allApps.length);
  return allApps;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface RocketFile {
  path: string;
  content: string;
}

// Extract files array from any shape of API response
function extractFilesFromPayload(d: any): RocketFile[] | null {
  if (!d || typeof d !== "object") return null;

  const project = d.data ?? d.result ?? d.payload ?? d;

  // Object map: { "src/App.tsx": "...", ... }
  const filesMap =
    project.files ?? project.code ?? project.sourceFiles ??
    project.codeFiles ?? project.fileContents ?? project.source ??
    project.generatedCode ?? project.generatedFiles;

  if (filesMap && typeof filesMap === "object" && !Array.isArray(filesMap)) {
    const entries = Object.entries(filesMap as Record<string, unknown>);
    if (entries.length > 0) {
      return entries
        .filter(([path, content]) => path.trim() !== "" && content !== undefined && content !== null)
        .map(([path, content]): RocketFile => ({
          path,
          content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
        }));
    }
  }

  // Array of { path, content } objects
  const filesArr: any[] =
    Array.isArray(project.files) ? project.files :
    Array.isArray(project.code) ? project.code :
    Array.isArray(project.sourceFiles) ? project.sourceFiles :
    Array.isArray(project.codeFiles) ? project.codeFiles :
    Array.isArray(d) ? d : [];

  if (filesArr.length > 0 && filesArr[0] && (filesArr[0].path || filesArr[0].name || filesArr[0].filename)) {
    return filesArr
      .map((f: any): RocketFile => ({
        path: String(f.path ?? f.name ?? f.filename ?? f.filePath ?? ""),
        content: typeof f.content === "string" ? f.content
          : typeof f.code === "string" ? f.code
          : JSON.stringify(f.content ?? f.code ?? f, null, 2),
      }))
      .filter((f) => f.path.trim() !== "");
  }

  return null;
}

// ── Confirmed working file endpoints (reverse-engineered from Rocket.new JS bundle):
//
//   Project structure (when container sleeping):
//     POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/project-structure
//     Body: { applicationId }  |  Auth: JWT {token}
//
//   File content (when container sleeping):
//     POST https://appcodeformat.dhiwise.com/app-preview/v1/rocket/file-content
//     Body: { applicationId, file: "path/to/file" }  |  Auth: JWT {token}
//
//   Download ZIP (only when dev container is ACTIVE):
//     GET  ${editorBackendURL}/api/download-project?t={timestamp}
//     (editorBackendURL is dynamic — only available via WebSocket when project is open)

const APP_CODE_BASE = "https://appcodeformat.dhiwise.com";

/**
 * Recursively flatten a directory tree into a list of file paths.
 *
 * Handles the confirmed Rocket.new format:
 *   { name, path, type: "file"|"directory", children: [...] }
 * where `path` is the absolute path from the project root (e.g. "/lib/main.dart").
 * Also handles other common tree formats as fallback.
 */
function flattenDirTree(node: any): string[] {
  if (!node || typeof node !== "object") return [];

  // ── Confirmed Rocket.new format: { type, path, children }
  // Each node has path = absolute path like "/lib/main.dart"
  if (typeof node.type === "string" && typeof node.path === "string") {
    if (node.type === "file") {
      // Strip leading slash — file-content endpoint expects relative paths
      const p = String(node.path).replace(/^\/+/, "");
      return p ? [p] : [];
    }
    if (node.type === "directory" || node.type === "folder") {
      return Array.isArray(node.children) ? node.children.flatMap(flattenDirTree) : [];
    }
  }

  // ── Array of nodes
  if (Array.isArray(node)) {
    return node.flatMap((item: any): string[] => {
      if (typeof item === "string") return [item];
      // Recurse into any object — handles { type, path, children } or other formats
      return flattenDirTree(item);
    });
  }

  // ── Fallback: object with `data`/`result`/`payload` wrapper
  const p = node.data ?? node.result ?? node.payload;
  if (p !== undefined) return flattenDirTree(p);

  // ── Fallback: plain object where keys are filenames, values are sub-trees or null
  const paths: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (value === null || value === true || value === false || typeof value === "string") {
      paths.push(key);
    } else if (typeof value === "object") {
      const sub = flattenDirTree(value as any);
      paths.push(...sub.map((f: string) => key + "/" + f));
    }
  }
  return paths;
}

/** Extract file content string from an S3 file-content response. */
function extractContent(d: any): string | null {
  if (!d) return null;
  // Unwrap standard API envelope first: { code:"OK", data: <content> }
  const p = d.data ?? d.result ?? d.payload;
  if (p !== undefined) {
    if (typeof p === "string") return p;
    // Avoid matching d.code:"OK" — only look for real content fields inside p
    const c = p.content ?? p.fileContent ?? p.body ?? p.text ?? p.code ?? p.data;
    if (typeof c === "string") return c;
    if (c !== undefined && c !== null) return JSON.stringify(c, null, 2);
  }
  // Direct fields on d (no envelope)
  const c = d.content ?? d.fileContent ?? d.body ?? d.text;
  if (typeof c === "string") return c;
  return null;
}

// ── Production container ping ─────────────────────────────────────────────────
// Confirmed working (no auth needed):
//   POST https://application.rocket.new/apis/v1/application/production-deploy/ping
//   Body: { applicationId }
//   Returns: { data: { production: { backendUrl, status: { Name: "running" }, ... } } }
//
// The backendUrl is the HTTPS code-editor container endpoint (not the Flutter app).
// When status.Name === "running", the container has a live /api/file-content endpoint:
//   POST {backendUrl}/api/file-content
//   Body: { path: "lib/main.dart" }   ← key is "path", NO auth required!
//   Returns: { path: "/lib/main.dart", content: "..." }
//   Files not in the container return 500 { error: "Failed to read file content" } — skip them.

async function pingProductionContainer(applicationId: string): Promise<{
  backendUrl: string | null;
  running: boolean;
}> {
  try {
    const res = await fetch(
      `${APP_BASE}/apis/v1/application/production-deploy/ping`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      }
    );
    if (!res.ok) return { backendUrl: null, running: false };
    const data = await res.json();
    const prod = data?.data?.production ?? {};
    const statusName: string = prod?.status?.Name ?? "";
    const backendUrl: string = prod.backendUrl ?? "";
    const running = statusName === "running";
    return { backendUrl: backendUrl || null, running };
  } catch {
    return { backendUrl: null, running: false };
  }
}

export async function fetchRocketAppFiles({
  data,
}: {
  data: { token: string; appId: string; applicationId?: string; companyId?: string };
}): Promise<RocketFile[]> {
  const { token, appId } = data;
  let applicationId = data.applicationId ?? "";

  const log = (label: string, val?: any) =>
    console.warn(`[push44:files] ${label}`, val !== undefined ? JSON.stringify(val).slice(0, 800) : "");

  log("fetching files", { appId, applicationId });

  // ── Step 1: Resolve applicationId via chat-thread/get if not already known.
  if (!applicationId) {
    const hdrsVariants = [
      { "Content-Type": "application/json", Authorization: `Bearer ${token}`, pageURL: "https://rocket.new" },
      { "Content-Type": "application/json", Authorization: `JWT ${token}`, pageURL: "https://rocket.new" },
    ];
    for (const hdrs of hdrsVariants) {
      for (const body of [{ id: appId }, { threadId: appId }]) {
        try {
          const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/get`, {
            method: "POST", headers: hdrs, body: JSON.stringify(body),
          });
          if (!res.ok) continue;
          const raw = await res.json().catch(() => null);
          if (!raw) continue;
          const d = await rocketDecrypt(raw);
          log("chat-thread/get", d);
          const thread = d.data ?? d;
          const td = thread.threadDetails ?? {};
          applicationId = String(td.applicationId ?? td._id ?? thread.applicationId ?? "");
          if (applicationId) { log("applicationId from thread", applicationId); break; }
          const files = extractFilesFromPayload(d);
          if (files && files.length > 0) return files;
        } catch { /* try next */ }
      }
      if (applicationId) break;
    }
  }

  log("applicationId", applicationId || "(none)");
  if (!applicationId) {
    throw new Error(
      "Could not resolve application ID for this Rocket.new project. " +
      "The project may not have generated any code yet."
    );
  }

  // ── Step 2: Ping the production container.
  // Confirmed working (no auth needed):
  //   POST https://application.rocket.new/apis/v1/application/production-deploy/ping
  //   Body: { applicationId }
  // Returns backendUrl of the RUNNING code-editor container (not the Flutter app).
  // When running, /api/file-content on that URL needs { path } (no auth, no subscription).
  const { backendUrl, running: containerRunning } = await pingProductionContainer(applicationId);
  log("production ping", { backendUrl, containerRunning });

  // ── Step 3: Get the full file list from the S3-backed project-structure endpoint.
  // Confirmed: returns the directory tree even when container is sleeping.
  // Auth: JWT {token} (Bearer also tried as fallback).
  const s3Headers = [
    { "Content-Type": "application/json", Authorization: `JWT ${token}` },
    { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  ];

  let filePaths: string[] = [];

  for (const hdrs of s3Headers) {
    try {
      const res = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/project-structure`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({ applicationId }),
      });
      log(`project-structure (${hdrs.Authorization.split(" ")[0]})`, res.status);
      if (!res.ok) continue;
      const raw = await res.json().catch(() => null);
      if (!raw) continue;
      const d = await rocketDecrypt(raw);
      const extracted = flattenDirTree(d);
      if (extracted.length > 0) {
        filePaths = extracted.filter((p) => p && !p.endsWith("/"));
        log("file paths count", filePaths.length);
        log("file paths sample", filePaths.slice(0, 10));
        break;
      }
    } catch (e: any) { log("project-structure error", e?.message); }
  }

  // ── Step 4: Fetch file content from the running production container.
  // Confirmed: POST {backendUrl}/api/file-content with { path: "lib/main.dart" }
  // Returns { path: "/lib/main.dart", content: "..." } — NO auth required.
  // Files not present on the production container return 500 — we skip those.
  if (containerRunning && backendUrl && filePaths.length > 0) {
    log("fetching files from running container", backendUrl);
    const BATCH = 20;
    const results: RocketFile[] = [];

    for (let i = 0; i < filePaths.length; i += BATCH) {
      const batch = filePaths.slice(i, i + BATCH);
      const batchResults = await Promise.allSettled(
        batch.map(async (filePath): Promise<RocketFile | null> => {
          try {
            const res = await fetch(`${backendUrl}/api/file-content`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: filePath }),
            });
            if (!res.ok) return null; // 500 = file not in container, skip
            const raw = await res.json().catch(() => null);
            if (!raw) return null;
            const content: string | null =
              typeof raw.content === "string" ? raw.content : extractContent(raw);
            if (content === null) return null;
            return { path: filePath, content };
          } catch { return null; }
        })
      );
      for (const r of batchResults) {
        if (r.status === "fulfilled" && r.value !== null) results.push(r.value);
      }
    }

    if (results.length > 0) {
      log("container file-content fetched", results.length);
      return results;
    }
    log("container returned 0 files — falling through to S3");
  }

  // ── Step 5: S3 file-content fallback.
  // The S3 cache may be stale (returns 500), but worth trying when the container
  // is not running or returned nothing.
  if (filePaths.length > 0) {
    log("trying S3 file-content fallback");
    const BATCH = 20;
    const results: RocketFile[] = [];

    // Probe with and without leading slash to find which format the S3 cache uses
    let useLeadingSlash = false;
    let workingHdrs = s3Headers[0];
    for (const trySlash of [false, true]) {
      for (const hdrs of s3Headers) {
        const fileParam = trySlash ? `/${filePaths[0]}` : filePaths[0];
        try {
          const probe = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/file-content`, {
            method: "POST",
            headers: hdrs,
            body: JSON.stringify({ applicationId, file: fileParam }),
          });
          if (probe.ok) {
            useLeadingSlash = trySlash;
            workingHdrs = hdrs;
            const raw = await probe.json().catch(() => null);
            if (raw) {
              const d = await rocketDecrypt(raw);
              const c = extractContent(d);
              if (c !== null) results.push({ path: filePaths[0], content: c });
            }
            break;
          }
        } catch { /* try next */ }
      }
      if (results.length > 0) break;
    }

    if (results.length > 0) {
      for (let i = 0; i < filePaths.length; i += BATCH) {
        const batch = filePaths.slice(i, i + BATCH).filter((p) => p !== filePaths[0]);
        if (batch.length === 0) continue;
        const batchResults = await Promise.allSettled(
          batch.map(async (filePath): Promise<RocketFile | null> => {
            const fileParam = useLeadingSlash ? `/${filePath}` : filePath;
            try {
              const res = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/file-content`, {
                method: "POST",
                headers: workingHdrs,
                body: JSON.stringify({ applicationId, file: fileParam }),
              });
              if (!res.ok) return null;
              const raw = await res.json().catch(() => null);
              if (!raw) return null;
              const d = await rocketDecrypt(raw);
              const content = extractContent(d);
              if (content === null) return null;
              return { path: filePath, content };
            } catch { return null; }
          })
        );
        for (const r of batchResults) {
          if (r.status === "fulfilled" && r.value !== null) results.push(r.value);
        }
      }
      log("S3 file-content fetched", results.length);
      return results;
    }
  }

  // ── Nothing worked.
  if (!containerRunning) {
    throw new Error(
      "Your Rocket.new project container is not running. " +
      "Open the project in Rocket.new (rocket.new), wait a few seconds for it to load, " +
      "then come back here and try again."
    );
  }

  throw new Error(
    "Could not fetch files from this Rocket.new project. " +
    "The container is running but returned no files. Try again in a few seconds."
  );
}

// ─── APK Build ────────────────────────────────────────────────────────────────
//
// Confirmed endpoints (reverse-engineered from Rocket.new JS bundle, June 2026):
//
//   APP_BASE = https://application.rocket.new
//
//   Check build status:
//     POST ${APP_BASE}/web/v1/playground/apk-build-status
//     Body: { threadId }
//     Auth: Bearer {token}, companyId header
//     Returns: { code:"OK", data: { status: 1|2|3|4|5|6, updatedAt, ... } }
//
//   Trigger APK build:
//     POST ${APP_BASE}/web/v1/playground/make-apk-build
//     Body: { threadId }
//     Auth: Bearer {token}, companyId header
//     Returns: same shape as status check
//
//   Download APK (when status === COMPLETED=3):
//     POST ${APP_BASE}/web/v1/playground/download-apk
//     Body: { threadId }
//     Auth: Bearer {token}, companyId header
//     Returns: { code:"OK", data: { url: "https://..." } }
//
// DEPLOY_PROGRESS enum values (from bundle chunk 0p~gd92karc24.js):
//   IN_QUEUE: 1, IN_PROCESS: 2, COMPLETED: 3, FAILED: 4, QUEUE_BUILD_REJECTED: 5, IDLE: 6
//
// Polling: when IN_QUEUE or IN_PROCESS, poll every 5 seconds.
// Progress calculation: IN_QUEUE → 5%, IN_PROCESS → derived from updatedAt (6-min window, max 95%).

export const APK_STATUS = {
  IN_QUEUE: 1,
  IN_PROCESS: 2,
  COMPLETED: 3,
  FAILED: 4,
  QUEUE_BUILD_REJECTED: 5,
  IDLE: 6,
} as const;

export type ApkStatus = typeof APK_STATUS[keyof typeof APK_STATUS];

export interface ApkBuildState {
  status: ApkStatus;
  updatedAt?: string;
  errorMessage?: string;
  /** true when Rocket.new has hit its internal retry limit — reset is required before rebuilding */
  isMaxApkBuildFailedAttempt?: boolean;
  /** Build ID returned by the API — passed to log endpoints */
  buildId?: string;
  /** Full decrypted payload from the API — used for debugging */
  rawPayload?: Record<string, unknown>;
}

function apkHeaders(token: string, companyId?: string): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    pageURL: "https://rocket.new",
  };
  if (companyId) h.companyId = companyId;
  return h;
}

async function parseApkResponse(res: Response): Promise<ApkBuildState> {
  const raw = await res.json().catch(() => null);
  if (!raw) throw new Error(`APK API error (${res.status})`);
  const d = await rocketDecrypt(raw);
  const payload = d.data ?? d;
  const status: ApkStatus = payload.status ?? APK_STATUS.IDLE;
  console.warn("[push44:apk] response payload keys:", Object.keys(payload || {}));
  console.warn("[push44:apk] status:", status, "isMaxApkBuildFailedAttempt:", payload.isMaxApkBuildFailedAttempt, "errorMessage:", payload.errorMessage ?? payload.error ?? payload.message ?? payload.reason ?? payload.errorMsg);
  return {
    status,
    updatedAt: payload.updatedAt ?? payload.updated_at ?? undefined,
    isMaxApkBuildFailedAttempt: !!payload.isMaxApkBuildFailedAttempt,
    buildId:
      payload.buildId ?? payload.id ?? payload._id ?? payload.build_id ?? undefined,
    errorMessage:
      payload.errorMessage ??
      payload.error ??
      payload.message ??
      payload.reason ??
      payload.errorMsg ??
      payload.failReason ??
      undefined,
    rawPayload: payload as Record<string, unknown>,
  };
}

/**
 * Generate (or re-generate) the Android signing keystore for this thread.
 *
 * This is a REQUIRED pre-build step for fresh Rocket.new accounts.
 * Without a keystore, the APK signing step fails and the build returns
 * status FAILED with isMaxApkBuildFailedAttempt=true after retries.
 *
 * Endpoint confirmed existing in bundle: back.rocket.new/api/v1/chat-thread/generate-keystore
 * Auth: Bearer token + companyId header (same as all back.rocket.new calls).
 */
export async function generateRocketKeystore({
  data,
}: {
  data: { token: string; threadId: string; companyId?: string };
}): Promise<void> {
  const hdrs: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
    pageURL: "https://rocket.new",
  };
  if (data.companyId) hdrs.companyId = data.companyId;

  // Try POST with threadId body first, then bare POST (some generate endpoints ignore body)
  const bodies = [
    JSON.stringify({ threadId: data.threadId }),
    JSON.stringify({ threadId: data.threadId, type: "debug" }),
    JSON.stringify({}),
  ];

  for (const body of bodies) {
    try {
      const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/generate-keystore`, {
        method: "POST",
        headers: hdrs,
        body,
      });
      const rawText = await res.text().catch(() => "");
      console.warn("[push44:keystore] generate-keystore", {
        status: res.status,
        body: body.slice(0, 80),
        response: rawText.slice(0, 200),
      });
      // 200 or 201 = success, keystore generated
      if (res.ok) return;
      // 400 = keystore already exists — that's fine
      if (res.status === 400 || res.status === 409) return;
    } catch (e: any) {
      console.warn("[push44:keystore] generate-keystore error", e?.message);
    }
  }
  // If it fails, proceed anyway — the build might work with an existing keystore
}

export async function checkRocketApkBuildStatus({
  data,
}: {
  data: { token: string; threadId: string; companyId?: string };
}): Promise<ApkBuildState> {
  const res = await fetch(`${APP_BASE}/web/v1/playground/apk-build-status`, {
    method: "POST",
    headers: apkHeaders(data.token, data.companyId),
    body: JSON.stringify({ threadId: data.threadId }),
  });
  if (!res.ok) throw new Error(`Failed to check APK build status (${res.status})`);
  return parseApkResponse(res);
}

/**
 * Reset a stuck/max-failed APK build state.
 *
 * When isMaxApkBuildFailedAttempt === true, Rocket.new blocks further make-apk-build
 * calls until the failed state is explicitly cleared via this endpoint.
 *
 * Confirmed existing endpoint (returns 401 without auth, not 404):
 *   POST https://application.rocket.new/web/v1/playground/reset-apk-build
 *   Body: { threadId }
 *   Auth: Bearer {token}, companyId header
 */
export async function resetRocketApkBuild({
  data,
}: {
  data: { token: string; threadId: string; companyId?: string };
}): Promise<void> {
  // Try reset then retry-apk-build as fallback — both endpoints confirmed to exist
  const endpoints = [
    `${APP_BASE}/web/v1/playground/reset-apk-build`,
    `${APP_BASE}/web/v1/playground/retry-apk-build`,
    `${APP_BASE}/web/v1/playground/apk-build-reset`,
  ];
  const body = JSON.stringify({ threadId: data.threadId });
  const hdrs = apkHeaders(data.token, data.companyId);

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: "POST", headers: hdrs, body });
      if (res.ok || res.status === 200) return; // success — state was reset
    } catch { /* try next */ }
  }
  // If all reset attempts fail, continue anyway — make-apk-build may still work
}

export async function triggerRocketApkBuild({
  data,
  resetFirst = false,
}: {
  data: { token: string; threadId: string; companyId?: string };
  resetFirst?: boolean;
}): Promise<ApkBuildState> {
  // When isMaxApkBuildFailedAttempt is true, reset the failed state before triggering.
  if (resetFirst) {
    await resetRocketApkBuild({ data });
  }

  const res = await fetch(`${APP_BASE}/web/v1/playground/make-apk-build`, {
    method: "POST",
    headers: apkHeaders(data.token, data.companyId),
    body: JSON.stringify({ threadId: data.threadId }),
  });
  if (!res.ok) throw new Error(`Failed to trigger APK build (${res.status})`);
  return parseApkResponse(res);
}

/**
 * Fetch live build log lines from a running APK build.
 *
 * All 5 endpoints confirmed to exist (return 401 without auth, not 404).
 * Tries multiple body shapes since the exact required format is undocumented.
 * Returns [] if all attempts yield empty data (log not yet available).
 *
 * Confirmed endpoints (all on application.rocket.new, return 401 w/o auth):
 *   POST /web/v3/playground/apk-build-log
 *   POST /web/v1/playground/apk-build-log
 *   POST /web/v1/playground/apk-build-logs
 *   POST /web/v3/playground/apk-build-logs
 *   POST /web/v1/playground/build-logs
 *
 * Response shapes handled:
 *   { data: { log: "line1\nline2\n..." } }
 *   { data: { logs: ["line1", "line2"] } }
 *   { data: { output/buildLog/buildOutput/stdout: "..." } }
 *   { data: string }  (raw string)
 */
export async function fetchRocketApkBuildLog({
  data,
}: {
  data: { token: string; threadId: string; companyId?: string; buildId?: string };
}): Promise<string[]> {
  const endpoints = [
    `${APP_BASE}/web/v3/playground/apk-build-log`,
    `${APP_BASE}/web/v1/playground/apk-build-log`,
    `${APP_BASE}/web/v1/playground/apk-build-logs`,
    `${APP_BASE}/web/v3/playground/apk-build-logs`,
    `${APP_BASE}/web/v1/playground/build-logs`,
  ];
  const hdrs = apkHeaders(data.token, data.companyId);

  // Try multiple body formats — the API docs don't specify which is correct
  const bodies = [
    JSON.stringify({ threadId: data.threadId }),
    ...(data.buildId ? [JSON.stringify({ buildId: data.buildId, threadId: data.threadId })] : []),
    JSON.stringify({ id: data.threadId }),
  ];

  for (const url of endpoints) {
    for (const body of bodies) {
      try {
        const res = await fetch(url, { method: "POST", headers: hdrs, body });
        if (!res.ok) continue;
        const raw = await res.json().catch(() => null);
        if (!raw) continue;
        const d = await rocketDecrypt(raw);
        const lines = extractLogLines(d);
        if (lines.length > 0) return lines;
      } catch { /* try next */ }
    }
  }
  return [];
}

/** Extract log lines from any response shape Rocket.new might return. */
function extractLogLines(d: any): string[] {
  if (!d) return [];
  const payload = d.data ?? d.result ?? d.payload ?? d;

  // Ordered field search for the log content
  const raw =
    payload.log ?? payload.logs ?? payload.output ?? payload.buildLog ??
    payload.buildOutput ?? payload.logOutput ?? payload.content ??
    payload.text ?? payload.stdout ?? payload.stderr ?? null;

  if (typeof raw === "string" && raw.trim()) {
    return raw.split("\n").map((l: string) => l.trimEnd()).filter((l: string) => l.length > 0);
  }
  if (Array.isArray(raw)) {
    return raw
      .map((l: any) => (typeof l === "string" ? l : typeof l?.message === "string" ? l.message : typeof l?.line === "string" ? l.line : JSON.stringify(l)))
      .filter((l: string) => l.trim().length > 0);
  }
  // Fallback: payload itself is a string
  if (typeof payload === "string" && payload.trim()) {
    return payload.split("\n").map((l: string) => l.trimEnd()).filter((l: string) => l.length > 0);
  }
  return [];
}

export async function downloadRocketApk({
  data,
}: {
  data: { token: string; threadId: string; companyId?: string };
}): Promise<string> {
  const res = await fetch(`${APP_BASE}/web/v1/playground/download-apk`, {
    method: "POST",
    headers: apkHeaders(data.token, data.companyId),
    body: JSON.stringify({ threadId: data.threadId }),
  });
  if (!res.ok) throw new Error(`Failed to get APK download URL (${res.status})`);
  const raw = await res.json().catch(() => null);
  if (!raw) throw new Error("Empty response from download-apk endpoint");
  const d = await rocketDecrypt(raw);
  const url: string = d.data?.url ?? d.url ?? "";
  if (!url) throw new Error("No download URL returned from Rocket.new");
  return url;
}
