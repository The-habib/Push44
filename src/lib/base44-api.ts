import { createServerFn } from "@tanstack/react-start";

// Real Base44 API — confirmed by live testing
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
    const body = await res.text().catch(() => "");
    let msg = `Base44 error ${res.status}`;
    try {
      const p = JSON.parse(body);
      msg = p.message ?? p.error ?? p.detail ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /auth/login → { success, access_token, user: { email, full_name, ... } }

export const base44Login = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { email, password } = ctx.data as { email: string; password: string };
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let msg = `Login failed (${res.status})`;
      try {
        const p = JSON.parse(body);
        msg = p.message ?? p.error ?? p.detail ?? msg;
      } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    const token: string = data.access_token ?? data.token ?? data.accessToken ?? "";
    if (!token) throw new Error("No token returned from Base44.");
    const user = data.user ?? {};
    return {
      token,
      email: String(user.email ?? email),
      name: String(user.full_name ?? user.name ?? user.username ?? email),
    };
  }
);

// ─── Validate token ───────────────────────────────────────────────────────────
// GET /auth/me → { email, full_name, ... }  (user object directly)

export const validateBase44Token = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const me = await b44Fetch("/auth/me", undefined, token);
    return {
      email: String(me.email ?? ""),
      name: String(me.full_name ?? me.name ?? me.username ?? ""),
    };
  }
);

// ─── Apps ─────────────────────────────────────────────────────────────────────
// GET /apps → array of app objects

export interface Base44App {
  id: string;
  name: string;
  updated_at: string;
  files_count?: number;
}

export const listBase44Apps = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const data = await b44Fetch("/apps", undefined, token);
    const raw: any[] = Array.isArray(data)
      ? data
      : (data.apps ?? data.data ?? data.results ?? []);
    return raw.map(
      (a: any): Base44App => ({
        id: String(a.id ?? a._id ?? a.appId ?? ""),
        name: String(a.name ?? a.title ?? a.app_name ?? "Unnamed App"),
        updated_at: String(
          a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()
        ),
        files_count: Number(a.files_count ?? a.filesCount ?? 0),
      })
    );
  }
);

// ─── Files ────────────────────────────────────────────────────────────────────
// Real endpoint: GET /apps/{id}/sandbox/files
// Response: { app_id: string, files: { [path]: content } }

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
  timeoutMs = 60_000
): Promise<void> {
  // Try common wake endpoints — ignore errors (endpoint may not exist)
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

  // Poll status until alive or timeout
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = await getSandboxStatus(appId, token);
    if (status === "alive") return;
    await new Promise((r) => setTimeout(r, 3_000));
  }

  throw new Error(
    "Sandbox did not wake up in time. Open your app in Base44 and try again."
  );
}

export const fetchBase44AppFiles = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token, appId } = ctx.data as { token: string; appId: string };

    // Check sandbox status — auto-wake if not alive
    const status = await getSandboxStatus(appId, token);
    if (status !== "alive") {
      await wakeAndWaitForSandbox(appId, token);
    }

    const data = await b44Fetch(`/apps/${appId}/sandbox/files`, undefined, token);

    // Response: { app_id, files: { "path": "content", ... } }
    const filesObj: Record<string, string> = data?.files ?? {};

    return Object.entries(filesObj).map(
      ([path, content]): Base44File => ({
        path,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      })
    );
  }
);
