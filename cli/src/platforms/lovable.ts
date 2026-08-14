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

const LOVABLE_API = "https://api.lovable.dev";
const FB_KEY = "AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw";
const FB_SIGN_IN = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_KEY}`;

const KNOWN_PATHS = [
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "tailwind.config.ts",
  "index.html",
  "src/main.tsx",
  "src/App.tsx",
  "src/index.css",
  "src/styles.css",
  "src/lib/utils.ts",
  "src/components/ui/button.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/input.tsx",
  "src/pages/Index.tsx",
  "src/pages/Home.tsx",
  "src/pages/NotFound.tsx",
  "README.md",
];

export class LovableAdapter implements UniversalPlatformAdapter {
  public platform = "lovable" as const;
  public displayName = "Lovable.dev";
  public description = "GPT-4 powered full-stack web application generator";
  public website = "https://lovable.dev";
  public authMethods: ("email_password" | "token")[] = ["email_password", "token"];

  private async fetchApi(path: string, token: string, opts?: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-Lovable-Token": token,
      Accept: "application/json",
      ...((opts?.headers ?? {}) as Record<string, string>),
    };
    return requestWithRetry(`${LOVABLE_API}${path}`, { ...opts, headers });
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (input.token) {
      return { token: input.token, email: input.email };
    }

    if (!input.email || !input.password) {
      throw new Push44Error("Email and password required for Lovable login.");
    }

    const res = await requestWithRetry(FB_SIGN_IN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        returnSecureToken: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Push44Error(`Lovable authentication failed: ${err.error?.message || res.statusText}`);
    }

    const d = await res.json();
    return {
      token: d.idToken,
      refreshToken: d.refreshToken,
      email: d.email || input.email,
      name: d.email || input.email,
    };
  }

  async validateSession(creds: StoredCredentials): Promise<ValidationResult> {
    if (!creds.lovableToken) return { valid: false, error: "No Lovable token configured." };

    try {
      const res = await this.fetchApi("/v1/me", creds.lovableToken);
      if (!res.ok) return { valid: false, error: `Lovable status: ${res.status}` };
      const d = await res.json();
      return {
        valid: true,
        email: String(d.email || creds.lovableEmail || ""),
        name: String(d.name || d.email || ""),
      };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }

  async listApps(creds: StoredCredentials): Promise<RemoteApp[]> {
    if (!creds.lovableToken) throw new Push44Error("Lovable token required.");
    const token = creds.lovableToken;

    const wsRes = await this.fetchApi("/v1/workspaces", token);
    if (!wsRes.ok) throw new Push44Error(`Failed to fetch Lovable workspaces (${wsRes.status})`);

    const wsData = await wsRes.json();
    const workspaces: any[] = wsData.workspaces || [];
    const apps: RemoteApp[] = [];

    for (const ws of workspaces) {
      try {
        const pRes = await this.fetchApi(`/v1/workspaces/${ws.id}/projects?limit=100`, token);
        if (pRes.ok) {
          const pData = await pRes.json();
          for (const p of pData.projects || []) {
            apps.push({
              id: p.id,
              name: String(p.display_name || "Untitled Lovable App"),
              platform: "lovable",
              updated_at: String(p.last_edited_at || p.updated_at || new Date().toISOString()),
              url: p.url,
            });
          }
        }
      } catch {}
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
    if (!creds.lovableToken) throw new Push44Error("Lovable token required.");
    const token = creds.lovableToken;

    const app = await this.getApp(appId, creds);
    const resolvedId = app ? app.id : appId;
    const appName = app ? app.name : appId;

    options?.onStatus?.("Probing project file paths on Lovable Git API...");
    const files: ProjectFile[] = [];

    const BATCH = 10;
    for (let i = 0; i < KNOWN_PATHS.length; i += BATCH) {
      const batch = KNOWN_PATHS.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (filePath) => {
          try {
            const res = await this.fetchApi(
              `/v1/projects/${resolvedId}/git/file?ref=HEAD&path=${encodeURIComponent(filePath)}`,
              token
            );
            if (res.ok) {
              const content = await res.text();
              files.push({
                path: filePath,
                content,
                sizeBytes: Buffer.byteLength(content, "utf-8"),
              });
              options?.onProgress?.(files.length, KNOWN_PATHS.length, filePath);
            }
          } catch {}
        })
      );
    }

    if (files.length === 0) {
      throw new Push44Error({
        message: "No files found in Lovable project.",
        suggestion: "Ensure the project has been opened and built in Lovable at least once.",
      });
    }

    return {
      appId: resolvedId,
      appName,
      platform: "lovable",
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
}
