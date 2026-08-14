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
import { decryptRocketPayload, decodeJwtClaims } from "../utils/crypto.js";

const AUTH_BASE = "https://appuser.dhiwise.com";
const BACK_BASE = "https://back.rocket.new";
const APP_BASE = "https://application.rocket.new";
const APP_CODE_BASE = "https://appcodeformat.dhiwise.com";

function flattenDirTree(node: any): string[] {
  if (!node || typeof node !== "object") return [];

  if (typeof node.type === "string" && typeof node.path === "string") {
    if (node.type === "file") {
      const p = String(node.path).replace(/^\/+/, "");
      return p ? [p] : [];
    }
    if (node.type === "directory" || node.type === "folder") {
      return Array.isArray(node.children) ? node.children.flatMap(flattenDirTree) : [];
    }
  }

  if (Array.isArray(node)) {
    return node.flatMap((item: any): string[] => {
      if (typeof item === "string") return [item];
      return flattenDirTree(item);
    });
  }

  const p = node.data || node.result || node.payload;
  if (p !== undefined) return flattenDirTree(p);

  const paths: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (value === null || typeof value === "boolean" || typeof value === "string") {
      paths.push(key);
    } else if (typeof value === "object") {
      const sub = flattenDirTree(value);
      paths.push(...sub.map((f: string) => `${key}/${f}`));
    }
  }
  return paths;
}

function extractContent(d: any): string | null {
  if (!d) return null;
  const p = d.data || d.result || d.payload;
  if (p !== undefined) {
    if (typeof p === "string") return p;
    const c = p.content || p.fileContent || p.body || p.text || p.code || p.data;
    if (typeof c === "string") return c;
    if (c !== undefined && c !== null) return JSON.stringify(c, null, 2);
  }
  const c = d.content || d.fileContent || d.body || d.text;
  if (typeof c === "string") return c;
  return null;
}

export class RocketAdapter implements UniversalPlatformAdapter {
  public platform = "rocket" as const;
  public displayName = "Rocket.new";
  public description = "Flutter & Full-stack mobile / web AI app generator";
  public website = "https://rocket.new";
  public authMethods: ("otp" | "token")[] = ["otp", "token"];

  async requestOTP(email: string): Promise<void> {
    const res = await requestWithRetry(`${AUTH_BASE}/auth/v3/rocket/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Push44Error(`Rocket.new OTP request failed (${res.status}): ${body}`);
    }
  }

  async verifyOTP(email: string, otp: string): Promise<AuthResult> {
    const res = await requestWithRetry(`${AUTH_BASE}/auth/v3/rocket/verify-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Push44Error(`Verification failed (${res.status}): ${body}`);
    }

    const raw = await res.json();
    const d = decryptRocketPayload(raw);
    const payload = d.data || d;

    const token: string =
      payload.token || payload.access_token || payload.jwtToken || payload.authToken || "";
    const user = payload.user || payload;
    const companyId: string =
      payload.companyId || payload.company_id || payload.workspaceId || user.companyId || "";

    return {
      token,
      companyId,
      email: String(user.email || email),
      name: String(user.name || user.fullName || user.username || email),
    };
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (input.token) {
      const result = await this.validateSession({ rocketToken: input.token });
      if (!result.valid) {
        throw new Push44Error("Invalid Rocket.new token provided.");
      }
      return {
        token: input.token,
        email: result.email,
        name: result.name,
        companyId: result.details?.companyId,
      };
    }

    if (input.email && input.otp) {
      return this.verifyOTP(input.email, input.otp);
    }

    throw new Push44Error("Rocket.new requires either --token or OTP verification (--email and --otp).");
  }

