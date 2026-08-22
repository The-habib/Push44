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

const BOLT_BASE = "https://bolt.new";

function cleanBoltToken(token: string): string {
  if (!token) return "";
  let clean = token.trim().replace(/^cookie:\s*/i, "");
  if (clean.includes("__session=")) {
    const match = clean.match(/(?:^|;\s*)__session=([^;]+)/);
    if (match) clean = match[1].trim();
    else clean = clean.replace(/^__session=\s*/i, "").trim();
  }
  clean = clean.replace(/^["']|["']$/g, "").trim();
  if (clean.includes(";") && !clean.includes("eyJ")) {
    const first = clean.split(";")[0].trim();
    const eq = first.indexOf("=");
    if (eq !== -1) clean = first.slice(eq + 1).trim();
  }
  return clean;
}

function cleanBoltProjectId(projectId: string): string {
  if (!projectId) return "";
  let id = projectId.trim();
  id = id.replace(/^https?:\/\//i, "");
  id = id.replace(/^bolt\.new\/(?:~\/|project\/)?/i, "");
  id = id.replace(/^~\//, "");
  id = id.replace(/\.bolt\.host\/?$/i, "");
  id = id.replace(/\/.*$/, "");
  return id.trim();
}

export class BoltAdapter implements UniversalPlatformAdapter {
  public platform = "bolt" as const;
  public displayName = "Bolt.new";
  public description = "StackBlitz in-browser full-stack AI development environment";
  public website = "https://bolt.new";
  public authMethods: ("session_cookie" | "token")[] = ["session_cookie", "token"];

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const rawToken = input.token || input.session;
    const token = cleanBoltToken(rawToken || "");
    if (!token) {
      throw new Push44Error("Bolt session token (__session cookie) is required.");
    }
    return { token, email: input.email };
  }

  async validateSession(creds: StoredCredentials): Promise<ValidationResult> {
    const token = cleanBoltToken(creds.boltToken || "");
    if (!token) return { valid: false, error: "No Bolt token found." };
    return { valid: true, email: creds.boltEmail || "authenticated" };
  }

  async listApps(creds: StoredCredentials): Promise<RemoteApp[]> {
    const cleanId = cleanBoltProjectId(creds.boltProjectId || "");
    if (cleanId) {
      return [
        {
          id: cleanId,
          name: cleanId,
          platform: "bolt",
          updated_at: new Date().toISOString(),
          url: creds.boltSiteUrl ? `https://${creds.boltSiteUrl}` : undefined,
        },
      ];
    }
    return [];
  }

  async getApp(appId: string, creds: StoredCredentials): Promise<RemoteApp | null> {
    const cleanId = cleanBoltProjectId(appId);
    return {
      id: cleanId,
      name: cleanId,
      platform: "bolt",
      updated_at: new Date().toISOString(),
    };
  }

  async exportProject(
    appId: string,
    creds: StoredCredentials,
    options?: ExportOptions
  ): Promise<ExportedProject> {
    const cleanId = cleanBoltProjectId(appId);
    const token = cleanBoltToken(creds.boltToken || "");

    options?.onStatus?.(`Checking Bolt project ${cleanId}...`);
    const res = await requestWithRetry(`${BOLT_BASE}/api/deploy/${cleanId}`, {
      headers: token ? { Cookie: `__session=${token}` } : {},
    });

    if (!res.ok && res.status !== 404) {
      throw new Push44Error(`Bolt API error (${res.status})`);
    }

    const d = res.ok ? await res.json().catch(() => ({})) : {};
    const candidateHost = d.site_url || `${cleanId}.bolt.host`;

    options?.onStatus?.(`Fetching project bundle from ${candidateHost}...`);
    const htmlRes = await requestWithRetry(`https://${candidateHost}/`);
    if (!htmlRes.ok) {
      throw new Push44Error(`Could not fetch live project bundle at https://${candidateHost}`);
    }

    const html = await htmlRes.text();
    const files: ProjectFile[] = [{ path: "index.html", content: html }];

    const jsMatch = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
    if (jsMatch) {
      const jsRes = await requestWithRetry(`https://${candidateHost}/assets/${jsMatch[1]}`);
      if (jsRes.ok) {
        files.push({ path: `assets/${jsMatch[1]}`, content: await jsRes.text() });
      }
    }

    const cssMatch = html.match(/href="\/assets\/(index-[^"]+\.css)"/);
    if (cssMatch) {
      const cssRes = await requestWithRetry(`https://${candidateHost}/assets/${cssMatch[1]}`);
      if (cssRes.ok) {
        files.push({ path: `assets/${cssMatch[1]}`, content: await cssRes.text() });
      }
    }

    return {
      appId: cleanId,
      appName: cleanId,
      platform: "bolt",
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
