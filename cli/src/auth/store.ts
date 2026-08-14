import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { StoredCredentials, SupportedPlatform } from "../types.js";
import { encryptPayload, decryptPayload } from "../utils/crypto.js";

const CONFIG_DIR = path.join(os.homedir(), ".push44");
const CREDS_FILE = path.join(CONFIG_DIR, "credentials.json");
const CREDS_ENC_FILE = path.join(CONFIG_DIR, "credentials.enc");

function getMasterKey(): string {
  const user = os.userInfo()?.username || "default";
  return `${os.hostname()}-${user}-${os.platform()}-push44-secret`;
}

export async function ensureConfigDir(): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

export function maskSecret(secret?: string, keep = 4): string {
  if (!secret) return "None";
  if (secret.length <= keep * 2) return "••••••••";
  return `${secret.slice(0, keep)}••••${secret.slice(-keep)}`;
}

/**
 * Get credentials combining stored credentials and environment variables.
 * Recovers gracefully from corrupted or invalid encrypted files.
 */
export async function getCredentials(): Promise<StoredCredentials> {
  let stored: StoredCredentials = {};

  try {
    if (await fileExists(CREDS_ENC_FILE)) {
      const enc = await fs.readFile(CREDS_ENC_FILE, "utf-8");
      try {
        const decrypted = decryptPayload(enc, getMasterKey());
        stored = JSON.parse(decrypted);
      } catch {
        // Fallback: Backup corrupted/unreadable file and start fresh
        await fs.rename(CREDS_ENC_FILE, `${CREDS_ENC_FILE}.bak`).catch(() => {});
        stored = {};
      }
    } else if (await fileExists(CREDS_FILE)) {
      const raw = await fs.readFile(CREDS_FILE, "utf-8");
      stored = JSON.parse(raw);
    }
  } catch {
    stored = {};
  }

  // Overlay environment variables
  const creds: StoredCredentials = {
    ...stored,
    githubToken: process.env.PUSH44_GITHUB_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || stored.githubToken,
    githubUsername: process.env.PUSH44_GITHUB_USER || stored.githubUsername,
    base44Token: process.env.PUSH44_BASE44_TOKEN || stored.base44Token,
    base44Email: process.env.PUSH44_BASE44_EMAIL || stored.base44Email,
    rocketToken: process.env.PUSH44_ROCKET_TOKEN || stored.rocketToken,
    rocketEmail: process.env.PUSH44_ROCKET_EMAIL || stored.rocketEmail,
    rocketCompanyId: process.env.PUSH44_ROCKET_COMPANY_ID || stored.rocketCompanyId,
    flootToken: process.env.PUSH44_FLOOT_TOKEN || stored.flootToken,
    flootEmail: process.env.PUSH44_FLOOT_EMAIL || stored.flootEmail,
    ziteSession: process.env.PUSH44_ZITE_SESSION || stored.ziteSession,
    ziteCsrf: process.env.PUSH44_ZITE_CSRF || stored.ziteCsrf,
    ziteEmail: process.env.PUSH44_ZITE_EMAIL || stored.ziteEmail,
    boltToken: process.env.PUSH44_BOLT_TOKEN || stored.boltToken,
    boltEmail: process.env.PUSH44_BOLT_EMAIL || stored.boltEmail,
    lovableToken: process.env.PUSH44_LOVABLE_TOKEN || stored.lovableToken,
    lovableRefreshToken: process.env.PUSH44_LOVABLE_REFRESH_TOKEN || stored.lovableRefreshToken,
    lovableEmail: process.env.PUSH44_LOVABLE_EMAIL || stored.lovableEmail,
  };

  return creds;
}

export async function writeRawCredentials(creds: StoredCredentials): Promise<void> {
  await ensureConfigDir();
  const json = JSON.stringify(creds, null, 2);
  const encrypted = encryptPayload(json, getMasterKey());

  await fs.writeFile(CREDS_ENC_FILE, encrypted, { encoding: "utf-8", mode: 0o600 });
  if (await fileExists(CREDS_FILE)) {
    await fs.unlink(CREDS_FILE).catch(() => {});
  }
}

/**
 * Persist credentials securely.
 */
export async function saveCredentials(update: Partial<StoredCredentials>): Promise<StoredCredentials> {
  const current = await getCredentials();
  const merged: StoredCredentials = { ...current, ...update };
  await writeRawCredentials(merged);
  return merged;
}

/**
 * Remove credentials for a platform or all platforms.
 */
export async function clearCredentials(platform?: SupportedPlatform | "github"): Promise<void> {
  if (!platform) {
    if (await fileExists(CREDS_ENC_FILE)) await fs.unlink(CREDS_ENC_FILE).catch(() => {});
    if (await fileExists(CREDS_FILE)) await fs.unlink(CREDS_FILE).catch(() => {});
    return;
  }

  const current = await getCredentials();
  switch (platform) {
    case "github":
      delete current.githubToken;
      delete current.githubUsername;
      delete current.githubName;
      delete current.githubEmail;
      delete current.githubId;
      break;
    case "base44":
      delete current.base44Token;
      delete current.base44Email;
      break;
    case "rocket":
      delete current.rocketToken;
      delete current.rocketEmail;
      delete current.rocketCompanyId;
      break;
    case "floot":
      delete current.flootToken;
      delete current.flootEmail;
      break;
    case "zite":
      delete current.ziteSession;
      delete current.ziteCsrf;
      delete current.ziteEmail;
      break;
    case "bolt":
      delete current.boltToken;
      delete current.boltEmail;
      delete current.boltProjectId;
      delete current.boltSiteUrl;
      break;
    case "lovable":
      delete current.lovableToken;
      delete current.lovableRefreshToken;
      delete current.lovableEmail;
      break;
  }

  await writeRawCredentials(current);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
