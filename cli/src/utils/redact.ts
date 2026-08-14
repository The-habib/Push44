/**
 * Push44 Secret Redaction & Scrubbing Engine
 * Prevents accidental token, key, or credential leaks in logs, error traces, and stdout.
 */

export function redactSecrets(input: string): string {
  if (!input || typeof input !== "string") return input;

  let cleaned = input;

  // 1. Scrub GitHub PAT
  cleaned = cleaned.replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_SECRET]");

  // 2. Scrub Bearer tokens
  cleaned = cleaned.replace(/Bearer\s+[A-Za-z0-9_\-\.]{16,}/gi, "Bearer [REDACTED]");

  // 3. Scrub JWT tokens
  cleaned = cleaned.replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[REDACTED_JWT]");

  // 4. Scrub JSON credential fields
  cleaned = cleaned.replace(
    /"(password|secret|token|apiKey|apiKeyToken|ziteSession|flootToken)"\s*:\s*"[^"]+"/gi,
    '"$1": "[REDACTED]"'
  );

  // 5. Scrub Private Keys
  cleaned = cleaned.replace(
    /-----BEGIN [A-Z ]+ PRIVATE KEY-----[A-Za-z0-9+/=\s]+-----END [A-Z ]+ PRIVATE KEY-----/g,
    "[REDACTED_PRIVATE_KEY]"
  );

  return cleaned;
}
