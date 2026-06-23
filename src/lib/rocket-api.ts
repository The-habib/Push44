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
      return entries.map(([path, content]): RocketFile => ({
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
    return filesArr.map((f: any): RocketFile => ({
      path: String(f.path ?? f.name ?? f.filename ?? f.filePath ?? ""),
      content: typeof f.content === "string" ? f.content
        : typeof f.code === "string" ? f.code
        : JSON.stringify(f.content ?? f.code ?? f, null, 2),
    }));
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

// ── SSE-based container wake ──────────────────────────────────────────────────
// When the S3 file-content endpoint returns 500s (stale cache), we can try to
// wake the dev container via the gateway SSE stream and fetch files directly.
//
// Stream: POST https://gateway.rocket.new/api/v1/thread/conversation
// Auth:   JWT {token}  (NOT Bearer)
// Body:   { event: "CONTINUE_THREAD", data: { threadId }, sessionId }
//
// The server sends SSE events. We watch for SERVER_STATUS_FOR_RESUME_CONTAINER
// or SERVER_STATUS_FOR_THREAD_DETAILS events which carry data.backendUrl.
// The stream may close and need reconnecting — we retry for up to `timeoutMs`.

// Helper: drain an SSE stream looking for any key that looks like a container backendUrl.
// Returns the URL or null. Cancels the reader after `limitMs` or on URL found.
async function drainSSEForBackendUrl(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  limitMs: number,
  logFn: (label: string, val?: any) => void,
  streamLabel: string
): Promise<string | null> {
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";
  const deadline = Date.now() + limitMs;

  const CONTAINER_EVENTS = new Set([
    "SERVER_STATUS_FOR_RESUME_CONTAINER",
    "SERVER_STATUS_FOR_THREAD_DETAILS",
    "THREAD_DETAILS",
    "SERVER_STATUS",
    "CONTAINER_STATUS",
  ]);

  try {
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      const { done, value } = await Promise.race([
        reader.read(),
        new Promise<{ done: true; value: undefined }>((r) => setTimeout(() => r({ done: true, value: undefined }), remaining)),
      ]);
      if (done) break;
      if (!value) continue;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith("data:")) {
          const rawData = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(rawData);
            // Format A: explicit SSE event type
            // Format B: event name embedded in JSON payload
            const innerEvent: string = String(parsed.event ?? parsed.type ?? "");
            const effectiveEvent = CONTAINER_EVENTS.has(currentEvent) ? currentEvent
              : CONTAINER_EVENTS.has(innerEvent) ? innerEvent : "";

            logFn(`[${streamLabel}] ev=${currentEvent || "msg"} inner=${innerEvent || "-"}`, rawData.slice(0, 180));

            // Look for backendUrl in either format
            const payload = effectiveEvent ? (parsed.data ?? parsed) : parsed;
            const backendUrl: string =
              payload.backendUrl ?? payload.backend_url ??
              payload.containerUrl ?? payload.container_url ??
              payload.serverUrl ?? payload.server_url ??
              (parsed.data?.backendUrl) ?? (parsed.data?.backend_url) ?? "";

            if (backendUrl && backendUrl.startsWith("http")) {
              logFn(`[${streamLabel}] backendUrl found`, backendUrl);
              reader.cancel();
              return backendUrl;
            }
          } catch { /* malformed JSON */ }
          currentEvent = "";
        }
      }
    }
  } catch { /* stream error */ }
  reader.cancel().catch(() => {});
  return null;
}

