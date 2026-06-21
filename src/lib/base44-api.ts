import { createServerFn } from "@tanstack/react-start";

const BASE44_API = "https://api.base44.com/v1";

function b44Headers(token?: string) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

async function b44Fetch(path: string, opts?: RequestInit, token?: string) {
  const res = await fetch(`${BASE44_API}${path}`, {
    ...opts,
    headers: { ...b44Headers(token), ...(opts?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `Base44 API error ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      msg = parsed.message ?? parsed.error ?? parsed.detail ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ─── Device Code Flow ────────────────────────────────────────────────────────

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;       // e.g. "VNCR-NWSQ"
  verification_uri: string; // URL user opens in browser
  expires_in: number;      // seconds until code expires
  interval: number;        // polling interval in seconds
}

export const initiateBase44DeviceAuth = createServerFn({ method: "POST" }).handler(
  async () => {
    const res = await fetch(`${BASE44_API}/auth/device`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: "base44-push" }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let msg = `Failed to start device auth (${res.status})`;
      try {
        const p = JSON.parse(body);
        msg = p.message ?? p.error ?? p.detail ?? msg;
      } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    return {
      device_code: String(data.device_code ?? data.deviceCode ?? ""),
      user_code: String(
        data.user_code ??
        data.userCode ??
        data.code ??
        data.verification_code ??
        ""
      ),
      verification_uri: String(
        data.verification_uri ??
        data.verificationUri ??
        data.verification_url ??
        data.url ??
        "https://app.base44.com/device"
      ),
      expires_in: Number(data.expires_in ?? data.expiresIn ?? 900),
      interval: Number(data.interval ?? 5),
    } as DeviceCodeResponse;
  }
);

// Returns { status: "pending" | "authorized" | "expired" | "denied" }
// When authorized also returns { token, email, name }
export const pollBase44DeviceAuth = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { device_code } = ctx.data as { device_code: string };

    const res = await fetch(`${BASE44_API}/auth/device/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: "base44-push",
      }),
    });

    const data = await res.json().catch(() => ({}));

    // Standard OAuth device flow error codes
    const error: string =
      data.error ?? data.error_code ?? data.status ?? "";

    if (
      error === "authorization_pending" ||
      error === "pending" ||
      res.status === 428
    ) {
      return { status: "pending" as const };
    }
    if (
      error === "expired_token" ||
      error === "expired" ||
      res.status === 410
    ) {
      return { status: "expired" as const };
    }
    if (
      error === "access_denied" ||
      error === "denied" ||
      res.status === 403
    ) {
      return { status: "denied" as const };
    }

    if (!res.ok) {
      return { status: "pending" as const }; // keep polling on unknown errors
    }

    // Success — extract token
    const token: string =
      data.access_token ??
      data.token ??
      data.accessToken ??
      data.jwt ??
      data.auth_token ??
      "";

    if (!token) return { status: "pending" as const };

    const user = data.user ?? data.profile ?? {};
    return {
      status: "authorized" as const,
      token,
      email: String(user.email ?? data.email ?? ""),
      name: String(user.name ?? user.full_name ?? user.username ?? data.name ?? ""),
    };
  }
);

// ─── Token validation & user info ─────────────────────────────────────────────

export const validateBase44Token = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const data = await b44Fetch("/auth/me", undefined, token);
    return {
      email: String(data.email ?? data.user?.email ?? ""),
      name: String(
        data.name ?? data.full_name ?? data.username ?? data.user?.name ?? ""
      ),
    };
  }
);

// ─── Apps & Files ──────────────────────────────────────────────────────────────

export interface Base44App {
  id: string;
  name: string;
  updated_at: string;
  files_count?: number;
}

export const listBase44Apps = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token } = ctx.data as { token: string };
    const data = await b44Fetch("/apps", undefined, token);
    const raw: any[] = Array.isArray(data)
      ? data
      : (data.apps ?? data.data ?? data.results ?? []);
    return raw.map(
      (a: any): Base44App => ({
        id: String(a.id ?? a._id ?? a.appId ?? a.app_id ?? ""),
        name: String(
          a.name ?? a.title ?? a.app_name ?? a.appName ?? "Unnamed App"
        ),
        updated_at: String(
          a.updated_at ?? a.updatedAt ?? a.modified_at ?? new Date().toISOString()
        ),
        files_count: Number(a.files_count ?? a.filesCount ?? 0),
      })
    );
  }
);

export interface Base44File {
  path: string;
  content: string;
}

export const fetchBase44AppFiles = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { token, appId } = ctx.data as { token: string; appId: string };
    const data = await b44Fetch(`/apps/${appId}/files`, undefined, token);
    const raw: any[] = Array.isArray(data)
      ? data
      : (data.files ?? data.data ?? data.results ?? []);
    return raw
      .filter((f: any) => f && (f.path || f.name || f.filename))
      .map(
        (f: any): Base44File => ({
          path: String(f.path ?? f.name ?? f.filename ?? ""),
          content: String(f.content ?? f.code ?? f.text ?? f.body ?? ""),
        })
      );
  }
);
