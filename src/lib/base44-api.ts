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
    if (res.status === 401) throw Object.assign(new Error("Your Base44 token is invalid or has expired. Please reconnect in Settings."), { status: 401 });
    if (res.status === 403) throw Object.assign(new Error("Access denied by Base44 — your token may lack the required permissions."), { status: 403 });
    if (res.status === 429) throw new Error("Too many requests — please wait a moment and try again.");
    if (res.status >= 500) throw new Error("Base44 is experiencing server issues. Please try again in a moment.");
    const body = await res.text().catch(() => "");
    let msg = "An unexpected error occurred with Base44. Please try again.";
    try {
      const p = JSON.parse(body);
      const raw: string = String(p.message ?? p.error ?? p.detail ?? "");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) msg = raw;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function base44Login({ data }: { data: { email: string; password: string } }) {
  const { email, password } = data;
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 400) {
      const body = await res.text().catch(() => "");
      try {
        const p = JSON.parse(body);
        const raw: string = String(p.message ?? p.error ?? p.detail ?? "");
        if (raw.toLowerCase().includes("google") || raw.toLowerCase().includes("oauth")) {
          throw new Error("This account uses Google sign-in. Please use the Auth Token tab instead.");
        }
      } catch (inner) {
        if (inner instanceof Error && inner.message.includes("Auth Token")) throw inner;
      }
      throw new Error("Invalid email or password. If you signed up with Google, use the Auth Token tab instead.");
    }
    if (res.status >= 500) throw new Error("Base44 is experiencing server issues. Please try again in a moment.");
    throw new Error("Login failed — please check your credentials and try again.");
  }
  const d = await res.json();
  const token: string = d.access_token ?? d.token ?? d.accessToken ?? "";
  if (!token) throw new Error("Base44 did not return a session token. Please try again.");
  const user = d.user ?? {};
  return {
    token,
    email: String(user.email ?? email),
    name: String(user.full_name ?? user.name ?? user.username ?? email),
  };
}

export async function validateBase44Token({ data }: { data: { token: string } }) {
  const me = await b44Fetch("/auth/me", undefined, data.token);
  return {
    email: String(me.email ?? ""),
    name: String(me.full_name ?? me.name ?? me.username ?? ""),
  };
}

export interface Base44App {
  id: string;
  name: string;
  updated_at: string;
  files_count?: number;
  icon?: string;
}

export async function listBase44Apps({ data }: { data: { token: string } }): Promise<Base44App[]> {
  const d = await b44Fetch("/apps", undefined, data.token);
  const raw: any[] = Array.isArray(d) ? d : (d.apps ?? d.data ?? d.results ?? []);
  if (raw.length > 0) {
    console.log("[Push44] First app raw fields:", Object.keys(raw[0]));
    console.log("[Push44] First app raw object:", JSON.stringify(raw[0], null, 2));
  }
  return raw
    .map(
      (a: any): Base44App => ({
        id: String(a.id ?? a._id ?? a.appId ?? ""),
        name: String(a.name ?? a.title ?? a.app_name ?? "Unnamed App"),
        updated_at: String(
          a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()
        ),
        files_count: Number(a.files_count ?? a.filesCount ?? 0),
        icon: a.icon ?? a.logo ?? a.app_icon ?? a.thumbnail ?? a.image
          ?? a.icon_url ?? a.logoUrl ?? a.iconUrl ?? a.logo_url
          ?? a.metadata?.icon ?? a.metadata?.logo ?? a.settings?.icon
          ?? undefined,
      })
    )
    .filter((a) => a.id.trim() !== "");
}

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

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = await getSandboxStatus(appId, token);
    if (status === "alive") return;
    await new Promise((r) => setTimeout(r, 3_000));
  }

  throw new Error(
    "The sandbox is taking too long to wake up. Please open your app on Base44 first to wake it manually, then try again."
  );
}

export async function fetchBase44AppFiles({ data }: { data: { token: string; appId: string } }): Promise<Base44File[]> {
  const { token, appId } = data;
  const status = await getSandboxStatus(appId, token);
  if (status !== "alive") {
    await wakeAndWaitForSandbox(appId, token);
  }

  const d = await b44Fetch(`/apps/${appId}/sandbox/files`, undefined, token);
  const filesObj: Record<string, string> = d?.files ?? {};

  return Object.entries(filesObj)
    .filter(([path, content]) => path.trim() !== "" && content !== undefined && content !== null)
    .map(
      ([path, content]): Base44File => ({
        path,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      })
    );
}
