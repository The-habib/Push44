const BASE = "https://floot.co";

async function flootFetch(path: string, opts?: RequestInit & { token?: string }): Promise<any> {
  const { token, ...rest } = opts ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((rest.headers ?? {}) as Record<string, string>),
  };
  const res = await fetch(`${BASE}${path}`, { ...rest, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `Floot error ${res.status}`;
    try {
      const p = JSON.parse(body);
      msg = p.message ?? p.error ?? p.detail ?? msg;
    } catch {}
    throw Object.assign(new Error(msg), { status: res.status });
  }
  return res.json();
}

export interface FlootApp {
  id: string;
  name: string;
  icon?: string;
  updated_at: string;
}

export async function validateFlootToken({ data }: { data: { token: string } }): Promise<{ email: string; name: string }> {
  const d = await flootFetch("/api/auth/session", { token: data.token });
  const user = d?.user ?? d;
  if (!user?.email) throw new Error("Token is invalid or expired. Please get a fresh API token from your Floot account settings.");
  return {
    email: String(user.email ?? ""),
    name: String(user.name ?? user.displayName ?? user.email ?? ""),
  };
}

export async function listFlootApps({ data }: { data: { token: string } }): Promise<FlootApp[]> {
  const d = await flootFetch("/api/projects", { token: data.token });

  const list: any[] = Array.isArray(d)
    ? d
    : Array.isArray(d?.data)
      ? d.data
      : Array.isArray(d?.projects)
        ? d.projects
        : Array.isArray(d?.workspaces)
          ? d.workspaces
          : Array.isArray(d?.items)
            ? d.items
            : [];

  if (list.length === 0) {
    throw new Error("No Floot projects found. Make sure you have created at least one project at floot.co.");
  }

  return list.map((p: any) => ({
    id: String(p.id ?? p._id ?? p.workspaceId ?? ""),
    name: String(p.name ?? p.title ?? p.projectName ?? p.displayName ?? "Untitled"),
    updated_at: String(p.updatedAt ?? p.updated_at ?? p.lastModified ?? ""),
    icon: p.icon ?? p.thumbnail ?? p.iconUrl ?? undefined,
  })).filter(p => p.id);
}

export async function fetchFlootAppFiles({ data }: { data: { token: string; appId: string } }): Promise<{ path: string; content: string }[]> {
  const d = await flootFetch(`/api/projects/${data.appId}/files`, { token: data.token });

  // Shape: { "path/to/file": "content", ... }
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const keys = Object.keys(d);
    if (keys.length > 0 && typeof d[keys[0]] === "string") {
      return keys.map((path) => ({ path, content: String(d[path]) }));
    }
    // Shape: { files: { "path": "content" } }
    if (d.files && typeof d.files === "object" && !Array.isArray(d.files)) {
      return Object.entries(d.files).map(([path, content]) => ({ path, content: String(content) }));
    }
    // Shape: { files: [{ path, content }] }
    if (Array.isArray(d.files)) {
      return (d.files as any[]).map(f => ({ path: String(f.path ?? f.name ?? ""), content: String(f.content ?? "") })).filter(f => f.path);
    }
  }

  // Shape: [{ path, content }]
  if (Array.isArray(d)) {
    return (d as any[]).map(f => ({ path: String(f.path ?? f.name ?? ""), content: String(f.content ?? "") })).filter(f => f.path);
  }

  throw new Error("Unexpected response from Floot files API. The API format may have changed.");
}
