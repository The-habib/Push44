import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

/**
 * FNV-1a inspired dual-hash — exact match with Push44 Web localStorage snapshot hashing.
 */
export function simpleHash(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xc4ceb9fe;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca77);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

/**
 * SHA-256 hash string for checksums and commit verification.
 */
export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

// ── AES-256-GCM for Push44 Local Credential Encryption ────────────────────────

const GCM_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(secret: string, salt: Buffer): Buffer {
  return createHash("sha256").update(Buffer.concat([Buffer.from(secret, "utf-8"), salt])).digest();
}

export function encryptPayload(plainText: string, masterKey: string): string {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(masterKey, salt);
  const cipher = createCipheriv(GCM_ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([salt, iv, tag, encrypted]);
  return combined.toString("base64");
}

export function decryptPayload(cipherTextBase64: string, masterKey: string): string {
  const combined = Buffer.from(cipherTextBase64, "base64");
  if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid encrypted payload length");
  }

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(masterKey, salt);
  const decipher = createDecipheriv(GCM_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

// ── Rocket.new Reverse-Engineered AES-256-CBC Decryption ─────────────────────

const ROCKET_AES_KEY_B64 = "dqf8SIWZdQtptMTEH45CHo4A0DJLrkq02y80wmirLYo";

function isRocketEncryptedPayload(v: any): v is { requestAnchor: string; processedContent: string } {
  return (
    v &&
    typeof v === "object" &&
    typeof v.requestAnchor === "string" &&
    typeof v.processedContent === "string" &&
    v.requestAnchor.length > 0 &&
    v.processedContent.length > 0
  );
}

export function decryptRocketPayload(data: any): any {
  if (!isRocketEncryptedPayload(data)) return data;
  try {
    const key = Buffer.from(ROCKET_AES_KEY_B64, "base64");
    const iv = Buffer.from(data.requestAnchor, "base64");
    const ciphertext = Buffer.from(data.processedContent, "base64");

    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const text = decrypted.toString("utf8");
    return JSON.parse(text);
  } catch {
    return data;
  }
}

/**
 * Decode JWT claims without network call (extracts email, companyId, workspaceId, etc.)
 */
export function decodeJwtClaims(token: string): Record<string, any> | null {
  try {
    const raw = token.replace(/^(JWT|Bearer)\s+/i, "");
    const parts = raw.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
