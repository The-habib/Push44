import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { RemoteApp } from "../types.js";

const CACHE_DIR = path.join(os.homedir(), ".push44", "cache");
const APPS_CACHE_FILE = path.join(CACHE_DIR, "apps.json");
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

export interface CachedAppsPayload {
  timestamp: number;
  apps: RemoteApp[];
}

export async function getCachedApps(platform?: string): Promise<RemoteApp[] | null> {
  try {
    const raw = await fs.readFile(APPS_CACHE_FILE, "utf-8");
    const payload: CachedAppsPayload = JSON.parse(raw);
    if (Date.now() - payload.timestamp > CACHE_TTL_MS) {
      return null;
    }
    if (platform) {
      return payload.apps.filter((a) => a.platform === platform);
    }
    return payload.apps;
  } catch {
    return null;
  }
}

export async function setCachedApps(apps: RemoteApp[]): Promise<void> {
  try {
    await ensureCacheDir();
    const payload: CachedAppsPayload = {
      timestamp: Date.now(),
      apps,
    };
    await fs.writeFile(APPS_CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch {}
}

export async function clearCache(): Promise<void> {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
  } catch {}
}
