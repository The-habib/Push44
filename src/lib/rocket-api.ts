// Real Rocket.new API endpoints — reverse-engineered from assets.rocket.new JS bundles.
//
// Auth server:  https://appuser.dhiwise.com
// Main backend: https://back.rocket.new
// Token format: "JWT <token>"  (NOT "Bearer")
//
// Encryption: AES-256-CBC. API responses are encrypted with the key below.
// Key source: version.txt blob decrypted with the same hardcoded key (it's self-referential).
// Encrypted payload shape: { requestAnchor: "<IV base64>", processedContent: "<ciphertext base64>" }

const AUTH_BASE = "https://appuser.dhiwise.com";
const BACK_BASE = "https://back.rocket.new";

// AES-256-CBC key — hardcoded in the Rocket.new JS bundle (decryptObject function)
const AES_KEY_B64 = "dqf8SIWZdQtptMTEH45CHo4A0DJLrkq02y80wmirLYo";

// ─── Decryption (Web Crypto API) ─────────────────────────────────────────────

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
    return data; // return as-is if decryption fails
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

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
    if (plain) return plain;
    // might be encrypted error
    const dec = await rocketDecrypt(p).catch(() => p);
    return dec?.message ?? dec?.error ?? fallback;
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
  if (!res.ok) {
    throw new Error(await parseError(res, `Request failed (${res.status})`));
  }
  const raw = await res.json();
  return rocketDecrypt(raw);
}

// ─── OTP auth ───────────────────────────────────────────────────────────────

export async function rocketRequestOTP({
  data,
}: {
  data: { email: string };
}) {
  const res = await fetch(`${AUTH_BASE}/auth/v3/rocket/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `Failed to send OTP (${res.status})`));
  }
}

export async function rocketVerifyOTP({
  data,
}: {
  data: { email: string; otp: string };
}) {
  const res = await fetch(`${AUTH_BASE}/auth/v3/rocket/verify-email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, otp: data.otp }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `OTP verification failed (${res.status})`));
  }
  const raw = await res.json();
  const d = await rocketDecrypt(raw);

  // Token may be nested under data or at root
  const payload = d.data ?? d;
  const token: string =
    payload.token ?? payload.access_token ?? payload.accessToken ?? payload.jwtToken ?? "";
  if (!token) throw new Error("No token returned from Rocket.new. Check your OTP code.");

  const user = payload.user ?? payload;
  return {
    token,
    email: String(user.email ?? data.email),
    name: String(user.name ?? user.full_name ?? user.username ?? user.displayName ?? data.email),
  };
}

// ─── Token validation ────────────────────────────────────────────────────────

export async function validateRocketToken({
  data,
}: {
  data: { token: string };
}) {
  const res = await fetch(`${AUTH_BASE}/web/v1/user/get-profile`, {
    method: "GET",
    headers: jwtHeaders(data.token),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `Token validation failed (${res.status})`));
  }
  const raw = await res.json();
  const d = await rocketDecrypt(raw);
  const user = d.data ?? d.user ?? d;
  return {
    email: String(user.email ?? ""),
    name: String(user.name ?? user.full_name ?? user.username ?? user.displayName ?? ""),
  };
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface RocketApp {
  id: string;
  name: string;
  updated_at: string;
  icon?: string;
}

function deepFindArray(v: any, depth = 0): any[] {
  if (depth > 4) return [];
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    for (const key of ["applications", "projects", "apps", "threads", "chatThreads",
      "items", "results", "list"]) {
      if (Array.isArray(v[key])) return v[key];
    }
    for (const key of ["data", "payload", "result", "response"]) {
      if (v[key] !== undefined) {
        const found = deepFindArray(v[key], depth + 1);
        if (found.length > 0) return found;
      }
    }
  }
  return [];
}

function mapToRocketApp(a: any): RocketApp {
  return {
    id: String(a._id ?? a.id ?? a.projectId ?? a.threadId ?? ""),
    name: String(a.name ?? a.title ?? a.appName ?? a.projectName ?? a.threadName ?? "Untitled"),
    updated_at: String(a.updatedAt ?? a.updated_at ?? a.modifiedAt ?? new Date().toISOString()),
    icon: a.icon ?? a.logo ?? a.thumbnail ?? a.image ?? undefined,
  };
}

export async function listRocketApps({
  data,
}: {
  data: { token: string };
}): Promise<RocketApp[]> {
  const endpoints = [
    { url: `${BACK_BASE}/api/v2/application/list`, body: {} },
    { url: `${BACK_BASE}/api/v1/recent-threads-projects/list`, body: {} },
  ];

  let debugInfo = "";

  for (const ep of endpoints) {
    try {
      const d = await rocketPost(ep.url, data.token, ep.body);
      debugInfo = JSON.stringify(d, null, 2).slice(0, 800);
      const arr = deepFindArray(d);
      if (arr.length > 0) return arr.map(mapToRocketApp);
      // Got a valid decrypted response but empty array — stop trying
      break;
    } catch { /* try next endpoint */ }
  }

  throw new Error(`No projects found. Decrypted response: ${debugInfo || "(no response)"}`);
}

// ─── Files ───────────────────────────────────────────────────────────────────

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

  // Fetch thread/project details which contains the generated code
  const res = await fetch(`${BACK_BASE}/api/v1/chat-thread/get`, {
    method: "POST",
    headers: jwtHeaders(token),
    body: JSON.stringify({ threadId: appId }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, `Failed to fetch project files (${res.status})`));
  }

  const d = await res.json();
  const project = d.data ?? d;

  // If it returns a files map (like Base44: { "src/App.tsx": "..." })
  const filesMap = project.files ?? project.code ?? project.sourceFiles;
  if (filesMap && typeof filesMap === "object" && !Array.isArray(filesMap)) {
    return Object.entries(filesMap as Record<string, string>).map(
      ([path, content]): RocketFile => ({
        path,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      })
    );
  }

  // If it returns an array of file objects
  const filesArr: any[] = Array.isArray(filesMap)
    ? filesMap
    : Array.isArray(project.files ?? project)
    ? project.files ?? project
    : [];

  if (filesArr.length > 0) {
    return filesArr.map(
      (f: any): RocketFile => ({
        path: String(f.path ?? f.name ?? f.filename ?? ""),
        content:
          typeof f.content === "string"
            ? f.content
            : JSON.stringify(f.content ?? f, null, 2),
      })
    );
  }

  throw new Error(
    "Could not extract source files from this Rocket.new project. " +
    "The project may not have generated code yet."
  );
}
