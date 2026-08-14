import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import pc from "picocolors";
import { getCredentials, saveCredentials } from "../auth/store.js";
import { getAllAdapters } from "../platforms/index.js";
import { isGitInstalled, getGitVersion } from "../git/operations.js";
import { auditGitRepository } from "../git/intelligence.js";
import { getGitHubUser } from "../github/client.js";
import { createTable } from "../ui/table.js";
import { symbols } from "../ui/theme.js";
import { logger } from "../ui/logger.js";
import type { DoctorCheck } from "../types.js";

export async function doctorCommand(options: { fix?: boolean } = {}): Promise<void> {
  console.log(`\n${pc.bold("Running Push44 Health & Environment Doctor Audit...")}\n`);

  const checks: DoctorCheck[] = [];
  const creds = await getCredentials();

  // 1. Runtime checks
  checks.push({
    category: "environment",
    name: "Node.js Runtime",
    status: "pass",
    message: `Node.js ${process.version} (${os.platform()} ${os.arch()})`,
  });

  try {
    const isBun = typeof (globalThis as any).Bun !== "undefined";
    checks.push({
      category: "environment",
      name: "Bun Runtime",
      status: isBun ? "pass" : "pass",
      message: isBun ? `Bun ${(globalThis as any).Bun.version}` : "Node.js host execution",
    });
  } catch {}

  // 2. Git checks
  const gitInstalled = await isGitInstalled();
  if (gitInstalled) {
    const version = await getGitVersion();
    checks.push({
      category: "git",
      name: "Git CLI Tool",
      status: "pass",
      message: version,
    });

    const repoAudit = await auditGitRepository();
    if (repoAudit.isRepo) {
      if (repoAudit.issues.length === 0) {
        checks.push({
          category: "git",
          name: "Current Repository",
          status: "pass",
          message: `Clean working tree on branch "${repoAudit.branch}"`,
        });
      } else {
        checks.push({
          category: "git",
          name: "Current Repository",
          status: "warn",
          message: repoAudit.issues.join("; "),
          fixDescription: repoAudit.suggestions.join(" "),
        });
      }
    }
  } else {
    checks.push({
      category: "git",
      name: "Git CLI Tool",
      status: "fail",
      message: "Git is not installed or not available in PATH.",
      fixDescription: "Install Git via `sudo apt install git` or package manager.",
    });
  }

  // 3. Storage & Permissions
  const configDir = path.join(os.homedir(), ".push44");
  try {
    await fs.mkdir(configDir, { recursive: true });
    const testFile = path.join(configDir, ".write-test");
    await fs.writeFile(testFile, "test", "utf-8");
    await fs.unlink(testFile);
    checks.push({
      category: "permissions",
      name: "Config Storage Permissions",
      status: "pass",
      message: `Writable directory at ${configDir}`,
    });
  } catch (err: any) {
    checks.push({
      category: "permissions",
      name: "Config Storage Permissions",
      status: "fail",
      message: `Cannot write to ${configDir}: ${err.message}`,
      fixDescription: `Check permissions for ~/.push44`,
    });
  }

  // 4. GitHub Credentials
  if (creds.githubToken) {
    try {
      const u = await getGitHubUser(creds.githubToken);
      checks.push({
        category: "credentials",
        name: "GitHub API Authentication",
        status: "pass",
        message: `Authenticated as @${u.login} (${u.name || u.email})`,
      });
    } catch {
      checks.push({
        category: "credentials",
        name: "GitHub API Authentication",
        status: "fail",
        message: "GitHub token is invalid or expired.",
        fixDescription: "Run `push44 github login` to set a valid token.",
      });
    }
  } else {
    checks.push({
      category: "credentials",
      name: "GitHub API Authentication",
      status: "warn",
      message: "No GitHub token configured.",
      fixDescription: "Run `push44 github login` to enable pushing to GitHub.",
    });
  }

  // 5. Platforms
  const adapters = getAllAdapters();
  for (const adapter of adapters) {
    let tokenPresent = false;
    if (adapter.platform === "base44") tokenPresent = Boolean(creds.base44Token);
    else if (adapter.platform === "rocket") tokenPresent = Boolean(creds.rocketToken);
    else if (adapter.platform === "floot") tokenPresent = Boolean(creds.flootToken);
    else if (adapter.platform === "zite") tokenPresent = Boolean(creds.ziteSession);
    else if (adapter.platform === "bolt") tokenPresent = Boolean(creds.boltToken);
    else if (adapter.platform === "lovable") tokenPresent = Boolean(creds.lovableToken);

    if (tokenPresent) {
      const validation = await adapter.validateSession(creds);
      if (validation.valid) {
        checks.push({
          category: "connectivity",
          name: `${adapter.displayName} Connection`,
          status: "pass",
          message: `Active session for ${validation.email || "User"}`,
        });
      } else {
        checks.push({
          category: "connectivity",
          name: `${adapter.displayName} Connection`,
          status: "fail",
          message: validation.error || "Session expired.",
          fixDescription: `Run \`push44 login ${adapter.platform}\` to refresh.`,
        });
      }
    }
  }

  // Render Table
  const table = createTable({
    head: ["Category", "Component", "Status", "Diagnostic Details"],
  });

  for (const c of checks) {
    let statusIcon = `${symbols.tick} ${pc.green("PASS")}`;
    if (c.status === "warn") statusIcon = `${symbols.warning} ${pc.yellow("WARN")}`;
    if (c.status === "fail") statusIcon = `${symbols.cross} ${pc.red("FAIL")}`;

    table.push([
      pc.dim(c.category),
      pc.bold(c.name),
      statusIcon,
      c.message + (c.fixDescription ? pc.dim(` [Fix: ${c.fixDescription}]`) : ""),
    ]);
  }

  console.log(table.toString());
  console.log();

  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  if (failCount === 0 && warnCount === 0) {
    logger.success("All doctor checks passed! Push44 CLI is healthy and ready.");
  } else {
    logger.info(`Summary: ${checks.length - failCount - warnCount} passed, ${warnCount} warnings, ${failCount} failures.`);
  }
}
