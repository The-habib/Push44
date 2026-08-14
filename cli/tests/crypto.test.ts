import { describe, expect, it } from "bun:test";
import {
  simpleHash,
  sha256,
  encryptPayload,
  decryptPayload,
  decryptRocketPayload,
  decodeJwtClaims,
} from "../src/utils/crypto.js";

describe("Crypto & Hashing Utilities", () => {
  it("computes deterministic FNV-1a simpleHash matching web app", () => {
    const text = "Hello Push44 CLI!";
    const hash1 = simpleHash(text);
    const hash2 = simpleHash(text);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(16);
  });

  it("computes standard SHA-256 checksums", () => {
    const hash = sha256("test-content");
    expect(hash).toBe("0a3666a0710c08aa6d0de92ce72beeb5b93124cce1bf3701c9d6cdeb543cb73e");
  });

  it("encrypts and decrypts payloads with AES-256-GCM", () => {
    const secretKey = "super-secret-master-key";
    const data = JSON.stringify({ token: "ghp_123456", email: "user@example.com" });

    const encrypted = encryptPayload(data, secretKey);
    expect(encrypted).not.toBe(data);

    const decrypted = decryptPayload(encrypted, secretKey);
    expect(decrypted).toBe(data);
    expect(JSON.parse(decrypted).token).toBe("ghp_123456");
  });

  it("decodes JWT claims without network calls", () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRldkBwdXNoNDQuZGV2IiwiY29tcGFueUlkIjoiY21wX2FiYzEyMyIsImV4cCI6MTk5OTk5OTk5OX0.signature";
    const claims = decodeJwtClaims(token);

    expect(claims).not.toBeNull();
    expect(claims?.email).toBe("dev@push44.dev");
    expect(claims?.companyId).toBe("cmp_abc123");
  });

  it("handles unencrypted payloads safely in decryptRocketPayload", () => {
    const plain = { hello: "world", count: 42 };
    const result = decryptRocketPayload(plain);
    expect(result).toEqual(plain);
  });
});
