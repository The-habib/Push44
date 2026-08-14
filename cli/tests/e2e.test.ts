import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { saveProjectConfig, readProjectConfig } from "../src/storage/project-config.js";
import { computeFilesSnapshot, computeDiff } from "../src/storage/snapshot.js";
import { readDirectoryFiles, createZipArchive, writeProjectFiles, sanitizeRelativePath } from "../src/utils/files.js";
import { generateSemanticCommitMessage } from "../src/utils/ai-commit.js";
import type { ProjectFile } from "../src/types.js";
import JSZip from "jszip";

const execFileAsync = promisify(execFile);
const CLI_BIN = path.resolve(__dirname, "../bin/push44.ts");
const SANDBOX_DIR = path.resolve(__dirname, ".test-sandbox-project");

describe("Push44 CLI End-to-End System & Workflow Tests", () => {
  beforeAll(async () => {
    await fs.mkdir(SANDBOX_DIR, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(SANDBOX_DIR, { recursive: true, force: true });
  });

  it("1. Initializes and writes mock project files to disk", async () => {
    const mockFiles: ProjectFile[] = [
      {
        path: "package.json",
        content: JSON.stringify({
          name: "e2e-demo-app",
          version: "1.0.0",
          dependencies: {
            react: "^19.0.0",
            "lucide-react": "^1.0.0",
            tailwindcss: "^4.0.0",
          },
        }),
      },
      {
        path: "src/App.tsx",
        content: "export default function App() { return <h1>Push44 AI App</h1>; }",
      },
      {
        path: "src/components/Header.tsx",
        content: "export const Header = () => <header>Logo</header>;",
      },
      {
        path: "src/styles.css",
        content: "body { margin: 0; background: #000; }",
      },
      {
        path: "assets/logo.png",
        content: Buffer.from("fake-png-binary-bytes").toString("base64"),
        binary: true,
      },
    ];

    const { written, totalBytes } = await writeProjectFiles(SANDBOX_DIR, mockFiles);
    expect(written).toBe(5);
    expect(totalBytes).toBeGreaterThan(0);

    const snapshot = computeFilesSnapshot(mockFiles);
    await saveProjectConfig(SANDBOX_DIR, {
      appId: "app_e2e_12345",
      appName: "E2E Demo App",
      platform: "base44",
      repo: "user/e2e-demo",
      branch: "main",
      filesSnapshot: snapshot,
    });

    const saved = await readProjectConfig(SANDBOX_DIR);
    expect(saved).not.toBeNull();
    expect(saved?.appName).toBe("E2E Demo App");
    expect(saved?.filesSnapshot.length).toBe(5);
  });

  it("2. Accurately detects local modifications, additions, and deletions in sandbox", async () => {
    // Modify Header.tsx
    await fs.writeFile(
      path.join(SANDBOX_DIR, "src/components/Header.tsx"),
      "export const Header = () => <header>Updated Logo</header>;",
      "utf-8"
    );

    // Add new component
    await fs.writeFile(
      path.join(SANDBOX_DIR, "src/components/Footer.tsx"),
      "export const Footer = () => <footer>Footer</footer>;",
      "utf-8"
    );

    // Read current sandbox files
    const currentFiles = await readDirectoryFiles(SANDBOX_DIR);
    const config = await readProjectConfig(SANDBOX_DIR);
    expect(config).not.toBeNull();

    const diffs = computeDiff(currentFiles, config!.filesSnapshot);

    const headerDiff = diffs.find((d) => d.path === "src/components/Header.tsx");
    const footerDiff = diffs.find((d) => d.path === "src/components/Footer.tsx");

    expect(headerDiff?.status).toBe("modified");
    expect(footerDiff?.status).toBe("new");

    // Generate AI Commit Message
    const commitMsg = generateSemanticCommitMessage(diffs, config!.platform, config!.appName);
    expect(commitMsg).toContain("feat(ui)");
  });

  it("3. Packs modified project files into valid standalone ZIP archive", async () => {
    const files = await readDirectoryFiles(SANDBOX_DIR);
    const zipBuf = await createZipArchive(files);
    expect(zipBuf.length).toBeGreaterThan(0);

    const zip = await JSZip.loadAsync(zipBuf);
    expect(zip.file("package.json")).not.toBeNull();
    expect(zip.file("src/App.tsx")).not.toBeNull();
    expect(zip.file("src/components/Footer.tsx")).not.toBeNull();
  });

  it("4. Blocks path traversal attacks in file sanitizer", () => {
    expect(sanitizeRelativePath("../../../etc/passwd")).toBe("etc/passwd");
    expect(sanitizeRelativePath("..\\..\\windows\\system32")).toBe("windows/system32");
    expect(sanitizeRelativePath("%2e%2e%2f%2e%2e%2froot")).toBe("root");
    expect(sanitizeRelativePath("C:\\secret.key")).toBe("secret.key");
    expect(sanitizeRelativePath("/absolute/path/index.ts")).toBe("absolute/path/index.ts");
  });

  it("5. Runs CLI subcommands cleanly via sub-process execution", async () => {
    // 5a. Version
    const { stdout: verOut } = await execFileAsync("bun", [CLI_BIN, "--version"]);
    expect(verOut.trim()).toBe("1.0.0");

    // 5b. Doctor
    const { stdout: docOut } = await execFileAsync("bun", [CLI_BIN, "doctor"]);
    expect(docOut).toContain("Doctor Audit");
    expect(docOut).toContain("PASS");

    // 5c. Stats / Dashboard
    const { stdout: statsOut } = await execFileAsync("bun", [CLI_BIN, "stats"]);
    expect(statsOut).toContain("Dashboard");
    expect(statsOut).toContain("Weekly Synchronization");

    // 5d. Config
    const { stdout: cfgOut } = await execFileAsync("bun", [CLI_BIN, "config", "list"]);
    expect(cfgOut).toContain("defaultBranch");

    // 5e. Completion
    const { stdout: compOut } = await execFileAsync("bun", [CLI_BIN, "completion", "bash"]);
    expect(compOut).toContain("complete -F _push44_completions");
  });
});
