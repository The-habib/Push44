const PROXY = "/proxy/floot";

async function proxyFetch(path: string, token: string, opts?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Floot-Token": token,
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  return fetch(`${PROXY}${path}`, { ...opts, headers });
}

export interface FlootApp {
  id: string;
  name: string;
  icon?: string;
  updated_at: string;
}

export async function validateFlootToken({ data }: { data: { token: string } }): Promise<{ email: string; name: string }> {
  let res: Response;
  try {
    res = await proxyFetch("/api/auth/session", data.token);
  } catch {
    throw new Error("Could not reach Floot. Check your internet connection.");
  }

  if (!res.ok) {
    throw new Error(`Floot returned ${res.status}. Try again or get a fresh token.`);
  }

  const d = await res.json().catch(() => ({}));
  const user = d?.user ?? (d?.email ? d : null);

  if (!user?.email) {
    throw new Error(
      "Your Floot session has expired — this token is no longer valid.\n\n" +
      "To get a fresh token:\n" +
      "1. Go to floot.com and log in\n" +
      "2. Press F12 → Application → Cookies → floot.com\n" +
      "3. Copy the value of nextauth.session-token\n" +
      "4. Paste it here"
    );
  }

  return {
    email: String(user.email),
    name: String(user.name ?? user.displayName ?? user.email),
  };
}

function extractProjectsFromAny(d: unknown): FlootApp[] {
  const out: FlootApp[] = [];

  const tryItem = (item: any) => {
    const id = item?.id ?? item?._id ?? item?.projectId ?? item?.workspaceId;
    const name = item?.name ?? item?.title ?? item?.projectName ?? item?.displayName;
    if (id && name && typeof name === "string") {
      out.push({
        id: String(id),
        name: String(name),
        updated_at: String(item?.updatedAt ?? item?.updated_at ?? item?.lastModified ?? ""),
        icon: item?.icon ?? item?.thumbnail ?? item?.iconUrl ?? undefined,
      });
    }
  };

  if (Array.isArray(d)) {
    d.forEach(tryItem);
  } else if (d && typeof d === "object") {
    const obj = d as Record<string, unknown>;
    for (const key of ["data", "projects", "items", "workspaces", "list", "results"]) {
      if (Array.isArray(obj[key])) {
        (obj[key] as any[]).forEach(tryItem);
        if (out.length > 0) break;
      }
    }
    if (out.length === 0) tryItem(d);
  }

  return out;
}

function parseRscForProjects(rsc: string): FlootApp[] {
  const projects: FlootApp[] = [];
  const seen = new Set<string>();

  const addProject = (p: FlootApp) => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      projects.push(p);
    }
  };

  const lineRe = /^[0-9a-f]+:(.+)$/gm;
  for (const match of rsc.matchAll(lineRe)) {
    const raw = match[1].trim();
    if (!raw.startsWith("{") && !raw.startsWith("[")) continue;
    try {
      const d = JSON.parse(raw);
      for (const p of extractProjectsFromAny(d)) addProject(p);
    } catch {}
  }

  const inlineRe = /\{"id":"([^"]{4,80})","name":"([^"]{1,120})"[^}]*"updatedAt":"([^"]*)"/g;
  for (const m of rsc.matchAll(inlineRe)) {
    addProject({ id: m[1], name: m[2], updated_at: m[3] });
  }

  const idNameRe = /"(?:project|workspace)Id":"([^"]{4,80})"[^}]{0,200}"(?:project|workspace)?[Nn]ame":"([^"]{1,120})"/g;
  for (const m of rsc.matchAll(idNameRe)) {
    addProject({ id: m[1], name: m[2], updated_at: "" });
  }

  return projects;
}

async function tryInternalApi(path: string, token: string): Promise<FlootApp[]> {
  try {
    const res = await proxyFetch(path, token);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text || text.trimStart().startsWith("<!")) return [];
    const d = JSON.parse(text);
    const unwrapped = (d as any)?.json ?? (d as any)?.result?.data?.json ?? d;
    return extractProjectsFromAny(unwrapped);
  } catch {
    return [];
  }
}