  async validateSession(creds: StoredCredentials): Promise<ValidationResult> {
    if (!creds.rocketToken) return { valid: false, error: "No Rocket.new token configured." };

    try {
      const res = await requestWithRetry(`${AUTH_BASE}/auth/v3/get-user-from-token-r`, {
        headers: {
          Authorization: `JWT ${creds.rocketToken}`,
          pageURL: "https://rocket.new",
        },
      });

      if (!res.ok) return { valid: false, error: `Auth failed (${res.status})` };
      const raw = await res.json();
      const d = decryptRocketPayload(raw);
      const payload = d.data || d;
      const user = payload.user || payload;

      const claims = decodeJwtClaims(creds.rocketToken);
      const companyId = String(
        payload.companyId || user.companyId || claims?.companyId || claims?.workspaceId || ""
      );

      return {
        valid: true,
        email: String(user.email || payload.email || creds.rocketEmail || ""),
        name: String(user.name || user.fullName || user.username || ""),
        details: { companyId },
      };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }

  private async resolveCompanyId(token: string, existingCompanyId?: string): Promise<string> {
    if (existingCompanyId) return existingCompanyId;

    // 1. Claims
    const claims = decodeJwtClaims(token);
    if (claims?.companyId || claims?.workspaceId) {
      return String(claims.companyId || claims.workspaceId);
    }

    // 2. Workspace list
    try {
      const res = await requestWithRetry(`${AUTH_BASE}/web/v1/workspace/list`, {
        headers: { Authorization: `JWT ${token}`, pageURL: "https://rocket.new" },
      });
      if (res.ok) {
        const raw = await res.json();
        const d = decryptRocketPayload(raw);
        const u = d.data || d;
        const list = Array.isArray(u.list) ? u.list : Array.isArray(u) ? u : [];
        if (list.length > 0) {
          return String(list[0].companyId || list[0].company_id || "");
        }
      }
    } catch {}

    return "";
  }

  async listApps(creds: StoredCredentials): Promise<RemoteApp[]> {
    if (!creds.rocketToken) {
      throw new Push44Error("Rocket.new token required. Run `push44 login rocket` first.");
    }
    const token = creds.rocketToken;
    const companyId = await this.resolveCompanyId(token, creds.rocketCompanyId);

    const baseHeaders = {
      "Content-Type": "application/json",
      companyId,
      pageURL: "https://rocket.new",
    };

    const apps: RemoteApp[] = [];
    const seen = new Set<string>();

    let page = 1;
    while (page <= 10) {
      try {
        const res = await requestWithRetry(`${BACK_BASE}/api/v1/chat-thread/search`, {
          method: "POST",
          headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
          body: JSON.stringify({ page, limit: 50 }),
        });

        if (!res.ok) break;
        const raw = await res.json();
        const d = decryptRocketPayload(raw);
        const payload = d.data || d;
        const list: any[] = Array.isArray(payload.chatThreads)
          ? payload.chatThreads
          : Array.isArray(payload.threads)
          ? payload.threads
          : Array.isArray(payload)
          ? payload
          : [];

        if (list.length === 0) break;

        for (const item of list) {
          const td = item.threadDetails || {};
          const id = String(item._id || item.id || item.threadId || "");
          if (id && !seen.has(id)) {
            seen.add(id);
            apps.push({
              id,
              applicationId: td.applicationId || td._id || item.applicationId,
              name: String(
                item.displayName || item.title || item.name || td.name || "Untitled Flutter App"
              ),
              platform: "rocket",
              updated_at: String(item.updatedAt || item.updated_at || new Date().toISOString()),
              icon: item.icon || item.logo || undefined,
            });
          }
        }
        if (list.length < 50) break;
        page++;
      } catch {
        break;
      }
    }

    return apps;
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
    if (!creds.rocketToken) {
      throw new Push44Error("Rocket.new token required. Run `push44 login rocket` first.");
    }
    const token = creds.rocketToken;
    const app = await this.getApp(appId, creds);
    const resolvedThreadId = app ? app.id : appId;
    const appName = app ? app.name : appId;

    let applicationId = app?.applicationId || "";

    // 1. Resolve applicationId if missing
    if (!applicationId) {
      options?.onStatus?.("Resolving project application metadata...");
      try {
        const res = await requestWithRetry(`${BACK_BASE}/api/v1/chat-thread/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            pageURL: "https://rocket.new",
          },
          body: JSON.stringify({ id: resolvedThreadId }),
        });
        if (res.ok) {
          const raw = await res.json();
          const d = decryptRocketPayload(raw);
          const td = (d.data || d).threadDetails || {};
          applicationId = td.applicationId || td._id || "";
        }
      } catch {}
    }

    if (!applicationId) {
      applicationId = resolvedThreadId;
    }

    // 2. Ping production container
    options?.onStatus?.("Checking container status...");
    let backendUrl: string | null = null;
    let containerRunning = false;

    try {
      const pingRes = await requestWithRetry(
        `${APP_BASE}/apis/v1/application/production-deploy/ping`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        }
      );
      if (pingRes.ok) {
        const pingJson = await pingRes.json();
        const prod = pingJson?.data?.production || {};
        containerRunning = prod?.status?.Name === "running";
        backendUrl = prod.backendUrl || null;
      }
    } catch {}

    // 3. Fetch directory tree
    options?.onStatus?.("Fetching project file tree...");
    let filePaths: string[] = [];

    for (const authHeader of [`JWT ${token}`, `Bearer ${token}`]) {
      try {
        const treeRes = await requestWithRetry(
          `${APP_CODE_BASE}/app-preview/v1/rocket/project-structure`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader },
            body: JSON.stringify({ applicationId }),
          }
        );
        if (treeRes.ok) {
          const raw = await treeRes.json();
          const d = decryptRocketPayload(raw);
          const paths = flattenDirTree(d);
          if (paths.length > 0) {
            filePaths = paths.filter((p) => p && !p.endsWith("/"));
            break;
          }
        }
      } catch {}
    }

    const files: ProjectFile[] = [];

    // 4. Read files from active container or S3 fallback
    if (containerRunning && backendUrl && filePaths.length > 0) {
      options?.onStatus?.(`Exporting ${filePaths.length} files from active container...`);
      const BATCH = 15;
      for (let i = 0; i < filePaths.length; i += BATCH) {
        const batch = filePaths.slice(i, i + BATCH);
        await Promise.all(
          batch.map(async (filePath, idx) => {
            try {
              const res = await requestWithRetry(`${backendUrl}/api/file-content`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: filePath }),
                timeoutMs: 10_000,
                retries: 1,
              });
              if (res.ok) {
                const raw = await res.json();
                const content = typeof raw.content === "string" ? raw.content : extractContent(raw);
                if (content !== null) {
                  files.push({
                    path: filePath,
                    content,
                    sizeBytes: Buffer.byteLength(content, "utf-8"),
                  });
                  options?.onProgress?.(files.length, filePaths.length, filePath);
                }
              }
            } catch {}
          })
        );
      }
    }

    if (files.length === 0 && filePaths.length > 0) {
      // S3 Fallback
      options?.onStatus?.("Reading files from S3 backup cache...");
      const BATCH = 15;
      for (let i = 0; i < filePaths.length; i += BATCH) {
        const batch = filePaths.slice(i, i + BATCH);
        await Promise.all(
          batch.map(async (filePath) => {
            for (const slash of [false, true]) {
              const fileParam = slash ? `/${filePath}` : filePath;
              try {
                const res = await requestWithRetry(
                  `${APP_CODE_BASE}/app-preview/v1/rocket/file-content`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `JWT ${token}` },
                    body: JSON.stringify({ applicationId, file: fileParam }),
                    timeoutMs: 8000,
                    retries: 1,
                  }
                );
                if (res.ok) {
                  const raw = await res.json();
                  const d = decryptRocketPayload(raw);
                  const content = extractContent(d);
                  if (content !== null) {
                    files.push({
                      path: filePath,
                      content,
                      sizeBytes: Buffer.byteLength(content, "utf-8"),
                    });
                    options?.onProgress?.(files.length, filePaths.length, filePath);
                    break;
                  }
                }
              } catch {}
            }
          })
        );
      }
    }

    if (files.length === 0) {
      throw new Push44Error({
        message: "No files could be downloaded from Rocket.new.",
        suggestion:
          "Open your project at https://rocket.new to ensure the container is alive, then try again.",
      });
    }

    return {
      appId: resolvedThreadId,
      appName,
      platform: "rocket",
      files,
      exportedAt: Date.now(),
    };
  }

  normalizeFiles(files: any[]): ProjectFile[] {
    return files.map((f) => ({
      path: f.path || f.name,
      content: typeof f.content === "string" ? f.content : JSON.stringify(f.content, null, 2),
    }));
  }

  // ── APK Management ──────────────────────────────────────────────────────────

  async triggerApkBuild(threadId: string, creds: StoredCredentials): Promise<any> {
    const token = creds.rocketToken;
    const companyId = await this.resolveCompanyId(token || "", creds.rocketCompanyId);

    const res = await requestWithRetry(`${APP_BASE}/web/v1/playground/make-apk-build`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        companyId,
        pageURL: "https://rocket.new",
      },
      body: JSON.stringify({ threadId }),
    });

    const raw = await res.json();
    return decryptRocketPayload(raw);
  }

  async checkApkBuildStatus(threadId: string, creds: StoredCredentials): Promise<any> {
    const token = creds.rocketToken;
    const companyId = await this.resolveCompanyId(token || "", creds.rocketCompanyId);

    const res = await requestWithRetry(`${APP_BASE}/web/v1/playground/apk-build-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        companyId,
        pageURL: "https://rocket.new",
      },
      body: JSON.stringify({ threadId }),
    });

    const raw = await res.json();
    return decryptRocketPayload(raw);
  }

  async downloadApkUrl(threadId: string, creds: StoredCredentials): Promise<string> {
    const token = creds.rocketToken;
    const companyId = await this.resolveCompanyId(token || "", creds.rocketCompanyId);

    const res = await requestWithRetry(`${APP_BASE}/web/v1/playground/download-apk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        companyId,
        pageURL: "https://rocket.new",
      },
      body: JSON.stringify({ threadId }),
    });

    const raw = await res.json();
    const d = decryptRocketPayload(raw);
    const url = d?.data?.url || d?.url || "";
    if (!url) throw new Push44Error("No APK download URL returned.");
    return url;
  }
}