async function wakeRocketContainer(
  token: string,
  companyId: string,
  threadId: string,
  timeoutMs = 120_000,
  onProgress?: (msg: string) => void
): Promise<string | null> {
  const log = (label: string, val?: any) =>
    console.warn(`[push44:wake] ${label}`, val !== undefined ? JSON.stringify(val).slice(0, 400) : "");

  const sessionId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  const deadline = Date.now() + timeoutMs;

  const jwtHdrs = { "Content-Type": "application/json", Authorization: `JWT ${token}`, companyId, pageURL: "https://rocket.new" };
  const bearerHdrs = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, companyId, pageURL: "https://rocket.new" };

  // ── Phase 1: Trigger the container wake via conversation SSE.
  // Send RESUME_CONTAINER once to tell the server to start the container.
  // We don't wait for a URL here — just fire-and-forget the wake signal.
  for (const [hdrs, action] of [[jwtHdrs, "RESUME_CONTAINER"], [bearerHdrs, "CONTINUE_THREAD"]] as const) {
    try {
      const res = await fetch(`${GATEWAY_BASE}/api/v1/thread/conversation`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({ event: action, data: { threadId }, sessionId }),
      });
      log(`wake trigger ${action} → ${res.status}`);
      if (res.body) {
        // Read briefly to confirm receipt, then move on
        const reader = res.body.getReader();
        const url = await drainSSEForBackendUrl(reader, 5_000, log, `conv-${action}`);
        if (url) return url;
      }
    } catch (e: any) { log(`wake trigger error`, e?.message); }
  }

  // ── Phase 2: Listen on the persistent SSE channel for container status events.
  // The Rocket.new editor uses this persistent channel to receive container URL
  // when the container finishes starting (SERVER_STATUS_FOR_RESUME_CONTAINER).
  log("starting persistent SSE listen loop");
  onProgress?.("Waking container, waiting for it to start…");

  let attempt = 0;
  const ENDPOINTS = [
    { url: `${GATEWAY_BASE}/api/v1/connection/persistent`, method: "GET" as const, hdrs: jwtHdrs, body: undefined },
    { url: `${GATEWAY_BASE}/api/v1/connection/persistent`, method: "POST" as const, hdrs: jwtHdrs, body: JSON.stringify({ threadId, sessionId }) },
    { url: `${GATEWAY_BASE}/api/v1/thread/conversation`, method: "POST" as const, hdrs: jwtHdrs, body: JSON.stringify({ event: "CONTINUE_THREAD", data: { threadId }, sessionId }) },
    { url: `${GATEWAY_BASE}/api/v1/thread/conversation`, method: "POST" as const, hdrs: bearerHdrs, body: JSON.stringify({ event: "RESUME_CONTAINER", data: { threadId }, sessionId }) },
    { url: `${GATEWAY_BASE}/api/v1/thread/consume-stream`, method: "POST" as const, hdrs: jwtHdrs, body: JSON.stringify({ threadId, sessionId }) },
    { url: `${GATEWAY_BASE}/api/v1/thread/consume-stream`, method: "GET" as const, hdrs: jwtHdrs, body: undefined },
  ];

  while (Date.now() < deadline) {
    attempt++;
    const ep = ENDPOINTS[attempt % ENDPOINTS.length];
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    try {
      log(`persistent attempt ${attempt}`, `${ep.method} ${ep.url}`);
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: ep.hdrs,
        ...(ep.body ? { body: ep.body } : {}),
      });
      log(`persistent ${ep.method} ${ep.url.split("/").pop()} → ${res.status}`);

      if (res.ok && res.body) {
        const listenMs = Math.min(20_000, deadline - Date.now());
        const url = await drainSSEForBackendUrl(res.body.getReader(), listenMs, log, `p${attempt}`);
        if (url) return url;
      }
    } catch (e: any) { log(`persistent error attempt=${attempt}`, e?.message); }

    if (Date.now() < deadline) {
      const waited = Math.round((Date.now() - (deadline - timeoutMs)) / 1000);
      onProgress?.(`Container starting… (${waited}s elapsed, up to ${Math.round(timeoutMs / 1000)}s)`);
      await new Promise((r) => setTimeout(r, 3_000));
    }
  }

  log("container wake timed out");
  return null;
}

