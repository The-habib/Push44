import { describe, expect, it } from "bun:test";
import { maskSecret, saveCredentials, getCredentials, clearCredentials } from "../src/auth/store.js";

describe("Credential Store & Secret Management", () => {
  it("masks sensitive tokens properly", () => {
    expect(maskSecret("ghp_1234567890abcdef1234567890")).toBe("ghp_••••7890");
    expect(maskSecret("short")).toBe("••••••••");
    expect(maskSecret(undefined)).toBe("None");
  });

  it("persists and retrieves encrypted credentials", async () => {
    await saveCredentials({
      base44Token: "b44_test_token_xyz",
      base44Email: "tester@base44.com",
    });

    const creds = await getCredentials();
    expect(creds.base44Token).toBe("b44_test_token_xyz");
    expect(creds.base44Email).toBe("tester@base44.com");

    await clearCredentials("base44");
    const cleared = await getCredentials();
    expect(cleared.base44Token).toBeUndefined();
  });
});
