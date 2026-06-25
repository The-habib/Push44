const PROXY = "/api/zite";

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
      throw new Error("Wrong email or password. Please check your build.fillout.com credentials and try again.");
    }
    if (res.status === 404) {
      throw new Error("Could not reach the Zite service. Please try again in a moment.");
    }
    if (res.status >= 500) {
      throw new Error("Zite is experiencing server issues. Please try again later.");
    }
    const text = await res.text().catch(() => "");
    let msg = "Login failed — please check your credentials and try again.";
    try {
      const parsed = JSON.parse(text);
      const raw: string = String(parsed.message ?? parsed.error?.message ?? parsed.error ?? "");
      if (raw && !raw.startsWith("{") && !raw.toLowerCase().includes("page could not")) msg = raw;
    } catch {}
    throw new Error(msg);
  }

  const d = await res.json().catch(() => null);
  if (!d) throw new Error("Received an unexpected response from Zite. Please try again.");

  const session: string = d.session ?? "";
  const csrf: string = d.csrf ?? "";

  if (!session) {
    throw new Error("Login succeeded but Zite did not return a session. Please try again.");
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
    throw Object.assign(new Error("Your Zite session has expired. Please reconnect in Settings."), { status: 401 });
  }
  const d = await res.json().catch(() => null);
  const user = d?.user ?? d;
  if (!user?.email) throw new Error("Could not read your Zite profile. Please reconnect in Settings.");
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
    throw Object.assign(new Error("Your Zite session has expired. Please reconnect in Settings."), { status: 401 });
  }
  if (!res.ok) throw new Error("Failed to load your Zite apps. Please try again or reconnect in Settings.");

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
    throw Object.assign(new Error("Your Zite session has expired. Please reconnect in Settings."), { status: 401 });
  }
  if (!res.ok) throw new Error("Failed to fetch the app files from Zite. Please try again or reconnect in Settings.");

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
      "No source files were found in this Zite app. Make sure it has been built at least once in Zite.",
    );
  }

  return result;
}
