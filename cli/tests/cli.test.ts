import { describe, expect, it } from "bun:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";

const execFileAsync = promisify(execFile);
const CLI_BIN = path.resolve(__dirname, "../bin/push44.ts");

describe("Push44 CLI End-to-End Command Tests", () => {
  it("outputs help information", async () => {
    const { stdout } = await execFileAsync("bun", [CLI_BIN, "--help"]);
    expect(stdout).toContain("Push44");
    expect(stdout).toContain("clone");
    expect(stdout).toContain("sync");
    expect(stdout).toContain("doctor");
  });

  it("outputs version information", async () => {
    const { stdout } = await execFileAsync("bun", [CLI_BIN, "--version"]);
    expect(stdout.trim()).toBe("1.0.0");
  });

  it("runs doctor audit command without crash", async () => {
    const { stdout } = await execFileAsync("bun", [CLI_BIN, "doctor"]);
    expect(stdout).toContain("Doctor Audit");
    expect(stdout).toContain("Node.js Runtime");
  });

  it("runs auth status command without crash", async () => {
    const { stdout } = await execFileAsync("bun", [CLI_BIN, "auth"]);
    expect(stdout).toContain("Authentication Status");
    expect(stdout).toContain("Base44");
    expect(stdout).toContain("Rocket.new");
  });
});
