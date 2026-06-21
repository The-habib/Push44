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
// GET /apps/{id}/files → array or { files: [...] }

export interface Base44File {
  path: string;
  content: string;
}

export const fetchBase44AppFiles = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token, appId } = ctx.data as { token: string; appId: string };
    const data = await b44Fetch(`/apps/${appId}/files`, undefined, token);
    const raw: any[] = Array.isArray(data)
      ? data
      : (data.files ?? data.data ?? data.results ?? []);
    return raw
      .filter((f: any) => f && (f.path || f.name || f.filename))
      .map(
        (f: any): Base44File => ({
          path: String(f.path ?? f.name ?? f.filename ?? ""),
          content: String(f.content ?? f.code ?? f.text ?? f.body ?? ""),
        })
      );
  }
);
