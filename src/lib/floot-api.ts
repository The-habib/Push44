'use server';
import { createServerFn } from "@tanstack/start";

const FLOOT_BASE = "https://floot.com";
const FLOOT_TRPC = `${FLOOT_BASE}/api/trpc`;

function flootCookies(token: string) {
  return `__Secure-next-auth.session-token=${token}`;
}

function flootHeaders(token: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    Cookie: flootCookies(token),
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125 Safari/537.36",
    ...extra,
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export const flootSendMagicLink = createServerFn()
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const csrfRes = await fetch(`${FLOOT_BASE}/api/auth/csrf`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!csrfRes.ok) throw new Error("Could not reach Floot — please check your connection.");
    const { csrfToken } = await csrfRes.json() as { csrfToken: string };

    const body = new URLSearchParams({
      csrfToken,
      email: data.email.trim(),
      callbackUrl: `${FLOOT_BASE}/en/dashboard`,
      json: "true",
    });

    const res = await fetch(`${FLOOT_BASE}/api/auth/signin/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`Magic link request failed (${res.status}). Try again.`);
    return { ok: true };
  });

export const validateFlootToken = createServerFn()
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const res = await fetch(`${FLOOT_BASE}/api/auth/session`, {
      headers: flootHeaders(data.token),
    });
    if (!res.ok) throw new Error(`Session check failed (${res.status})`);
    const session = await res.json() as { user?: { email?: string; name?: string } };
    if (!session?.user?.email) throw new Error("Token is invalid or expired. Please get a fresh session token from floot.com.");
    return {
      email: session.user.email,
      name: session.user.name ?? session.user.email,
    };
  });

// ── App Listing ────────────────────────────────────────────────────────────────

interface FlootApp {
  id: string;
  name: string;
  icon?: string;
  updatedAt?: string;
}

export const listFlootApps = createServerFn()
  .validator((data: { token: string }) => data)
  .handler(async ({ data }): Promise<FlootApp[]> => {
    const res = await fetch(`${FLOOT_BASE}/en/dashboard`, {
      headers: flootHeaders(data.token, {
        RSC: "1",
        "Next-Router-State-Tree": encodeURIComponent(JSON.stringify(["", { children: ["__PAGE__", {}] }, null, null, true])),
        "Next-Router-Prefetch": "0",
        Accept: "text/x-component",
      }),
      redirect: "manual",
    });

    if (res.status === 307 || res.status === 302 || res.status === 308 || res.status === 301) {
      throw new Error("Session token is invalid or expired. Please paste a fresh token from floot.com.");
    }
    if (!res.ok) throw new Error(`Dashboard fetch failed (${res.status})`);

    const text = await res.text();

    const apps: FlootApp[] = [];
    const seen = new Set<string>();

    // Strategy 1: Look for projectName field (confirmed from showcase RSC data)
    const projectNameRe = /"projectName"\s*:\s*"([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = projectNameRe.exec(text)) !== null) {
      const projectName = match[1];
      const before = text.slice(Math.max(0, match.index - 200), match.index);
      const idMatch = before.match(/"id"\s*:\s*"([^"]+)"(?:[^}]*?)$/);
      if (idMatch && !seen.has(idMatch[1])) {
        seen.add(idMatch[1]);
        // Look for iconUrl nearby
        const after = text.slice(match.index, match.index + 400);
        const iconMatch = after.match(/"iconUrl"\s*:\s*"([^"]+)"/);
        apps.push({ id: idMatch[1], name: projectName, icon: iconMatch?.[1] });
      }
    }

    // Strategy 2: Look for workspace name patterns
    if (apps.length === 0) {
      const nameRe = /"name"\s*:\s*"([^"]+)"/g;
      while ((match = nameRe.exec(text)) !== null) {
        const name = match[1];
        if (name.length < 3 || name.length > 100) continue;
        const before = text.slice(Math.max(0, match.index - 300), match.index);
        const idMatch = before.match(/"(?:id|workspaceId)"\s*:\s*"([a-zA-Z0-9_-]{10,})"(?:[^}]*?)$/);
        if (idMatch && !seen.has(idMatch[1])) {
          seen.add(idMatch[1]);
          apps.push({ id: idMatch[1], name });
        }
      }
    }

    if (apps.length === 0) {
      throw new Error("No Floot projects found. Make sure you have created at least one project at floot.com.");
    }

    return apps;
  });

// ── File Fetching ──────────────────────────────────────────────────────────────

export const fetchFlootAppFiles = createServerFn()
  .validator((data: { token: string; workspaceId: string }) => data)
  .handler(async ({ data }): Promise<{ path: string; content: string }[]> => {
    // Step 1: Ensure the workspace backend is running and get its URL
    const tRpcRes = await fetch(`${FLOOT_TRPC}/workspace.ensureBackendRunningForDev`, {
      method: "POST",
      headers: flootHeaders(data.token, {
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({ json: { id: data.workspaceId } }),
    });

    if (tRpcRes.status === 401) throw new Error("Unauthorized — session token is invalid or expired.");
    if (!tRpcRes.ok) {
      const err = await tRpcRes.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? `Backend start failed (${tRpcRes.status})`);
    }

    const tRpcData = await tRpcRes.json() as {
      result?: {
        data?: {
          json?: Record<string, unknown>;
        };
      };
    };

    const inner = tRpcData?.result?.data?.json;

    // Extract backend URL — try all known field names
    const backendUrl = (
      (inner as any)?.url ??
      (inner as any)?.backendUrl ??
      (inner as any)?.devUrl ??
      (inner as any)?.containerUrl ??
      (inner as any)?.address ??
      (inner as any)?.wsUrl ??
      null
    ) as string | null;

    if (!backendUrl) {
      // Fallback: try RSC editor page for file tree
      return fetchFlootFilesViaRsc(data.token, data.workspaceId);
    }

    // Step 2: Get file list from backend
    const files = await fetchFromBackend(backendUrl);
    if (files.length > 0) return files;

    // Fallback to RSC
    return fetchFlootFilesViaRsc(data.token, data.workspaceId);
  });

async function fetchFromBackend(backendUrl: string): Promise<{ path: string; content: string }[]> {
  const base = backendUrl.replace(/\/$/, "");

  // Try file listing endpoints
  let filePaths: string[] = [];

  for (const endpoint of ["/api/files", "/api/file-list", "/files", "/api/project-files"]) {
    try {
      const res = await fetch(`${base}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json() as unknown;
      if (Array.isArray(data)) {
        filePaths = data.filter((x): x is string => typeof x === "string");
        break;
      }
      if (data && typeof data === "object") {
        const arr = (data as any).files ?? (data as any).paths ?? (data as any).data;
        if (Array.isArray(arr)) {
          filePaths = arr.filter((x): x is string => typeof x === "string");
          break;
        }
      }
    } catch {}
  }

  if (filePaths.length === 0) return [];

  // Fetch each file in parallel batches of 20
  const BATCH = 20;
  const results: { path: string; content: string }[] = [];

  for (let i = 0; i < filePaths.length && i < 300; i += BATCH) {
    const batch = filePaths.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map(async (filePath) => {
        for (const endpoint of ["/api/file-content", "/api/file", "/file-content"]) {
          try {
            const res = await fetch(`${base}${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: filePath }),
              signal: AbortSignal.timeout(6000),
            });
            if (!res.ok) continue;
            const data = await res.json() as { content?: string; data?: string };
            const content = data?.content ?? data?.data ?? "";
            if (typeof content === "string") return { path: filePath, content };
          } catch {}
        }
        return null;
      })
    );
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) results.push(r.value);
    }
  }

  return results;
}

async function fetchFlootFilesViaRsc(token: string, workspaceId: string): Promise<{ path: string; content: string }[]> {
  // Try the editor RSC page which may embed file tree in server-rendered props
  const res = await fetch(`${FLOOT_BASE}/en/editor`, {
    headers: flootHeaders(token, {
      RSC: "1",
      Accept: "text/x-component",
    }),
    redirect: "manual",
  });

  if (!res.ok && res.status !== 307) {
    throw new Error(
      "Could not fetch files from Floot. The workspace backend URL was not returned — " +
      "this may mean the workspace is still starting up. Please try again in a few seconds."
    );
  }

  const text = await res.text();

  // Try to extract a file tree from RSC props
  const files: { path: string; content: string }[] = [];
  const fileMatch = text.match(/"files"\s*:\s*(\{[^}]{0,100000}\})/s);
  if (fileMatch) {
    try {
      const fileMap = JSON.parse(fileMatch[1]) as Record<string, string>;
      for (const [path, content] of Object.entries(fileMap)) {
        if (typeof content === "string") files.push({ path, content });
      }
    } catch {}
  }

  if (files.length > 0) return files;

  throw new Error(
    "Could not fetch files from this Floot workspace. " +
    "The workspace backend did not return a URL — it may still be starting up. " +
    "Please wait a moment and try again."
  );
}
