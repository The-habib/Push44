import { describe, expect, it } from "bun:test";
import { isGitInstalled, getGitVersion, getGitStatus } from "../src/git/operations.js";
import { auditGitRepository } from "../src/git/intelligence.js";

describe("Git Operations & Intelligence", () => {
  it("detects git installation and version", async () => {
    const installed = await isGitInstalled();
    expect(installed).toBe(true);

    const version = await getGitVersion();
    expect(version).toContain("git version");
  });

  it("checks git status and intelligence in current repo", async () => {
    const status = await getGitStatus();
    expect(status.isRepo).toBe(true);

    const audit = await auditGitRepository();
    expect(audit.isRepo).toBe(true);
  });
});
