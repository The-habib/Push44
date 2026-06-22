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

  const log = (label: string, val: any) =>
    console.warn(`[push44] ${label}`, JSON.stringify(val).slice(0, 800));

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

  // Try chat-thread/search first (confirmed working with companyId header)
  for (const body of [{}, { search: "" }, { page: 1, limit: 100 }]) {
    try {
      const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/search`, {
        method: "POST",
        headers: threadHeaders,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        log(`chat-thread/search ${JSON.stringify(body)}`, d);
        const arr = deepFindApps(d);
        if (arr.length > 0) { addApps(arr); break; }
      }
    } catch { /* try next body */ }
  }

  // Fallback: gateway
  if (allApps.length === 0) {
    try {
      const res = await fetch(`${GATEWAY_BASE}/api/v1/chat-thread/search`, {
        method: "POST",
        headers: { ...threadHeaders, Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ page: 1, limit: 100 }),
      });
      if (res.ok) {
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        log("gw/chat-thread/search", d);
        addApps(deepFindApps(d));
      }
    } catch { /* ignore */ }
  }

  // Fallback: JWT auth format
  if (allApps.length === 0) {
    try {
      const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${authToken}`, companyId, pageURL: "https://rocket.new" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        log("chat-thread/search (JWT)", d);
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

export async function fetchRocketAppFiles({
  data,
}: {
  data: { token: string; appId: string; applicationId?: string };
}): Promise<RocketFile[]> {
  const { token, appId } = data;
  let applicationId = data.applicationId ?? "";

  const log = (label: string, val: any) =>
    console.warn(`[push44:files] ${label}`, JSON.stringify(val).slice(0, 800));

  log("fetching files", { appId, applicationId });

  // Auth header variants (no loginToBack — it never works and adds 20-30s delay)
  const headerVariants = [
    backHeaders(token),
    backHeadersJWT(token),
  ];

  async function tryPost(url: string, body: object): Promise<RocketFile[] | null> {
    for (const hdrs of headerVariants) {
      try {
        const res = await fetch(url, { method: "POST", headers: hdrs, body: JSON.stringify(body) });
        if (!res.ok) { if (res.status === 401) break; continue; }
        const raw = await res.json().catch(() => null);
        if (!raw) continue;
        const d = await rocketDecrypt(raw);
        log(`POST ${url.split("/").slice(-2).join("/")}`, d);
        const files = extractFilesFromPayload(d);
        if (files && files.length > 0) return files;
      } catch { /* try next */ }
    }
    return null;
  }

  async function tryGet(url: string): Promise<RocketFile[] | null> {
    for (const hdrs of headerVariants) {
      try {
        const res = await fetch(url, { method: "GET", headers: hdrs });
        if (!res.ok) { if (res.status === 401) break; continue; }
        const raw = await res.json().catch(() => null);
        if (!raw) continue;
        const d = await rocketDecrypt(raw);
        log(`GET ${url.split("/").slice(-2).join("/")}`, d);
        const files = extractFilesFromPayload(d);
        if (files && files.length > 0) return files;
      } catch { /* try next */ }
    }
    return null;
  }

  // ── Step 1: Get thread details to extract applicationId if not already known.
  // chat-thread/get with { id } is confirmed working from previous investigation.
  if (!applicationId) {
    for (const body of [{ id: appId }, { threadId: appId }, { chatThreadId: appId }, { _id: appId }]) {
      for (const hdrs of headerVariants) {
        try {
          const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/get`, {
            method: "POST", headers: hdrs, body: JSON.stringify(body),
          });
          if (!res.ok) continue;
          const raw = await res.json().catch(() => null);
          if (!raw) continue;
          const d = await rocketDecrypt(raw);
          log(`chat-thread/get ${JSON.stringify(body)}`, d);
          // Extract applicationId from threadDetails
          const thread = d.data ?? d;
          const td = thread.threadDetails ?? {};
          applicationId = String(td.applicationId ?? td._id ?? thread.applicationId ?? "");
          if (applicationId) { log("applicationId resolved", applicationId); break; }
          // Also check if files are already in this response
          const files = extractFilesFromPayload(d);
          if (files && files.length > 0) return files;
        } catch { /* try next */ }
      }
      if (applicationId) break;
    }
  }

  log("applicationId final", applicationId || "(none)");

  // ── Step 2: Try fetching files using applicationId first (more specific)
  if (applicationId) {
    const PROJECT_BASE = "https://project.rocket.new";
    // GET endpoints using applicationId
    for (const base of [APP_BASE, PROJECT_BASE, BACK_BASE, GATEWAY_BASE]) {
      for (const path of [
        `/api/v1/application/${applicationId}/files`,
        `/api/v1/application/${applicationId}/code`,
        `/api/v1/application/${applicationId}`,
        `/api/v1/project/${applicationId}/files`,
        `/api/v1/project/${applicationId}`,
      ]) {
        const result = await tryGet(`${base}${path}`);
        if (result) return result;
      }
    }

    // POST endpoints using applicationId
    for (const base of [BACK_BASE, GATEWAY_BASE]) {
      for (const body of [{ applicationId }, { id: applicationId }, { _id: applicationId }]) {
        for (const path of [
          "/api/v1/application/get",
          "/api/v1/application/get-code",
          "/api/v1/code/get",
          "/api/v2/application/get",
        ]) {
          const result = await tryPost(`${base}${path}`, body);
          if (result) return result;
        }
      }
    }
  }

  // ── Step 3: Try file endpoints using thread appId
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const path of [
      `/api/v1/chat-thread/${appId}/files`,
      `/api/v1/chat-thread/${appId}/code`,
      `/api/v1/playground-project/${appId}/files`,
      `/api/v1/application/${appId}/files`,
    ]) {
      const result = await tryGet(`${base}${path}`);
      if (result) return result;
    }
  }

  // POST with thread ID
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const body of [{ threadId: appId }, { chatThreadId: appId }, { id: appId }]) {
      for (const path of [
        "/api/v1/chat-thread/get-code",
        "/api/v1/chat-thread/export",
        "/api/v1/code/get",
        "/api/v1/code/export",
      ]) {
        const result = await tryPost(`${base}${path}`, body);
        if (result) return result;
      }
    }
  }

  throw new Error(
    "Could not extract source files from this Rocket.new project. " +
    "The project may not have generated any code yet."
  );
}
