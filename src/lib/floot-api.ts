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

async function fetchFlootSession(token: string): Promise<{ user: any } | null> {
  try {
    const res = await proxyFetch("/api/auth/session", token);
    if (res.ok) {
      const d = await res.json().catch(() => null);
      if (d && (d.user || d.email)) return d;
      if (res.status !== 404) return null;
    }
    if (res.status === 404) throw new Error("PROXY_UNAVAILABLE");
  } catch (e: any) {
    if (e?.message !== "PROXY_UNAVAILABLE") {
      throw new Error("Could not reach Floot. Check your internet connection.");
    }
  }

  throw new Error(
    "Floot connection requires the Replit-hosted version of Push44.\n\n" +
    "Please open Push44 from your Replit preview (the URL in your Replit editor), " +
    "not push-44.vercel.app. The Replit version has the secure proxy needed to connect Floot."
  );
}

export async function validateFlootToken({ data }: { data: { token: string } }): Promise<{ email: string; name: string }> {
  const d = await fetchFlootSession(data.token);
  const user = d?.user ?? (d?.email ? d : null);

  if (!user?.email) {
    throw new Error(
      "Your Floot session has expired — this token is no longer valid.\n\n" +
      "To get a fresh token:\n" +
      "1. Go to floot.com and log in\n" +
      "2. Open DevTools (F12) → Application → Cookies → floot.com\n" +
      "3. Copy the Value of the cookie named: nextauth.session-token\n" +
      "4. Paste it here"
    );
  }

  return {
    email: String(user.email),
    name: String(user.name ?? user.displayName ?? user.email),
  };
}

export async function listFlootApps({ data }: { data: { token: string } }): Promise<FlootApp[]> {
  const token = data.token;

  try {
    const res = await proxyFetch("/_api/workspace/list", token);
    if (res.ok) {
      const d = await res.json().catch(() => null);
      if (d) {
        const apps: FlootApp[] = [];
        const seen = new Set<string>();

        const addWorkspace = (ws: any) => {
          if (!ws?.id || !ws?.name) return;
          if (seen.has(ws.id)) return;
          seen.add(ws.id);
          apps.push({
            id: String(ws.id),
            name: String(ws.name),
            updated_at: String(ws.updatedAt ?? ws.createdAt ?? ""),
            icon: ws.iconUrl ?? undefined,
          });
        };

        for (const ws of (d.ownedWorkspaces ?? [])) addWorkspace(ws);
        for (const ws of (d.sharedWorkspaces ?? [])) addWorkspace(ws);
        for (const ws of (d.favoriteWorkspaces ?? [])) addWorkspace(ws);

        if (apps.length > 0) return apps;
      }
    }

    if (res.status === 404) {
      throw new Error(
        "Floot connection requires the Replit-hosted version of Push44.\n\n" +
        "Please open Push44 from your Replit preview, not push-44.vercel.app."
      );
    }
  } catch (e: any) {
    if (e?.message?.includes("Replit")) throw e;
  }

  return [];
}

export async function fetchFlootAppFiles({ data }: { data: { token: string; appId: string } }): Promise<{ path: string; content: string }[]> {
  const token = data.token;
  const appId = data.appId;

  const res = await proxyFetch("/_api/workspace/list", token).catch(() => null);
  if (res?.ok) {
    const d = await res.json().catch(() => null);
    const allWorkspaces = [
      ...(d?.ownedWorkspaces ?? []),
      ...(d?.sharedWorkspaces ?? []),
      ...(d?.favoriteWorkspaces ?? []),
    ];
    const workspace = allWorkspaces.find((ws: any) => ws.id === appId);

    if (workspace) {
      const files: { path: string; content: string }[] = [];

      if (workspace.sketchCss && typeof workspace.sketchCss === "string" && workspace.sketchCss.trim()) {
        files.push({ path: "sketch.css", content: workspace.sketchCss });
      }

      if (workspace.userPrompt && typeof workspace.userPrompt === "string") {
        files.push({ path: "PROMPT.md", content: `# ${workspace.name}\n\n${workspace.userPrompt}` });
      }

      if (files.length > 0) {
        throw new Error(
          `Floot does not currently expose a source-code export API.\n\n` +
          `The project "${workspace.name}" was found but its generated source files ` +
          `are stored internally and not accessible via a public API.\n\n` +
          `Floot file export will be added once Floot provides an export endpoint.`
        );
      }
    }
  }

  throw new Error(
    "Floot does not currently expose a source-code export API.\n\n" +
    "Floot file export will be added once Floot provides an export endpoint.\n" +
    "Check back later — this integration is actively being developed."
  );
}
