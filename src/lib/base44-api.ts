import { createServerFn } from "@tanstack/react-start";

const BASE44_API = "https://api.base44.com/v1";

function b44Headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function b44Fetch(token: string, path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE44_API}${path}`, {
    ...opts,
    headers: { ...b44Headers(token), ...(opts?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `Base44 API error ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      msg = parsed.message ?? parsed.error ?? parsed.detail ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const base44Login = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { email, password } = ctx.data as { email: string; password: string };
    const res = await fetch(`${BASE44_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let msg = `Login failed (${res.status})`;
      try {
        const parsed = JSON.parse(body);
        msg = parsed.message ?? parsed.error ?? parsed.detail ?? msg;
      } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    const token: string =
      data.token ?? data.access_token ?? data.accessToken ?? data.jwt ?? data.auth_token ?? "";
    if (!token) throw new Error("No token returned from Base44 login");
    const user = data.user ?? data.profile ?? {};
    return {
      token,
      email: String(user.email ?? email),
      name: String(user.name ?? user.full_name ?? user.username ?? email),
    };
  }
);

export const validateBase44Token = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const data = await b44Fetch(token, "/auth/me");
    return {
      email: String(data.email ?? data.user?.email ?? ""),
      name: String(data.name ?? data.full_name ?? data.username ?? data.user?.name ?? ""),
    };
  }
);

export interface Base44App {
  id: string;
  name: string;
  updated_at: string;
  files_count?: number;
}

export const listBase44Apps = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const data = await b44Fetch(token, "/apps");
    const raw: any[] = Array.isArray(data) ? data : (data.apps ?? data.data ?? data.results ?? []);
    return raw.map(
      (a: any): Base44App => ({
        id: String(a.id ?? a._id ?? a.appId ?? a.app_id ?? ""),
        name: String(a.name ?? a.title ?? a.app_name ?? a.appName ?? "Unnamed App"),
        updated_at: String(a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()),
        files_count: Number(a.files_count ?? a.filesCount ?? 0),
      })
    );
  }
);

export interface Base44File {
  path: string;
  content: string;
}

export const fetchBase44AppFiles = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token, appId } = ctx.data as { token: string; appId: string };
    const data = await b44Fetch(token, `/apps/${appId}/files`);
    const raw: any[] = Array.isArray(data) ? data : (data.files ?? data.data ?? data.results ?? []);
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
