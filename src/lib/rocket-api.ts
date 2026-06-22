const BASE = "https://api.rocket.new";

async function rocketFetch(
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
    let msg = `Rocket.new error ${res.status}`;
    try {
      const p = JSON.parse(body);
      msg = p.message ?? p.error ?? p.detail ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function rocketLogin({
  data,
}: {
  data: { email: string; password: string };
}) {
  const { email, password } = data;
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
  const d = await res.json();
  const token: string =
    d.access_token ?? d.token ?? d.accessToken ?? d.api_key ?? "";
  if (!token) throw new Error("No token returned from Rocket.new.");
  const user = d.user ?? d;
  return {
    token,
    email: String(user.email ?? email),
    name: String(
      user.full_name ?? user.name ?? user.username ?? user.display_name ?? email
    ),
  };
}

export async function validateRocketToken({
  data,
}: {
  data: { token: string };
}) {
  const me = await rocketFetch("/auth/me", undefined, data.token);
  return {
    email: String(me.email ?? ""),
    name: String(me.full_name ?? me.name ?? me.username ?? me.display_name ?? ""),
  };
}

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
  const d = await rocketFetch("/projects", undefined, data.token);
  const raw: any[] = Array.isArray(d)
    ? d
    : (d.projects ?? d.apps ?? d.data ?? d.results ?? []);
  return raw.map(
    (a: any): RocketApp => ({
      id: String(a.id ?? a._id ?? a.projectId ?? ""),
      name: String(a.name ?? a.title ?? a.project_name ?? "Unnamed Project"),
      updated_at: String(
        a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()
      ),
      icon: a.icon ?? a.logo ?? a.thumbnail ?? a.image ?? a.icon_url ?? undefined,
    })
  );
}

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

  const d = await rocketFetch(`/projects/${appId}/files`, undefined, token);

  if (d?.files && typeof d.files === "object" && !Array.isArray(d.files)) {
    return Object.entries(d.files as Record<string, string>).map(
      ([path, content]): RocketFile => ({
        path,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      })
    );
  }

  if (Array.isArray(d?.files ?? d)) {
    const arr: any[] = d?.files ?? d;
    return arr.map(
      (f: any): RocketFile => ({
        path: String(f.path ?? f.name ?? f.filename ?? ""),
        content: typeof f.content === "string"
          ? f.content
          : JSON.stringify(f.content ?? f, null, 2),
      })
    );
  }

  return [];
}
