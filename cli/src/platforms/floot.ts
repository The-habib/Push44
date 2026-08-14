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

const FLOOT_BASE = "https://floot.com";

function itemExtension(
  itemType: "pages" | "helpers" | "components" | "endpoints" | "static",
  name: string
): string {
  if (itemType === "static") return "";
  if (itemType === "helpers" || itemType === "endpoints") return ".ts";
  return ".tsx";
}

function itemPath(
  itemType: "pages" | "helpers" | "components" | "endpoints" | "static",
  name: string
): string {
  const dirMap: Record<string, string> = {
    pages: "pages",
    helpers: "helpers",
    components: "components",
    endpoints: "endpoints",
    static: "static",
  };
  const dir = dirMap[itemType] || itemType;
  return `${dir}/${name}`;
}

export class FlootAdapter implements UniversalPlatformAdapter {
  public platform = "floot" as const;
  public displayName = "Floot";
  public description = "Next-gen web AI application platform";
  public website = "https://floot.com";
  public authMethods: ("session_cookie" | "token")[] = ["session_cookie", "token"];

  private async fetchApi(path: string, token: string, opts?: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Cookie: `nextauth.session-token=${token}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      ...((opts?.headers ?? {}) as Record<string, string>),
    };
    return requestWithRetry(`${FLOOT_BASE}${path}`, { ...opts, headers });
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const token = input.token || input.session;
    if (!token) {
      throw new Push44Error({
        message: "Floot session token is required.",
        suggestion:
          "Copy the `nextauth.session-token` cookie from floot.com and provide it via --token.",
      });
    }

    const validation = await this.validateSession({ flootToken: token });
    if (!validation.valid) {
      throw new Push44Error({
        message: "Invalid or expired Floot session token.",
        suggestion: "Log in to floot.com, extract a fresh `nextauth.session-token` cookie, and retry.",
      });
    }

    return {
      token,
      email: validation.email,
      name: validation.name,
    };
  }

  async validateSession(creds: StoredCredentials): Promise<ValidationResult> {
    if (!creds.flootToken) return { valid: false, error: "No Floot token found." };

    try {
      const res = await this.fetchApi("/api/auth/session", creds.flootToken);
      if (!res.ok) return { valid: false, error: `Floot auth status: ${res.status}` };
      const d = await res.json();
      const user = d?.user || d;
      if (!user?.email) return { valid: false, error: "Empty profile returned." };

      return {
        valid: true,
        email: String(user.email),
        name: String(user.name || user.displayName || user.email),
      };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }

  async listApps(creds: StoredCredentials): Promise<RemoteApp[]> {
    if (!creds.flootToken) {
      throw new Push44Error("Floot session token required. Run `push44 login floot`.");
    }

    const res = await this.fetchApi("/_api/workspace/list", creds.flootToken);
    if (!res.ok) {
      throw new Push44Error(`Failed to fetch Floot workspaces (${res.status})`);
    }

    const d = await res.json();
    const apps: RemoteApp[] = [];
    const seen = new Set<string>();

    const addWs = (ws: any) => {
      if (!ws?.id || !ws?.name || seen.has(ws.id)) return;
      seen.add(ws.id);
      apps.push({
        id: String(ws.id),
        name: String(ws.name),
        platform: "floot",
        updated_at: String(ws.updatedAt || ws.createdAt || new Date().toISOString()),
        icon: ws.iconUrl || undefined,
      });
    };

    for (const ws of d.ownedWorkspaces || []) addWs(ws);
    for (const ws of d.sharedWorkspaces || []) addWs(ws);
    for (const ws of d.favoriteWorkspaces || []) addWs(ws);

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
    if (!creds.flootToken) {
      throw new Push44Error("Floot session token required.");
    }
    const token = creds.flootToken;
    const app = await this.getApp(appId, creds);
    const resolvedId = app ? app.id : appId;
    const appName = app ? app.name : appId;

    options?.onStatus?.("Retrieving project item manifest...");
    const infoRes = await this.fetchApi("/_api/workspace/reference", token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getInfo",
        sourceWorkspaceId: resolvedId,
        include: ["items", "dependencies"],
      }),
    });

    if (!infoRes.ok) {
      throw new Push44Error(`Floot project manifest request failed (${infoRes.status})`);
    }

    const info = await infoRes.json();
    const { components = [], helpers = [], endpoints = [], pages = [], statics = [] } = info.items || {};

    type ItemRef = { type: "pages" | "helpers" | "components" | "endpoints" | "static"; name: string };
    const allItems: ItemRef[] = [
      ...pages.map((n: string) => ({ type: "pages" as const, name: n })),
      ...helpers.map((n: string) => ({ type: "helpers" as const, name: n })),
      ...components.map((n: string) => ({ type: "components" as const, name: n })),
      ...endpoints.map((n: string) => ({ type: "endpoints" as const, name: n })),
      ...statics.map((n: string) => ({ type: "static" as const, name: n })),
    ];

    if (allItems.length === 0) {
      throw new Push44Error("This Floot project does not contain any generated files yet.");
    }

    options?.onStatus?.(`Fetching source code for ${allItems.length} components & pages...`);
    const BATCH = 10;
    const contentMap: Record<string, any> = {};

    for (let i = 0; i < allItems.length; i += BATCH) {
      const batch = allItems.slice(i, i + BATCH);
      const itemNames = batch.map((r) => `${r.type}/${r.name}`);

      const readRes = await this.fetchApi("/_api/workspace/reference", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "readItems",
          sourceWorkspaceId: resolvedId,
          itemNames,
        }),
      });

      if (readRes.ok) {
        const readData = await readRes.json();
        Object.assign(contentMap, readData?.items || {});
      }
      options?.onProgress?.(Math.min(i + BATCH, allItems.length), allItems.length, itemNames[0]);
    }

    const files: ProjectFile[] = [];

    if (info.designChoices?.trim()) {
      files.push({
        path: "docs/design-system.md",
        content: `# Design System\n\n${info.designChoices}`,
      });
    }

    for (const ref of allItems) {
      const key = `${ref.type}/${ref.name}`;
      const item = contentMap[key];
      if (!item || item.error) continue;

      const basePath = itemPath(ref.type, ref.name);
      const ext = itemExtension(ref.type, ref.name);

      if (item.code !== undefined) {
        const codePath = ref.type === "static" ? basePath : `${basePath}${ext}`;
        files.push({
          path: codePath,
          content: item.code,
          sizeBytes: Buffer.byteLength(item.code, "utf-8"),
        });
      }

      if (item.css !== undefined && ref.type !== "static") {
        files.push({
          path: `${basePath}.module.css`,
          content: item.css,
          sizeBytes: Buffer.byteLength(item.css, "utf-8"),
        });
      }
    }

    return {
      appId: resolvedId,
      appName,
      platform: "floot",
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

  // ── Web Deployment ──────────────────────────────────────────────────────────

  async deploy(workspaceId: string, subdomain: string, creds: StoredCredentials, isUpdate = false): Promise<void> {
    const token = creds.flootToken;
    if (!token) throw new Push44Error("Floot session token required.");

    const res = await this.fetchApi("/api/trpc/workspace.requestDeploy", token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: isUpdate ? "prodUpdate" : "prod",
        id: workspaceId,
        subdomain,
        includeMadeWithFloot: true,
        buildMobileApps: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Push44Error(`Floot deploy failed: ${err.message || res.statusText}`);
    }
  }
}
