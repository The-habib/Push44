// Real Rocket.new API endpoints — reverse-engineered from assets.rocket.new JS bundles.
//
// Auth server:  https://appuser.dhiwise.com
// Main backend: https://back.rocket.new
// Token format: "JWT <token>"  (NOT "Bearer")
//
// Auth flow:
//   1. POST /auth/v3/rocket/send-otp   { email }
//   2. POST /auth/v3/rocket/verify-otp { email, otp }  → returns token
//   3. GET  /web/v1/user/get-profile   Authorization: JWT <token>

const AUTH_BASE    = "https://appuser.dhiwise.com";
const BACK_BASE    = "https://back.rocket.new";

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
    return p.message ?? p.error ?? p.detail ?? p.msg ?? fallback;
  } catch {
    return body.trim() || fallback;
  }
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
  const d = await res.json();

  // Token may be nested under data / user or at root
  const payload = d.data ?? d;
  const token: string =
    payload.token ?? payload.access_token ?? payload.accessToken ?? payload.jwtToken ?? "";
  if (!token) throw new Error("No token returned from Rocket.new. Check your OTP code.");

  const user = payload.user ?? payload;
  return {
    token,
    email: String(user.email ?? data.email),
    name: String(
      user.name ?? user.full_name ?? user.username ?? user.displayName ?? data.email
    ),
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
  const d = await res.json();
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

export async function listRocketApps({
  data,
}: {
  data: { token: string };
}): Promise<RocketApp[]> {
  const res = await fetch(`${BACK_BASE}/api/v2/application/list`, {
    method: "POST",
    headers: jwtHeaders(data.token),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `Failed to list projects (${res.status})`));
  }
  const d = await res.json();

  // Unwrap nested structures: { data: { applications: [...] } } or { data: [...] } or plain array
  const unwrap = (v: any): any[] => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      // Try common array keys one level deep
      for (const key of ["applications", "projects", "apps", "items", "results", "list", "threads"]) {
        if (Array.isArray(v[key])) return v[key];
      }
      // recurse one level into data/payload
      if (v.data !== undefined) return unwrap(v.data);
      if (v.payload !== undefined) return unwrap(v.payload);
    }
    return [];
  };
  const raw = unwrap(d);

  return raw.map(
    (a: any): RocketApp => ({
      id: String(a._id ?? a.id ?? a.projectId ?? a.threadId ?? ""),
      name: String(a.name ?? a.title ?? a.appName ?? a.projectName ?? "Untitled"),
      updated_at: String(
        a.updatedAt ?? a.updated_at ?? a.modifiedAt ?? new Date().toISOString()
      ),
      icon: a.icon ?? a.logo ?? a.thumbnail ?? a.image ?? undefined,
    })
  );
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
