import type { UniversalPlatformAdapter, AuthInput, AuthResult, ValidationResult, ExportOptions } from "./types.js";
import type { StoredCredentials, RemoteApp, ExportedProject, ProjectFile } from "../types.js";
import { requestWithRetry } from "../utils/network.js";
import { Push44Error } from "../utils/errors.js";

const BASE = "https://app.base44.com/api";

export class Base44Adapter implements UniversalPlatformAdapter {
  public platform = "base44" as const;
  public displayName = "Base44";
  public description = "Full-stack web application builder";
  public website = "https://app.base44.com";
  public authMethods: ("email_password" | "token")[] = ["email_password", "token"];

  private async fetchApi(path: string, opts?: RequestInit, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((opts?.headers ?? {}) as Record<string, string>),
    };

    const res = await requestWithRetry(`${BASE}${path}`, { ...opts, headers });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Push44Error({
          code: "BASE44_AUTH_EXPIRED",
          message: "Base44 session token is invalid or has expired.",
          suggestion: "Run `push44 login base44` to reconnect your account.",
        });
      }
      if (res.status === 403) {
        throw new Push44Error({
          code: "BASE44_FORBIDDEN",
          message: "Access denied by Base44 — token may lack required permissions.",
        });
      }
      if (res.status === 429) {
        throw new Push44Error({
          code: "BASE44_RATE_LIMIT",
          message: "Too many requests to Base44. Please wait a moment and try again.",
        });
      }
      const body = await res.text().catch(() => "");
      let msg = `Base44 API error (${res.status})`;
      try {
        const p = JSON.parse(body);
        msg = p.message || p.error || p.detail || msg;
      } catch {}
      throw new Push44Error({ message: msg, originalError: body });
    }
    return res.json();
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (input.token) {
      const me = await this.fetchApi("/auth/me", undefined, input.token);
      return {
        token: input.token,
        email: String(me.email || ""),
        name: String(me.full_name || me.name || me.username || me.email || ""),
      };
    }

    if (!input.email || !input.password) {
      throw new Push44Error({
        message: "Email and password are required for Base44 login.",
        suggestion: "Provide --email and --password flags or choose Token auth.",
      });
    }

    const res = await requestWithRetry(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email, password: input.password }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 401 || res.status === 400) {
        if (body.toLowerCase().includes("google") || body.toLowerCase().includes("oauth")) {
          throw new Push44Error({
            message: "This account uses Google Sign-In.",
            suggestion: "Use `push44 login base44 --token <token>` instead.",
          });
        }
        throw new Push44Error({
          message: "Invalid email or password for Base44.",
          suggestion: "Check credentials or log in with API token.",
        });
      }
      throw new Push44Error(`Base44 login failed (${res.status}): ${body}`);
    }

    const d = await res.json();
    const token: string = d.access_token || d.token || d.accessToken || "";
    if (!token) {
      throw new Push44Error("Base44 did not return a session token.");
    }
    const user = d.user || {};
    return {
      token,
      email: String(user.email || input.email),
      name: String(user.full_name || user.name || user.username || input.email),
    };
  }

  async validateSession(creds: StoredCredentials): Promise<ValidationResult> {
    if (!creds.base44Token) {
      return { valid: false, error: "No Base44 token found." };
    }
    try {
      const me = await this.fetchApi("/auth/me", undefined, creds.base44Token);
      return {
        valid: true,
        email: String(me.email || creds.base44Email || ""),
        name: String(me.full_name || me.name || me.username || ""),
      };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }

  async listApps(creds: StoredCredentials): Promise<RemoteApp[]> {
    if (!creds.base44Token) {
      throw new Push44Error("Base44 token required. Please run `push44 login base44` first.");
    }
    const d = await this.fetchApi("/apps", undefined, creds.base44Token);
    const raw: any[] = Array.isArray(d) ? d : d.apps || d.data || d.results || [];
    return raw
      .map((a: any): RemoteApp => ({
        id: String(a.id || a._id || a.appId || ""),
        name: String(a.name || a.title || a.app_name || "Unnamed App"),
        platform: "base44",
        updated_at: String(a.updated_at || a.updatedAt || a.modified_at || new Date().toISOString()),
        files_count: Number(a.files_count || a.filesCount || 0),
        icon: a.icon || a.logo || a.app_icon || a.thumbnail || a.image || undefined,
      }))
      .filter((a) => a.id.trim() !== "");
  }

  async getApp(appId: string, creds: StoredCredentials): Promise<RemoteApp | null> {
    const apps = await this.listApps(creds);
    return apps.find((a) => a.id === appId || a.name.toLowerCase() === appId.toLowerCase()) || null;
  }

  private async getSandboxStatus(appId: string, token: string): Promise<string> {
    try {
      const res = await requestWithRetry(`${BASE}/apps/${appId}/sandbox/status`, {
        headers: { Authorization: `Bearer ${token}` },
        timeoutMs: 5000,
        retries: 0,
      });
      if (!res.ok) return "unknown";
      const json = await res.json().catch(() => ({}));
      return json?.status || "unknown";
    } catch {
      return "unknown";
    }
  }

  private async wakeSandbox(appId: string, token: string, options?: ExportOptions): Promise<void> {
    options?.onStatus?.("Waking Base44 sandbox container...");
    for (const path of [`/apps/${appId}/sandbox/start`, `/apps/${appId}/sandbox/wake`]) {
      try {
        await requestWithRetry(`${BASE}${path}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          timeoutMs: 5000,
          retries: 0,
        });
      } catch {}
    }

    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const status = await this.getSandboxStatus(appId, token);
      if (status === "alive") return;
      await new Promise((r) => setTimeout(r, 2_500));
    }

    throw new Push44Error({
      message: "Base44 sandbox is taking too long to wake up.",
      suggestion: "Open your app at https://app.base44.com to start the container, then retry.",
    });
  }

  async exportProject(
    appId: string,
    creds: StoredCredentials,
    options?: ExportOptions
  ): Promise<ExportedProject> {
    if (!creds.base44Token) {
      throw new Push44Error("Base44 token required. Please run `push44 login base44` first.");
    }
    const token = creds.base44Token;

    // 1. Resolve App metadata
    const app = await this.getApp(appId, creds);
    const resolvedAppId = app ? app.id : appId;
    const appName = app ? app.name : appId;

    // 2. Ensure sandbox is alive
    const status = await this.getSandboxStatus(resolvedAppId, token);
    if (status !== "alive") {
      await this.wakeSandbox(resolvedAppId, token, options);
    }

    options?.onStatus?.("Downloading source files from Base44 sandbox...");
    const data = await this.fetchApi(`/apps/${resolvedAppId}/sandbox/files`, undefined, token);
    const rawFiles: Record<string, any> = data?.files || {};

    const projectFiles: ProjectFile[] = Object.entries(rawFiles)
      .filter(([p, c]) => p.trim() !== "" && c !== undefined && c !== null)
      .map(([p, content]): ProjectFile => ({
        path: p,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
        sizeBytes: typeof content === "string" ? Buffer.byteLength(content, "utf-8") : undefined,
      }));

    const BADGE_CSS =
      "\n\n/* Push44 – Hide Base44 branding badge */\n" +
      "#base44-edit-badge, #base44-badge, .base44-badge, a[href*='base44.com'], [data-base44-badge], .made-with-base44 {\n" +
      "  display: none !important;\n" +
      "  visibility: hidden !important;\n" +
      "  opacity: 0 !important;\n" +
      "  pointer-events: none !important;\n" +
      "}\n";

    const BADGE_HTML_BLOCKER =
      `\n    <!-- Push44 – Base44 Badge Blocker -->\n` +
      `    <style>#base44-edit-badge,#base44-badge,.base44-badge,a[href*='base44.com'],[data-base44-badge],.made-with-base44{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}</style>\n`;

    const cleanedFiles = projectFiles.map((file) => {
      let content = file.content;
      if (
        file.path.endsWith(".css") ||
        file.path === "src/index.css" ||
        file.path === "src/App.css" ||
        file.path === "src/styles.css" ||
        file.path === "src/globals.css"
      ) {
        if (!content.includes("Hide Base44 branding badge")) {
          content = content + BADGE_CSS;
        }
      }
      if (file.path.endsWith("index.html")) {
        content = content
          .replace(/<script[^>]*base44[^>]*><\/script>/gi, "")
          .replace(/<a[^>]*href=["'][^"']*base44\.com[^"']*["'][^>]*>.*?<\/a>/gi, "");
        if (!content.includes("Base44 Badge Blocker")) {
          if (content.includes("</head>")) {
            content = content.replace("</head>", `${BADGE_HTML_BLOCKER}</head>`);
          } else if (content.includes("<body")) {
            content = content.replace("<body", `${BADGE_HTML_BLOCKER}<body`);
          }
        }
      }
      if (file.path.endsWith(".jsx") || file.path.endsWith(".tsx") || file.path.endsWith(".js") || file.path.endsWith(".ts")) {
        content = content
          .replace(/<a[^>]*href=["'][^"']*base44\.com[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
          .replace(/<div[^>]*className=["'][^"']*(?:base44-badge|made-with-base44)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");
      }
      return {
        ...file,
        content,
        sizeBytes: typeof content === "string" ? Buffer.byteLength(content, "utf-8") : undefined,
      };
    });

    return {
      appId: resolvedAppId,
      appName,
      platform: "base44",
      files: cleanedFiles,
      exportedAt: Date.now(),
    };
  }

  normalizeFiles(files: any[]): ProjectFile[] {
    return files.map((f) => ({
      path: f.path || f.name,
      content: typeof f.content === "string" ? f.content : JSON.stringify(f.content, null, 2),
    }));
  }
}
