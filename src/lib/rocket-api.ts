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
  id: string;
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
  return {
    id: String(a._id ?? a.id ?? a.threadId ?? a.chatThreadId ?? a.projectId ?? ""),
    name: String(
      a.title ?? a.name ?? a.appName ?? a.threadName ?? a.chatThreadName ??
      a.projectName ?? a.subject ?? "Untitled"
    ),
    updated_at: String(a.updatedAt ?? a.updated_at ?? a.modifiedAt ?? new Date().toISOString()),
    icon: a.icon ?? a.logo ?? a.thumbnail ?? a.image ?? undefined,
  };
}

export async function listRocketApps({ data }: { data: { token: string; companyId?: string } }): Promise<RocketApp[]> {
  const authToken = data.token;
  let companyId = data.companyId ?? "";
  const seen = new Set<string>();
  const allApps: RocketApp[] = [];
  let reachable = false;

  const log = (label: string, val: any) =>
    console.warn(`[push44] ${label}`, JSON.stringify(val).slice(0, 600));

  function addApps(arr: any[]) {
    for (const item of arr) {
      const mapped = mapToRocketApp(item);
      if (mapped.id && mapped.id !== "undefined" && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        allApps.push(mapped);
      }
    }
  }

  // ── 0. Establish a session on back.rocket.new + resolve companyId from profile
  const [backSession] = await Promise.all([
    loginToBack(authToken),
  ]);

  // The "active" token for back.rocket.new calls: use exchanged session if available, else auth token
  const backToken = backSession ?? authToken;
  log("backToken source", backSession ? "session-exchange" : "auth-token-direct");

  // ── Step 0a: Try extracting companyId from the JWT payload itself (no API call)
  if (!companyId) {
    const claims = decodeJwtPayload(authToken);
    if (claims) {
      console.warn("[push44] JWT claims", JSON.stringify(claims).slice(0, 1000));
      companyId = String(
        claims.companyId ?? claims.company_id ??
        claims.workspaceId ?? claims.workspace_id ??
        claims.cid ?? claims.wid ?? ""
      );
      if (companyId) log("companyId from JWT claims", companyId);
    } else {
      log("JWT decode", "token is not a JWT — opaque API key");
    }
  }

  // ── Step 0b: Profile / company endpoints on auth server (do NOT fall back to _id)
  if (!companyId) {
    const profileUrls = [
      `${AUTH_BASE}/auth/v3/get-user-from-token-r`,
      `${AUTH_BASE}/web/v1/user/get-profile`,
      `${AUTH_BASE}/web/v1/workspace/list`,      // confirmed working — companyId in list[0].companyId
      `${AUTH_BASE}/web/v3/user/company-info`,
      `${AUTH_BASE}/web/v3/company/get`,
      `${AUTH_BASE}/api/v1/company`,
    ];
    for (const url of profileUrls) {
      try {
        const res = await fetch(url, { method: "GET", headers: authHeaders(authToken) });
        if (!res.ok) continue;
        const raw = await res.json();
        const d = await rocketDecrypt(raw);
        console.warn(`[push44] profile (${url.split("/").slice(-2).join("/")})`, JSON.stringify(d).slice(0, 4000));
        const u = d.data ?? d;
        const user = u.user ?? u;
        const workspace = u.workspace ?? user.workspace ?? u.company ?? user.company;
        // list-style responses (e.g. workspace/list) have companyId in list[0]
        const firstListItem = Array.isArray(u.list) && u.list.length > 0 ? u.list[0] : null;
        // IMPORTANT: do NOT fall back to _id — it causes 401 on back.rocket.new
        const candidate = String(
          workspace?._id ?? workspace?.id ??
          u.companyId ?? u.company_id ??
          user.companyId ?? user.company_id ??
          firstListItem?.companyId ?? firstListItem?.company_id ??
          firstListItem?.company?._id ??
          u.defaultWorkspaceId ?? u.workspaceId ??
          user.defaultWorkspaceId ?? user.workspaceId ?? ""
        );
        if (candidate && candidate !== "undefined") {
          companyId = candidate;
          log("companyId resolved from profile", companyId);
          break;
        }
      } catch { /* try next */ }
    }
  }

  // ── Step 0c: Try to get companyId via back.rocket.new session exchange
  // Send token in different body formats to see if we can get workspace context
  if (!companyId) {
    for (const [body, headers] of [
      [{ jwtToken: authToken }, { "Content-Type": "application/json", Authorization: `JWT ${authToken}`, pageURL: "https://rocket.new" }],
      [{ accessToken: authToken }, { "Content-Type": "application/json", Authorization: `JWT ${authToken}`, pageURL: "https://rocket.new" }],
      [{ token: authToken }, { "Content-Type": "application/json", Authorization: `Bearer ${authToken}`, pageURL: "https://rocket.new" }],
    ] as const) {
      for (const url of [`${BACK_BASE}/api/v1/auth/user-login`, `${BACK_BASE}/api/v1/auth/sso`]) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: headers as Record<string, string>,
            body: JSON.stringify(body),
          });
          const raw = await res.json().catch(() => null);
          const d = raw ? await rocketDecrypt(raw) : null;
          if (d) log(`${res.status} session-exchange ${url.split("/").pop()}`, d);
          if (res.ok && d) {
            const p = d.data ?? d;
            const cid = String(p.companyId ?? p.company_id ?? p.workspaceId ?? "");
            if (cid && cid !== "undefined") { companyId = cid; log("companyId from session-exchange", cid); break; }
          }
        } catch { /* try next */ }
      }
      if (companyId) break;
    }
  }

  // Helper closures — try both Bearer and JWT formats
  async function tryPost(base: string, path: string, body: object, tag: string) {
    for (const hdrs of [
      backHeaders(backToken, companyId || undefined),
      backHeadersJWT(backToken, companyId || undefined),
      backHeaders(authToken, companyId || undefined),
      backHeadersJWT(authToken, companyId || undefined),
    ]) {
      try {
        const res = await fetch(`${base}${path}`, {
          method: "POST",
          headers: hdrs,
          body: JSON.stringify(body),
        });
        reachable = true;
        const raw = await res.json().catch(() => null);
        const d = raw ? await rocketDecrypt(raw) : null;
        log(`${res.status} POST ${tag}`, d ?? raw);
        if (res.ok && d) return d;
        // If 401, no point retrying with same token — break and try next token variant
        if (res.status === 401) break;
      } catch (e: any) { log(`ERR POST ${tag}`, e?.message); }
    }
    return null;
  }

  async function tryGet(base: string, path: string, tag: string) {
    for (const hdrs of [
      backHeaders(backToken, companyId || undefined),
      backHeadersJWT(backToken, companyId || undefined),
      backHeaders(authToken, companyId || undefined),
      backHeadersJWT(authToken, companyId || undefined),
    ]) {
      try {
        const res = await fetch(`${base}${path}`, { method: "GET", headers: hdrs });
        reachable = true;
        const raw = await res.json().catch(() => null);
        const d = raw ? await rocketDecrypt(raw) : null;
        log(`${res.status} GET ${tag}`, d ?? raw);
        if (res.ok && d) return d;
        if (res.status === 401) break;
      } catch (e: any) { log(`ERR GET ${tag}`, e?.message); }
    }
    return null;
  }

  // ── 1. Workspace list — resolve companyId + workspaceIds
  let workspaceIds: string[] = [];
  // Try auth base first (no companyId header), then back/gateway
  // Confirmed working path: /web/v1/workspace/list on appuser.dhiwise.com
  for (const [base, path] of [
    [AUTH_BASE, "/web/v1/workspace/list"],
    [BACK_BASE, "/api/v1/workspace/list"],
    [GATEWAY_BASE, "/api/v1/workspace/list"],
  ] as const) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "GET",
        // For auth base, use plain auth headers without companyId
        headers: base === AUTH_BASE
          ? authHeaders(authToken)
          : backHeaders(backToken, companyId || undefined),
      });
      reachable = true;
      const raw = await res.json().catch(() => null);
      const d = raw ? await rocketDecrypt(raw) : null;
      log(`${res.status} GET workspace/list [${base}]`, d);
      if (res.ok && d) {
        const wsArr = deepFindApps(d);
        if (!companyId && wsArr.length > 0) {
          companyId = String(wsArr[0]?.companyId ?? wsArr[0]?._id ?? "");
        }
        workspaceIds = wsArr
          .map((w: any) => String(w.companyId ?? w._id ?? w.id ?? ""))
          .filter(Boolean);
        log("workspaceIds", workspaceIds);
        break;
      }
    } catch { /* try next */ }
  }

  // ── 2. chat-thread/search — canonical app listing
  const searchBodies = [
    {},
    { search: "" },
    { page: 1, limit: 100 },
    { page: 1, limit: 100, search: "" },
    { type: "all" },
    { isOwner: true },
    ...(workspaceIds[0] ? [{ workspaceId: workspaceIds[0] }] : []),
    ...(companyId ? [{ companyId }] : []),
  ];
  for (const body of searchBodies) {
    const d = await tryPost(BACK_BASE, "/api/v1/chat-thread/search", body, `chat-thread/search ${JSON.stringify(body)}`);
    if (d) {
      const arr = deepFindApps(d);
      if (arr.length > 0) { addApps(arr); break; }
    }
  }
  // Also try gateway
  if (allApps.length === 0) {
    for (const body of [{}, { page: 1, limit: 100 }]) {
      const d = await tryPost(GATEWAY_BASE, "/api/v1/chat-thread/search", body, `gw/chat-thread/search`);
      if (d) { addApps(deepFindApps(d)); if (allApps.length > 0) break; }
    }
  }

  // ── 3. playground-project/list
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const body of [{}, { page: 1, limit: 100 }]) {
      const d = await tryPost(base, "/api/v1/playground-project/list", body, `playground-project/list`);
      if (d) addApps(deepFindApps(d));
    }
    const dg = await tryGet(base, "/api/v1/playground-project/list", "playground-project/list GET");
    if (dg) addApps(deepFindApps(dg));
  }

  // ── 4. application/list v1/v2/v3
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const ver of ["v1", "v2", "v3"]) {
      for (const body of [{}, { page: 1, limit: 100 }, { type: "owned" }]) {
        const d = await tryPost(base, `/api/${ver}/application/list`, body, `${ver}/application/list`);
        if (d) addApps(deepFindApps(d));
      }
    }
  }

  // ── 5. recent-threads
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    const rt = await tryPost(base, "/api/v1/recent-threads-projects/list", {}, "recent-threads/list");
    if (rt) addApps(deepFindApps(rt));
  }

  // ── 6. Per-workspace queries
  for (const wsId of workspaceIds.slice(0, 3)) {
    for (const [base, path] of [
      [BACK_BASE, `/api/v2/workspace/${wsId}/application/list`],
      [BACK_BASE, `/api/v1/workspace/${wsId}/chat-thread/list`],
      [GATEWAY_BASE, `/api/v1/workspace/${wsId}/chat-thread/list`],
    ] as const) {
      const d = await tryPost(base, path, { page: 1, limit: 100 }, path.split("/").slice(-4).join("/"));
      if (d) addApps(deepFindApps(d));
    }
  }

  // ── 7. GET fallbacks
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const path of ["/api/v1/chat-thread/list", "/api/v1/application/list"]) {
      const d = await tryGet(base, path, path);
      if (d) addApps(deepFindApps(d));
    }
  }

  // ── 8. APP_BASE endpoints
  for (const path of ["/api/v1/application/list", "/api/v1/projects"]) {
    try {
      const res = await fetch(`${APP_BASE}${path}`, {
        method: "GET",
        headers: backHeaders(backToken, companyId || undefined),
      });
      if (res.ok) {
        const raw = await res.json().catch(() => null);
        const d = raw ? await rocketDecrypt(raw) : null;
        log(`${res.status} GET app-base${path}`, d);
        if (d) addApps(deepFindApps(d));
      }
    } catch { /* non-fatal */ }
  }

  log("FINAL app count", allApps.length);

  if (!reachable) throw new Error("Could not reach Rocket.new. Check your token and try again.");

  // If we have no apps AND no workspace context (companyId), the pasted API key
  // cannot list projects — the workspace ID is only available after OTP login.
  if (allApps.length === 0 && !companyId) {
    throw new Error(
      "NEEDS_OTP_LOGIN: Your Rocket.new API key doesn't carry workspace info. " +
      "Please reconnect using Login with Email (OTP) to list your projects."
    );
  }

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
  data: { token: string; appId: string };
}): Promise<RocketFile[]> {
  const { token, appId } = data;
  const log = (label: string, val: any) =>
    console.warn(`[push44:files] ${label}`, JSON.stringify(val).slice(0, 600));

  // Establish a back session first (same as listRocketApps does)
  const backSession = await loginToBack(token);
  const backToken = backSession ?? token;
  log("backToken source", backSession ? "session" : "auth-direct");

  // All headers variants to try
  const headerVariants = [
    backHeaders(backToken),
    backHeadersJWT(backToken),
    backHeaders(token),
    backHeadersJWT(token),
  ];

  async function tryPost(url: string, body: object): Promise<RocketFile[] | null> {
    for (const hdrs of headerVariants) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: hdrs,
          body: JSON.stringify(body),
        });
        if (!res.ok) { if (res.status === 401) break; continue; }
        const raw = await res.json().catch(() => null);
        if (!raw) continue;
        const d = await rocketDecrypt(raw);
        log(`${res.status} POST ${url.split("/").slice(-3).join("/")}`, d);
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
        log(`${res.status} GET ${url.split("/").slice(-3).join("/")}`, d);
        const files = extractFilesFromPayload(d);
        if (files && files.length > 0) return files;
      } catch { /* try next */ }
    }
    return null;
  }

  // ── 1. chat-thread/get — primary path (POST with different ID fields)
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const body of [
      { threadId: appId },
      { chatThreadId: appId },
      { id: appId },
      { _id: appId },
      { threadId: appId, includeFiles: true },
      { threadId: appId, includeCode: true },
    ]) {
      const result = await tryPost(`${base}/api/v1/chat-thread/get`, body);
      if (result) return result;
    }
  }

  // ── 2. playground-project/get
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const body of [
      { projectId: appId },
      { id: appId },
      { _id: appId },
      { playgroundProjectId: appId },
    ]) {
      const result = await tryPost(`${base}/api/v1/playground-project/get`, body);
      if (result) return result;
      const result2 = await tryPost(`${base}/api/v2/playground-project/get`, body);
      if (result2) return result2;
    }
  }

  // ── 3. GET by ID in path
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const path of [
      `/api/v1/chat-thread/${appId}`,
      `/api/v1/chat-thread/${appId}/files`,
      `/api/v1/chat-thread/${appId}/code`,
      `/api/v1/playground-project/${appId}`,
      `/api/v1/playground-project/${appId}/files`,
      `/api/v1/application/${appId}`,
      `/api/v1/application/${appId}/files`,
      `/api/v1/application/${appId}/code`,
      `/api/v2/application/${appId}/files`,
    ]) {
      const result = await tryGet(`${base}${path}`);
      if (result) return result;
    }
  }

  // ── 4. application.rocket.new endpoints
  const PROJECT_BASE = "https://project.rocket.new";
  for (const base of [APP_BASE, PROJECT_BASE]) {
    for (const path of [
      `/api/v1/project/${appId}/files`,
      `/api/v1/project/${appId}/code`,
      `/api/v1/project/${appId}`,
      `/api/v1/application/${appId}/files`,
      `/api/v1/application/${appId}/code`,
      `/api/v1/${appId}/files`,
    ]) {
      const result = await tryGet(`${base}${path}`);
      if (result) return result;
    }
  }

  // ── 5. Code/export endpoints
  for (const base of [BACK_BASE, GATEWAY_BASE]) {
    for (const body of [{ threadId: appId }, { chatThreadId: appId }, { projectId: appId }]) {
      for (const path of [
        "/api/v1/chat-thread/get-code",
        "/api/v1/chat-thread/export",
        "/api/v1/code/get",
        "/api/v1/code/export",
        "/api/v1/project/export",
        "/api/v1/project/get-files",
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
