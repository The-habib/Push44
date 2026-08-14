import type {
  UniversalPlatformAdapter,
  AuthInput,
  AuthResult,
  ValidationResult,
  ExportOptions,
} from "./types.js";
import type { StoredCredentials, RemoteApp, ExportedProject, ProjectFile } from "../types.js";
import { requestWithRetry } from "../utils/network.js";
import { Push44Error } from "../utils/errors.js";

const ZITE_BASE = "https://server.zite.com";
const ORIGIN = "https://build.fillout.com";

export class ZiteAdapter implements UniversalPlatformAdapter {
  public platform = "zite" as const;
  public displayName = "Zite";
  public description = "AI app and form workflow platform (build.fillout.com)";
  public website = "https://build.fillout.com";
  public authMethods: ("email_password" | "session_cookie")[] = ["email_password", "session_cookie"];

  private async fetchApi(
    path: string,
    session?: string,
    csrf?: string,
    opts?: RequestInit
  ): Promise<Response> {
    const cookieParts: string[] = [];
    if (session) cookieParts.push(`connect.sid=${session}`);
    if (csrf) cookieParts.push(`fillout-csrf-token=${csrf}`);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: ORIGIN,
      Referer: `${ORIGIN}/`,
      ...(cookieParts.length > 0 ? { Cookie: cookieParts.join("; ") } : {}),
      ...((opts?.headers ?? {}) as Record<string, string>),
    };

    return requestWithRetry(`${ZITE_BASE}${path}`, { ...opts, headers });
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (input.session) {
      const validation = await this.validateSession({
        ziteSession: input.session,
        ziteCsrf: input.csrf,
      });
      if (!validation.valid) {
        throw new Push44Error("Invalid Zite session credentials.");
      }
      return {
        session: input.session,
        csrf: input.csrf,
        email: validation.email,
        name: validation.name,
      };
    }

    if (!input.email || !input.password) {
      throw new Push44Error({
        message: "Email and password or session cookies required for Zite.",
        suggestion: "Use `push44 login zite --email <email> --password <pass>` or provide --session.",
      });
    }

    const res = await requestWithRetry(`${ZITE_BASE}/login/password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: ORIGIN,
        Referer: `${ORIGIN}/`,
      },
      body: JSON.stringify({ email: input.email, password: input.password }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Push44Error(`Zite login failed (${res.status}): ${body}`);
    }

    const rawCookies = (res.headers as any).getSetCookie?.() || [];
    let sessionVal = "";
    let csrfVal = "";

    for (const c of rawCookies) {
      const m = c.match(/^([^=]+)=([^;]*)/);
      if (!m) continue;
      if (m[1] === "connect.sid") sessionVal = m[2];
      if (m[1] === "fillout-csrf-token") csrfVal = m[2];
    }

    let profileEmail = input.email;
    let profileName = input.email;

    try {
      const pr = await this.fetchApi("/admin/profile", sessionVal, csrfVal);
      if (pr.ok) {
        const pd = await pr.json();
        const u = pd?.user || pd;
        profileEmail = u?.email || profileEmail;
        profileName = u?.firstName || u?.fullName || profileName;
      }
    } catch {}

    return {
      session: sessionVal,
      csrf: csrfVal,
      email: profileEmail,
      name: profileName,
    };
  }

  async validateSession(creds: StoredCredentials): Promise<ValidationResult> {
    if (!creds.ziteSession) return { valid: false, error: "No Zite session configured." };

    try {
      const res = await this.fetchApi("/admin/profile", creds.ziteSession, creds.ziteCsrf);
      if (!res.ok) return { valid: false, error: `Zite profile status ${res.status}` };
      const d = await res.json();
      const user = d?.user || d;

      return {
        valid: true,
        email: String(user?.email || creds.ziteEmail || ""),
        name: String(user?.firstName || user?.fullName || user?.email || ""),
      };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }

  async listApps(creds: StoredCredentials): Promise<RemoteApp[]> {
    if (!creds.ziteSession) throw new Push44Error("Zite session required.");

    const res = await this.fetchApi("/admin/zite/apps", creds.ziteSession, creds.ziteCsrf);
    if (!res.ok) throw new Push44Error(`Failed to load Zite apps (${res.status})`);

    const d = await res.json();
    const flows: any[] = d?.flows || [];

    return flows.map((f) => ({
      id: String(f.publicIdentifier || f.id),
      applicationId: String(f.id),
      name: String(f.name || "Untitled App"),
      platform: "zite",
      updated_at: String(f.updatedAt || f.createdAt || new Date().toISOString()),
      icon: f.screenshotUrl || undefined,
    }));
  }

  async getApp(appId: string, creds: StoredCredentials): Promise<RemoteApp | null> {
    const apps = await this.listApps(creds);
    return apps.find((a) => a.id === appId || a.name.toLowerCase() === appId.toLowerCase()) || null;
  }

  async exportProject(
    appId: string,
    creds: StoredCredentials,
    options?: ExportOptions
  ): Promise<ExportedProject> {
    if (!creds.ziteSession) throw new Push44Error("Zite session required.");

    const app = await this.getApp(appId, creds);
    const resolvedId = app ? app.id : appId;
    const appName = app ? app.name : appId;

    options?.onStatus?.("Downloading Zite project snapshot...");
    const res = await this.fetchApi(
      `/admin/zite/apps/${encodeURIComponent(resolvedId)}`,
      creds.ziteSession,
      creds.ziteCsrf
    );

    if (!res.ok) throw new Push44Error(`Failed to download Zite app (${res.status})`);

    const d = await res.json();
    const rawFiles: Record<string, any> = d?.ziteSnapshot?.template?.files || {};

    const projectFiles: ProjectFile[] = [];
    for (const [filePath, val] of Object.entries(rawFiles)) {
      const content =
        typeof val === "string" ? val : typeof val?.content === "string" ? val.content : "";
      if (filePath && content !== undefined) {
        projectFiles.push({
          path: filePath,
          content,
          sizeBytes: Buffer.byteLength(content, "utf-8"),
        });
      }
    }

    if (projectFiles.length === 0) {
      throw new Push44Error("No files found in Zite snapshot.");
    }

    return {
      appId: resolvedId,
      appName,
      platform: "zite",
      files: projectFiles,
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
