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
  /** Numeric flow ID (as string) — required by saveAction and publish endpoints. */
  applicationId: string;
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
    // applicationId carries the numeric flowId needed for saveAction / publish
    applicationId: String(f.id),
    name: String(f.name ?? "Untitled"),
    publicIdentifier: String(f.publicIdentifier ?? f.id),
    updated_at: String(f.updatedAt ?? f.createdAt ?? ""),
    icon: f.screenshotUrl ?? undefined,
  }));
}

/**
 * Returns true if the badge-hiding CSS rule is already present in src/index.css.
 */
export async function getZiteBadgeStatus({
  data,
}: {
  data: { session: string; csrf: string; appId: string };
}): Promise<boolean> {
  const res = await proxyFetch(
    `/admin/zite/apps/${encodeURIComponent(data.appId)}`,
    data.session,
    data.csrf,
  );
  if (!res.ok) return false;
  const d = await res.json().catch(() => null);
  const files: Record<string, any> = d?.ziteSnapshot?.template?.files ?? {};
  const css: string =
    typeof files["src/index.css"]?.content === "string"
      ? files["src/index.css"].content
      : "";
  return css.includes("branding-pill");
}

/**
 * Injects `a.branding-pill { display:none!important }` into src/index.css via
 * the Zite chat saveAction endpoint, then publishes so the change goes live.
 *
 * Confirmed working flow (reverse-engineered 2026-07-05):
 *   1. GET /admin/zite/apps/{pubId}              → current CSS + flowId
 *   2. GET /admin/zite/apps/{pubId}/actions      → conversationId
 *   3. POST /admin/zite/chat/saveAction          → persists file change
 *   4. POST /admin/zite/apps/versioning/publish  → rebuilds Cloudflare Worker
 */
export async function removeZiteBadge({
  data,
}: {
  data: { session: string; csrf: string; appId: string };
}): Promise<void> {
  // 1. Fetch app data — get current CSS content and numeric flowId
  const appRes = await proxyFetch(
    `/admin/zite/apps/${encodeURIComponent(data.appId)}`,
    data.session,
    data.csrf,
  );
  if (appRes.status === 401 || appRes.status === 403) {
    throw Object.assign(
      new Error("Your Zite session has expired. Please reconnect in Settings."),
      { status: 401 },
    );
  }
  if (!appRes.ok) throw new Error("Failed to fetch app data from Zite. Please try again.");

  const appData = await appRes.json().catch(() => null);
  const flowId: number = appData?.flow?.id;
  if (!flowId) throw new Error("Could not read the app's flow ID. Please try again.");

  const files: Record<string, any> = appData?.ziteSnapshot?.template?.files ?? {};
  const currentCss: string =
    typeof files["src/index.css"]?.content === "string"
      ? files["src/index.css"].content
      : "";
  if (!currentCss) {
    throw new Error(
      "Could not find src/index.css in this app. Make sure the app has been built at least once in the Zite editor.",
    );
  }
  if (currentCss.includes("branding-pill")) return; // Already hidden — nothing to do

  // 2. Get conversationId from the actions list
  const actionsRes = await proxyFetch(
    `/admin/zite/apps/${encodeURIComponent(data.appId)}/actions`,
    data.session,
    data.csrf,
  );
  if (!actionsRes.ok) throw new Error("Failed to fetch app actions from Zite. Please try again.");
  const actionsData = await actionsRes.json().catch(() => null);
  const conversationId: string = actionsData?.actions?.[0]?.conversationId ?? "";
  if (!conversationId) {
    throw new Error(
      "Could not find a conversation for this app. Open the app in the Zite editor at least once, then try again.",
    );
  }

  // 3. Append the badge-hiding rule and persist via saveAction
  const BADGE_CSS = "\n\n/* Hide Zite branding badge */\na.branding-pill { display: none !important; }\n";
  const newCss = currentCss + BADGE_CSS;

  const saveRes = await proxyFetch("/admin/zite/chat/saveAction", data.session, data.csrf, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "user_change",
      mode: "build",
      content: "Hide Zite branding badge",
      changes: {
        files: [{ type: "update", filePath: "src/index.css", content: newCss }],
      },
      flowId,
      conversationId,
    }),
  });
  if (!saveRes.ok) {
    const errText = await saveRes.text().catch(() => "");
    throw new Error(
      `Failed to save CSS change (${saveRes.status})${errText ? ": " + errText.slice(0, 120) : ""}`,
    );
  }

  // 4. Publish to deploy the updated CSS to the live Cloudflare Worker
  const pubRes = await proxyFetch("/admin/zite/apps/versioning/publish", data.session, data.csrf, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flowId }),
  });
  if (!pubRes.ok) {
    throw new Error(
      "CSS rule was saved but publishing failed. Try republishing from build.fillout.com.",
    );
  }
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