export async function fetchRocketAppFiles({
  data,
}: {
  data: { token: string; appId: string; applicationId?: string; companyId?: string };
}): Promise<RocketFile[]> {
  const { token, appId } = data;
  let applicationId = data.applicationId ?? "";
  const companyId = data.companyId ?? "";

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
          // If thread response already contains files, return them now
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

  // ── Step 2: S3-backed project structure + per-file content.
  // Confirmed working endpoint (reverse-engineered from Rocket.new JS bundle).
  // Auth format: both JWT and Bearer are attempted.
  const s3Headers = [
    { "Content-Type": "application/json", Authorization: `JWT ${token}` },
    { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  ];

  let filePaths: string[] = [];
  let workingHeaders: Record<string, string> | null = null;

  for (const hdrs of s3Headers) {
    try {
      const res = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/project-structure`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({ applicationId }),
      });
      log(`project-structure status (${hdrs.Authorization.split(" ")[0]})`, res.status);
      if (!res.ok) continue;
      const raw = await res.json().catch(() => null);
      if (!raw) continue;
      const d = await rocketDecrypt(raw);
      log("project-structure response", d);
      // Pass the root node directly — flattenDirTree handles { type, path, children } format
      const extracted = flattenDirTree(d);
      if (extracted.length > 0) {
        filePaths = extracted.filter(p => p && !p.endsWith("/"));
        workingHeaders = hdrs;
        log("file paths count", filePaths.length);
        log("file paths sample", filePaths.slice(0, 10));
        break;
      }
    } catch (e: any) { log("project-structure error", e?.message); }
  }

  if (filePaths.length > 0 && workingHeaders) {
    // Fetch all files in parallel (batches of 20 to avoid flooding).
    // Try the path both WITH and WITHOUT a leading slash — some apps need "/css/main.css",
    // others need "css/main.css". Use whichever gets a 200 for the first file.
    const firstFile = filePaths[0];
    let resolvedHeaders = workingHeaders;
    let useLeadingSlash = false;

    // Probe first file with and without slash to find which works
    for (const trySlash of [false, true]) {
      for (const hdrs of s3Headers) {
        const fileParam = trySlash ? `/${firstFile}` : firstFile;
        try {
          const probe = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/file-content`, {
            method: "POST",
            headers: hdrs,
            body: JSON.stringify({ applicationId, file: fileParam }),
          });
          log(`file-content probe slash=${trySlash}`, { status: probe.status, file: fileParam });
          if (probe.ok) {
            resolvedHeaders = hdrs;
            useLeadingSlash = trySlash;
            break;
          }
        } catch { /* try next */ }
      }
      if (resolvedHeaders !== workingHeaders || useLeadingSlash) break;
    }

    const BATCH = 20;
    const results: RocketFile[] = [];

    // Fetch from the probe result for the first file so we don't re-fetch it
    const probeFile = useLeadingSlash ? `/${firstFile}` : firstFile;
    try {
      const probeRes = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/file-content`, {
        method: "POST",
        headers: resolvedHeaders,
        body: JSON.stringify({ applicationId, file: probeFile }),
      });
      if (probeRes.ok) {
        const raw = await probeRes.json().catch(() => null);
        if (raw) {
          const d = await rocketDecrypt(raw);
          const content = extractContent(d);
          if (content !== null) results.push({ path: firstFile, content });
        }
      }
    } catch { /* ignore */ }

    for (let i = 0; i < filePaths.length; i += BATCH) {
      const batch = filePaths.slice(i, i + BATCH).filter(p => p !== firstFile);
      if (batch.length === 0) continue;
      const batchResults = await Promise.allSettled(
        batch.map(async (filePath) => {
          const fileParam = useLeadingSlash ? `/${filePath}` : filePath;
          try {
            const res = await fetch(`${APP_CODE_BASE}/app-preview/v1/rocket/file-content`, {
              method: "POST",
              headers: resolvedHeaders,
              body: JSON.stringify({ applicationId, file: fileParam }),
            });
            if (!res.ok) return null;
            const raw = await res.json().catch(() => null);
            if (!raw) return null;
            const d = await rocketDecrypt(raw);
            const content = extractContent(d);
            if (content === null) return null;
            return { path: filePath, content } as RocketFile;
          } catch { return null; }
        })
      );
      for (const r of batchResults) {
        if (r.status === "fulfilled" && r.value !== null) results.push(r.value);
      }
    }
    if (results.length > 0) {
      log("files fetched", results.length);
      return results;
    }
    log("file-content fetch returned 0 files — falling through to SSE container wake", {});
  }

  // ── Step 3: SSE-based container wake → live container file fetch.
  // When S3 returns 500s (stale/missing cache), the only way to get files is
  // to wake the dev container and fetch directly from it.
  // wakeRocketContainer connects to gateway.rocket.new SSE stream, sends
  // CONTINUE_THREAD / RESUME_CONTAINER and waits for a backendUrl in the
  // SERVER_STATUS_FOR_RESUME_CONTAINER event (up to 50 s).
  if (appId) {
    log("trying SSE container wake", { appId, companyId: companyId || "(none)" });
    const containerUrl = await wakeRocketContainer(token, companyId, appId);

    if (containerUrl) {
      log("container is live at", containerUrl);

      // If we have file paths from S3, fetch from container using those.
      if (filePaths.length > 0) {
        const containerHdrs = [
          { "Content-Type": "application/json", Authorization: `JWT ${token}` },
          { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        ];
        for (const hdrs of containerHdrs) {
          const BATCH = 20;
          const results: RocketFile[] = [];
          for (let i = 0; i < filePaths.length; i += BATCH) {
            const batch = filePaths.slice(i, i + BATCH);
            const batchResults = await Promise.allSettled(
              batch.map(async (filePath) => {
                try {
                  const res = await fetch(`${containerUrl}/api/file-content`, {
                    method: "POST",
                    headers: hdrs,
                    body: JSON.stringify({ applicationId, file: filePath }),
                  });
                  if (!res.ok) return null;
                  const raw = await res.json().catch(() => null);
                  if (!raw) return null;
                  const d = await rocketDecrypt(raw);
                  const content = extractContent(d);
                  if (content === null) return null;
                  return { path: filePath, content } as RocketFile;
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
        }
      }

      // No file paths from S3 — try ZIP download from live container
      try {
        const zipRes = await fetch(
          `${containerUrl}/api/download-project?t=${Date.now()}`,
          { method: "GET", headers: { Authorization: `JWT ${token}` } }
        );
        if (zipRes.ok) {
          // Import JSZip dynamically to unzip the project archive
          const JSZip = (await import("jszip")).default;
          const buf = await zipRes.arrayBuffer();
          const zip = await JSZip.loadAsync(buf);
          const files: RocketFile[] = [];
          await Promise.all(
            Object.entries(zip.files).map(async ([path, entry]) => {
              if (entry.dir) return;
              // Strip a leading project-root folder if present (e.g. "my-app/src/…" → "src/…")
              const parts = path.split("/");
              const rel = parts.length > 1 && !path.startsWith("src/") && !path.startsWith("lib/")
                ? parts.slice(1).join("/")
                : path;
              if (!rel) return;
              const content = await entry.async("string");
              files.push({ path: rel, content });
            })
          );
          if (files.length > 0) {
            log("ZIP download from container fetched", files.length);
            return files;
          }
        }
      } catch (e: any) { log("container ZIP download error", e?.message); }
    } else {
      log("container wake timed out — container may need to be opened in Rocket.new first");
    }
  }

  // ── Step 4: Fallback — try other known REST endpoints.
  const allIds = [...new Set([applicationId, appId].filter(Boolean))];
  for (const id of allIds) {
    for (const hdrs of s3Headers) {
      for (const base of [BACK_BASE, GATEWAY_BASE]) {
        for (const body of [{ id }, { applicationId: id }, { _id: id }]) {
          for (const path of ["/api/v1/application/get", "/api/v1/application/get-code", "/api/v1/code/get"]) {
            try {
              const res = await fetch(`${base}${path}`, {
                method: "POST", headers: hdrs, body: JSON.stringify(body),
              });
              if (!res.ok) continue;
              const raw = await res.json().catch(() => null);
              if (!raw) continue;
              const d = await rocketDecrypt(raw);
              log(`fallback ${path}`, d);
              const files = extractFilesFromPayload(d);
              if (files && files.length > 0) return files;
            } catch { /* try next */ }
          }
        }
      }
    }
  }

  throw new Error(
    "Could not fetch files from this Rocket.new project. " +
    "The dev container appears to be asleep — try opening the project in Rocket.new first, then push again."
  );
}
