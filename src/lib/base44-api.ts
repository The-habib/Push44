import { createServerFn } from "@tanstack/react-start";

const BASE44_API = "https://api.base44.com/v1";

async function b44Fetch(path: string, opts?: RequestInit, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  const res = await fetch(`${BASE44_API}${path}`, { ...opts, headers });
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

// ─── Email / Password login ───────────────────────────────────────────────────

export const base44Login = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { email, password } = ctx.data as { email: string; password: string };

    // Try primary endpoint
    const res = await fetch(`${BASE44_API}/auth/login`, {
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

    // Extract token — Base44 may use different key names
    const token: string =
      data.token ??
      data.access_token ??
      data.accessToken ??
      data.jwt ??
      data.auth_token ??
      data.authToken ??
      "";
    if (!token) throw new Error("No token in Base44 response — check credentials.");

    const user = data.user ?? data.profile ?? {};
    return {
      token,
      email: String(user.email ?? data.email ?? email),
      name: String(user.name ?? user.full_name ?? user.username ?? data.name ?? email),
    };
  }
);

// ─── Token validation ─────────────────────────────────────────────────────────

export const validateBase44Token = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const data = await b44Fetch("/auth/me", undefined, token);
    return {
      email: String(data.email ?? data.user?.email ?? ""),
      name: String(
        data.name ?? data.full_name ?? data.username ?? data.user?.name ?? ""
      ),
    };
  }
);

// ─── Apps ─────────────────────────────────────────────────────────────────────

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
        id: String(a.id ?? a._id ?? a.appId ?? a.app_id ?? ""),
        name: String(
          a.name ?? a.title ?? a.app_name ?? a.appName ?? "Unnamed App"
        ),
        updated_at: String(
          a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()
        ),
        files_count: Number(a.files_count ?? a.filesCount ?? 0),
      })
    );
  }
);

// ─── Files ────────────────────────────────────────────────────────────────────

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
