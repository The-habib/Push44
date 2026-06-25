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

/**
 * Floot stores project source files exclusively in AppSync Events WebSocket
 * subscription state (browser-only React context). There is no REST API for
 * reading or exporting file content. This function throws a tagged error so
 * push.tsx can show a dedicated "Open in Floot" card instead of a generic
 * error toast.
 *
 * Tag format: "FLOOT_NO_API:{appId}:{appName}"
 */
export async function fetchFlootAppFiles({ data }: { data: { token: string; appId: string; appName?: string } }): Promise<{ path: string; content: string }[]> {
  throw new Error(`FLOOT_NO_API:${data.appId}:${data.appName ?? "this project"}`);
}
