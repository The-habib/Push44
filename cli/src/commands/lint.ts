import { promises as fs } from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { readDirectoryFiles } from "../utils/files.js";
import { createTable } from "../ui/table.js";
import { symbols } from "../ui/theme.js";
import { Push44Error } from "../utils/errors.js";

const HARDCODED_KEY_PATTERNS = [
  { name: "OpenAI API Key", regex: /sk-[A-Za-z0-9]{32,}/ },
  { name: "GitHub Personal Access Token", regex: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Stripe Secret Key", regex: /sk_live_[0-9a-zA-Z]{24}/ },
];

export async function lintCommand(): Promise<void> {
  const found = await findProjectConfig();
  if (!found) throw new Push44Error("No .push44.json config found in current directory.");

  const { config, projectRoot } = found;
  const files = await readDirectoryFiles(projectRoot);

  console.log(`\n${pc.bold("✦ Push44 Project Health & Security Audit")}\n`);

  interface LintIssue {
    rule: string;
    severity: "critical" | "warning" | "info";
    message: string;
    fix: string;
  }

  const issues: LintIssue[] = [];

  // Check 1: Hardcoded Secrets
  for (const file of files) {
    if (file.binary || file.path.includes(".env")) continue;
    for (const pattern of HARDCODED_KEY_PATTERNS) {
      if (pattern.regex.test(file.content)) {
        issues.push({
          rule: "no-hardcoded-secrets",
          severity: "critical",
          message: `Possible hardcoded ${pattern.name} in ${pc.cyan(file.path)}`,
          fix: "Move secret to .env.local and load via environment variables.",
        });
      }
    }
  }

  // Check 2: Missing .gitignore
  const hasGitignore = files.some((f) => f.path === ".gitignore");
  if (!hasGitignore) {
    issues.push({
      rule: "missing-gitignore",
      severity: "warning",
      message: "No .gitignore file found in project root.",
      fix: "Run `push44 ignore` to automatically generate a safe .gitignore.",
    });
  }

  // Check 3: Missing .env.example
  const hasEnv = files.some((f) => f.path.startsWith(".env"));
  const hasEnvExample = files.some((f) => f.path === ".env.example");
  if (hasEnv && !hasEnvExample) {
    issues.push({
      rule: "missing-env-example",
      severity: "info",
      message: "Found .env file without .env.example template.",
      fix: "Run `push44 env-sync` to generate a safe .env.example template.",
    });
  }

  // Check 4: Unpinned dependencies
  const pkgFile = files.find((f) => f.path === "package.json");
  if (pkgFile && !pkgFile.binary) {
    try {
      const pkg = JSON.parse(pkgFile.content);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      for (const [dep, ver] of Object.entries(deps)) {
        if (ver === "*" || ver === "latest") {
          issues.push({
            rule: "pinned-dependencies",
            severity: "warning",
            message: `Dependency "${dep}" uses unpinned wildcard version "${ver}"`,
            fix: "Specify an explicit semantic version (e.g. ^1.0.0).",
          });
        }
      }
    } catch {}
  }

  // Score calculation
  let score = 100;
  for (const iss of issues) {
    if (iss.severity === "critical") score -= 30;
    else if (iss.severity === "warning") score -= 10;
    else score -= 5;
  }
  score = Math.max(0, score);

  const scoreColor = score >= 85 ? pc.green : score >= 60 ? pc.yellow : pc.red;
  console.log(`  ${pc.bold("Project Health Score:")} ${scoreColor(pc.bold(`${score}/100`))}\n`);

  if (issues.length === 0) {
    console.log(pc.green(`  ${symbols.tick} Zero issues detected! Project structure and security are pristine.\n`));
    return;
  }

  const table = createTable({ head: ["Severity", "Audit Finding", "Recommended Remediation"] });

  for (const iss of issues) {
    let sevBadge = pc.red("CRITICAL");
    if (iss.severity === "warning") sevBadge = pc.yellow("WARNING");
    if (iss.severity === "info") sevBadge = pc.cyan("INFO");

    table.push([sevBadge, iss.message, pc.dim(iss.fix)]);
  }

  console.log(table.toString());
  console.log();
}
