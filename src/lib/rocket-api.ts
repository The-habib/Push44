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
// Token format: "JWT <token>"  (NOT "Bearer")
// Responses may be AES-256-CBC encrypted.

const AUTH_BASE    = "https://appuser.dhiwise.com";
const BACK_BASE    = "https://back.rocket.new";
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

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function jwtHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `JWT ${token}`,
  };
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

async function rocketPost(url: string, token: string, body: object = {}): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: jwtHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res, `POST ${url} failed (${res.status})`));
  const raw = await res.json();
  return rocketDecrypt(raw);
}

async function rocketGet(url: string, token: string): Promise<any> {
  const res = await fetch(url, { method: "GET", headers: jwtHeaders(token) });
  if (!res.ok) throw new Error(await parseError(res, `GET ${url} failed (${res.status})`));
  const raw = await res.json();
  return rocketDecrypt(raw);
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
  const payload = d.data ?? d;
  const token: string = payload.token ?? payload.access_token ?? payload.accessToken ?? payload.jwtToken ?? "";
  if (!token) throw new Error("No token returned from Rocket.new. Check your OTP code.");
  const user = payload.user ?? payload;
  return {
    token,
    email: String(user.email ?? data.email),
    name: String(user.name ?? user.full_name ?? user.username ?? user.displayName ?? data.email),
  };
}

// ─── Token validation ─────────────────────────────────────────────────────────