export async function listFlootApps({ data }: { data: { token: string } }): Promise<FlootApp[]> {
  const token = data.token;

  const batchSuffix = "?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D";

  const jsonEndpoints = [
    "/api/projects",
    "/api/workspaces",
    "/api/apps",
    "/api/trpc/project.getAll" + batchSuffix,
    "/api/trpc/project.list" + batchSuffix,
    "/api/trpc/workspace.list" + batchSuffix,
    "/_api/projects" + batchSuffix,
    "/_api/user-projects" + batchSuffix,
    "/_api/get-projects" + batchSuffix,
    "/_api/project-list" + batchSuffix,
    "/_api/project.list" + batchSuffix,
    "/_api/project.getAll" + batchSuffix,
    "/_api/project.getOwned" + batchSuffix,
    "/_api/project.getDashboard" + batchSuffix,
    "/_api/workspace.list" + batchSuffix,
    "/_api/workspace.getAll" + batchSuffix,
    "/_api/dashboard.getProjects" + batchSuffix,
    "/_api/dashboard.getData" + batchSuffix,
  ];

  for (const path of jsonEndpoints) {
    const list = await tryInternalApi(path, token);
    if (list.length > 0) return list;
  }

  const rscPaths = ["/en/dashboard", "/en/projects", "/en/apps", "/en/home"];
  for (const path of rscPaths) {
    try {
      const res = await proxyFetch(path, token, {
        headers: {
          "Accept": "text/x-component,text/html,application/json",
          "RSC": "1",
          "X-Floot-Token": token,
        } as Record<string, string>,
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text) continue;

      const projects = parseRscForProjects(text);
      if (projects.length > 0) return projects;
    } catch {}
  }

  return [];
}

export async function fetchFlootAppFiles({ data }: { data: { token: string; appId: string } }): Promise<{ path: string; content: string }[]> {
  const token = data.token;
  const appId = data.appId;

  const filePaths = [
    `/api/projects/${appId}/files`,
    `/api/projects/${appId}/export`,
    `/api/projects/${appId}/source`,
    `/api/apps/${appId}/files`,
    `/api/workspaces/${appId}/files`,
  ];

  for (const path of filePaths) {
    try {
      const res = await proxyFetch(path, token);
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.trimStart().startsWith("<!")) continue;
      const d = JSON.parse(text);

      if (d && typeof d === "object" && !Array.isArray(d)) {
        const keys = Object.keys(d);
        if (keys.length > 0 && typeof d[keys[0]] === "string") {
          return keys.map((p) => ({ path: p, content: String(d[p]) }));
        }
        if (d.files && typeof d.files === "object" && !Array.isArray(d.files)) {
          return Object.entries(d.files).map(([p, c]) => ({ path: p, content: String(c) }));
        }
        if (Array.isArray(d.files)) {
          return (d.files as any[]).map((f) => ({ path: String(f.path ?? f.name ?? ""), content: String(f.content ?? "") })).filter((f) => f.path);
        }
      }

      if (Array.isArray(d)) {
        return (d as any[]).map((f) => ({ path: String(f.path ?? f.name ?? ""), content: String(f.content ?? "") })).filter((f) => f.path);
      }
    } catch {}
  }

  const rscRes = await proxyFetch(`/en/project/${appId}`, token, {
    headers: {
      "Accept": "text/x-component,text/html",
      "RSC": "1",
      "X-Floot-Token": token,
    } as Record<string, string>,
  }).catch(() => null);

  if (rscRes?.ok) {
    const text = await rscRes.text().catch(() => "");
    const fileMatches = [...text.matchAll(/"path":"([^"]+)","content":"((?:[^"\\]|\\.)*)"/g)];
    if (fileMatches.length > 0) {
      return fileMatches.map((m) => ({
        path: m[1],
        content: m[2].replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
      }));
    }
  }

  throw new Error(
    "Floot file export is not yet supported.\n\n" +
    "Floot does not currently expose a public API for downloading project source files. " +
    "This feature will be added once Floot provides an export endpoint."
  );
}
