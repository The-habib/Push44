const PROXY = "/proxy/zite";

async function proxyFetch(
  path: string,
  session: string,
  csrf: string,
  opts?: RequestInit,
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Zite-Session": session,
    "X-Zite-Csrf": csrf,
    ...((opts?.headers ?? {}) as Record<string, string>),
  };
  return fetch(`${PROXY}${path}`, { ...opts, headers });
}

export interface ZiteApp {
  id: string;
  name: string;
  publicIdentifier: string;
  updated_at: string;
  icon?: string;
}

export interface ZiteLoginResult {
  session: string;
  csrf: string;
  email: string;
  name: string;
}

export async function loginToZite({
  data,
}: {
  data: { email: string; password: string };
}): Promise<ZiteLoginResult> {
  const res = await fetch(`${PROXY}/login/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: data.email, password: data.password }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Invalid email or password. Check your credentials and try again.");
    }
    const text = await res.text().catch(() => "");
    throw new Error(`Login failed (${res.status})${text ? ": " + text.slice(0, 200) : ""}`);
  }

  const d = await res.json().catch(() => null);
  if (!d) throw new Error("Unexpected response from Zite login.");

  const session: string = d.session ?? "";
  const csrf: string = d.csrf ?? "";

  if (!session) {
    throw new Error("Login succeeded but no session cookie was returned. Try again.");
  }

  const email: string = d.email ?? data.email;
  const name: string = d.name ?? d.firstName ?? email;

  return { session, csrf, email, name };
}

export async function validateZiteSession({
  data,
}: {
  data: { session: string; csrf: string };
}): Promise<{ email: string; name: string }> {
  const res = await proxyFetch("/admin/profile", data.session, data.csrf);
  if (!res.ok) {
    throw new Error("Zite session is invalid or expired. Please reconnect.");
  }
  const d = await res.json().catch(() => null);
  const user = d?.user ?? d;
  if (!user?.email) throw new Error("Could not read profile from Zite.");
  return {
    email: String(user.email),
    name: String(user.firstName ?? user.fullName ?? user.email),
  };
}

export async function listZiteApps({
  data,
}: {
  data: { session: string; csrf: string };
}): Promise<ZiteApp[]> {
  const res = await proxyFetch("/admin/zite/apps", data.session, data.csrf);
  if (res.status === 401 || res.status === 403) {
    throw new Error("Your Zite session has expired. Please reconnect in Settings.");
  }
  if (!res.ok) throw new Error(`Failed to list Zite apps (${res.status})`);

  const d = await res.json().catch(() => null);
  const flows: any[] = d?.flows ?? [];
  return flows.map((f) => ({
    id: String(f.publicIdentifier ?? f.id),
    name: String(f.name ?? "Untitled"),
    publicIdentifier: String(f.publicIdentifier ?? f.id),
    updated_at: String(f.updatedAt ?? f.createdAt ?? ""),
    icon: f.screenshotUrl ?? undefined,
  }));
}

export async function fetchZiteAppFiles({
  data,
}: {
  data: { session: string; csrf: string; appId: string };
}): Promise<{ path: string; content: string }[]> {
  const res = await proxyFetch(
    `/admin/zite/apps/${encodeURIComponent(data.appId)}`,
    data.session,
    data.csrf,
  );
  if (res.status === 401 || res.status === 403) {
    throw new Error("Your Zite session has expired. Please reconnect in Settings.");
  }
  if (!res.ok) throw new Error(`Failed to fetch Zite app (${res.status})`);

  const d = await res.json().catch(() => null);
  const rawFiles: Record<string, any> =
    d?.ziteSnapshot?.template?.files ?? {};

  const result: { path: string; content: string }[] = [];
  for (const [filePath, val] of Object.entries(rawFiles)) {
    const content =
      typeof val === "string"
        ? val
        : typeof val?.content === "string"
          ? val.content
          : "";
    if (filePath && content !== undefined) {
      result.push({ path: filePath, content });
    }
  }

  if (result.length === 0) {
    throw new Error(
      "No source files found in this Zite app. Make sure the app has been built at least once.",
    );
  }

  return result;
}