export async function validateRocketToken({ data }: { data: { token: string } }) {
  // Try the token-specific endpoint first (discovered in bundle: auth/v3/get-user-from-token-r)
  for (const url of [
    `${AUTH_BASE}/auth/v3/get-user-from-token-r`,
    `${AUTH_BASE}/web/v1/user/get-profile`,
  ]) {
    try {
      const res = await fetch(url, { method: "GET", headers: jwtHeaders(data.token) });
      if (!res.ok) continue;
      const raw = await res.json();
      const d = await rocketDecrypt(raw);
      const user = d.data ?? d.user ?? d;
      const email = String(user.email ?? "");
      const name  = String(user.name ?? user.full_name ?? user.username ?? user.displayName ?? "");
      if (email) return { email, name };
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
    // Prefer known key names
    for (const key of ["chatThreads", "threads", "applications", "projects", "apps",
                       "playgroundProjects", "items", "results", "list", "records"]) {
      if (Array.isArray(v[key]) && v[key].length > 0) return v[key];
    }
    // Recurse into wrapper keys
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

export async function listRocketApps({ data }: { data: { token: string } }): Promise<RocketApp[]> {
  const token = data.token;
  const seen = new Set<string>();
  const allApps: RocketApp[] = [];
  let reachable = false;

  function addApps(arr: any[]) {
    for (const item of arr) {
      const mapped = mapToRocketApp(item);
      if (mapped.id && mapped.id !== "undefined" && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        allApps.push(mapped);
      }
    }
  }

  // ── 1. Get workspace IDs from profile (appuser.dhiwise.com/web/v3/workspace/list)
  let workspaceIds: string[] = [];
  try {
    const ws = await rocketGet(`${AUTH_BASE}/web/v3/workspace/list`, token);
    reachable = true;
    const wsArr = deepFindApps(ws);
    workspaceIds = wsArr
      .map((w: any) => String(w._id ?? w.id ?? ""))
      .filter((id) => id && id !== "undefined");
  } catch { /* non-fatal */ }

  // ── 2. chat-thread/search — THE canonical "list all apps" endpoint
  //    Discovered in bundle: searchChatThread = back.rocket.new/api/v1/chat-thread/search
  const searchBodies = [
    {},
    { search: "" },
    { query: "" },
    { page: 1, limit: 100 },
    { page: 1, limit: 100, search: "" },
    { type: "all", page: 1, limit: 100 },
    { status: "active" },
    { isOwner: true },
  ];
  for (const body of searchBodies) {
    try {
      const d = await rocketPost(`${BACK_BASE}/api/v1/chat-thread/search`, token, body);
      reachable = true;
      const arr = deepFindApps(d);
      if (arr.length > 0) { addApps(arr); break; }
    } catch { /* try next body */ }
  }

  // ── 3. playground-project/list — separate project type
  //    Discovered: playgroundProject.list = back.rocket.new/api/v1/playground-project/list
  for (const body of [{}, { page: 1, limit: 100 }]) {
    try {
      const d = await rocketPost(`${BACK_BASE}/api/v1/playground-project/list`, token, body);
      reachable = true;
      addApps(deepFindApps(d));
    } catch { /* try next */ }
  }
  try {
    const d = await rocketGet(`${BACK_BASE}/api/v1/playground-project/list`, token);
    reachable = true;
    addApps(deepFindApps(d));
  } catch { /* try next */ }

  // ── 4. application/list (v2 + v3) — returns {owned, shared} counts but try anyway
  for (const url of [
    `${BACK_BASE}/api/v2/application/list`,
    `${BACK_BASE}/api/v3/application/list`,
    `${APP_BASE}/web/v1/application/list`,
  ]) {
    for (const body of [{}, { page: 1, limit: 100 }, { type: "owned" }]) {
      try {
        const d = await rocketPost(url, token, body);
        reachable = true;
        addApps(deepFindApps(d));
      } catch { /* try next */ }
    }
  }

  // ── 5. recent-threads-projects/list
  try {
    const d = await rocketPost(`${BACK_BASE}/api/v1/recent-threads-projects/list`, token, {});
    reachable = true;
    addApps(deepFindApps(d));
  } catch { /* try next */ }

  // ── 6. Per-workspace queries (if we got workspace IDs)
  for (const wsId of workspaceIds.slice(0, 5)) {
    for (const url of [
      `${BACK_BASE}/api/v2/workspace/${wsId}/application/list`,
      `${BACK_BASE}/api/v1/workspace/${wsId}/chat-thread/list`,
    ]) {
      try {
        const d = await rocketPost(url, token, { page: 1, limit: 100 });
        reachable = true;
        addApps(deepFindApps(d));
      } catch { /* try next */ }
    }
  }

  // ── 7. Fallback GET endpoints
  for (const url of [
    `${BACK_BASE}/api/v1/chat-thread/list`,
    `${BACK_BASE}/api/v1/application/list`,
    `${APP_BASE}/web/v1/application/info`,
  ]) {
    try {
      const d = await rocketGet(url, token);
      reachable = true;
      addApps(deepFindApps(d));
    } catch { /* try next */ }
  }

  if (!reachable) {
    throw new Error("Could not reach Rocket.new. Check your token and try again.");
  }

  return allApps;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface RocketFile {
  path: string;
  content: string;
}

export async function fetchRocketAppFiles({
  data,
}: {
  data: { token: string; appId: string };
}): Promise<RocketFile[]> {
  const { token, appId } = data;

  // chat-thread/get — discovered: fetchThreadDetails = back.rocket.new/api/v1/chat-thread/get
  const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/get`, {
    method: "POST",
    headers: jwtHeaders(token),
    body: JSON.stringify({ threadId: appId }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, `Failed to fetch project files (${res.status})`));
  }

  const raw = await res.json();
  const d = await rocketDecrypt(raw);
  const project = d.data ?? d;

  const filesMap = project.files ?? project.code ?? project.sourceFiles;
  if (filesMap && typeof filesMap === "object" && !Array.isArray(filesMap)) {
    return Object.entries(filesMap as Record<string, string>).map(
      ([path, content]): RocketFile => ({
        path,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      })
    );
  }

  const filesArr: any[] = Array.isArray(filesMap)
    ? filesMap
    : Array.isArray(project.files ?? project)
    ? (project.files ?? project)
    : [];

  if (filesArr.length > 0) {
    return filesArr.map((f: any): RocketFile => ({
      path: String(f.path ?? f.name ?? f.filename ?? ""),
      content: typeof f.content === "string" ? f.content : JSON.stringify(f.content ?? f, null, 2),
    }));
  }

  throw new Error(
    "Could not extract source files from this Rocket.new project. " +
    "The project may not have generated any code yet."
  );
}
