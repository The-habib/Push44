import { describe, expect, it } from "bun:test";
import { redactSecrets } from "../src/utils/redact.js";

describe("Secret Redaction & Scrubbing Engine", () => {
  it("scrubs GitHub personal access tokens", () => {
    const raw = "Error: authentication failed for token ghp_1234567890abcdef1234567890abcdef1234 on repo";
    const redacted = redactSecrets(raw);
    expect(redacted).not.toContain("ghp_1234567890abcdef");
    expect(redacted).toContain("[REDACTED_SECRET]");
  });

  it("scrubs JWT authorization bearer tokens", () => {
    const raw = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHRlc3QuY29tIn0.somerandomsignature12345";
    const redacted = redactSecrets(raw);
    expect(redacted).toContain("Bearer [REDACTED]");
  });

  it("scrubs JSON credentials in error dumps", () => {
    const raw = '{"error": "bad request", "apiKey": "secret_key_12345"}';
    const redacted = redactSecrets(raw);
    expect(redacted).not.toContain("secret_key_12345");
    expect(redacted).toContain('"apiKey": "[REDACTED]"');
  });
});
