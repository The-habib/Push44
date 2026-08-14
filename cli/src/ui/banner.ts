import pc from "picocolors";
import { applyGradient } from "./gradient.js";
import { getTerminalWidth, isNarrowTerminal } from "./responsive.js";
import type { StoredCredentials, ProjectConfig } from "../types.js";

export function renderClaudeBanner(creds?: StoredCredentials, project?: ProjectConfig | null): string {
  const termWidth = getTerminalWidth();
  const width = Math.min(termWidth, 68);

  const brandText = applyGradient("✦ Push44 · AI Vibe-Coding Hub");
  const versionText = pc.dim("v1.0.0");

  // Connected chips
  const chips: string[] = [];
  if (creds?.githubToken) chips.push(pc.green("GitHub ✓"));
  if (creds?.base44Token) chips.push(pc.cyan("Base44 ●"));
  if (creds?.rocketToken) chips.push(pc.red("Rocket ●"));
  if (creds?.flootToken) chips.push(pc.blue("Floot ●"));
  if (creds?.ziteSession) chips.push(pc.magenta("Zite ●"));
  if (creds?.boltToken) chips.push(pc.yellow("Bolt ●"));
  if (creds?.lovableToken) chips.push(pc.green("Lovable ●"));

  const chipStr = chips.length > 0 ? chips.join(pc.dim(" · ")) : pc.dim("No accounts connected");

  let projectStr = pc.dim("No active project");
  if (project) {
    projectStr = `${pc.bold(project.appName)} ${pc.dim(`(${project.platform})`)} ${pc.dim("→")} ${pc.cyan(project.repo || "local")} ${pc.magenta(`[${project.branch || "main"}]`)}`;
  }

  if (isNarrowTerminal()) {
    // Compact mobile layout for narrow screens
    return [
      "",
      `  ${brandText} ${versionText}`,
      `  ${pc.dim("Universal CLI for AI App Builders")}`,
      `  ${pc.dim("─".repeat(Math.min(termWidth - 4, 38)))}`,
      `  ${pc.bold("Connected:")} ${chipStr}`,
      `  ${pc.bold("Project:")}   ${projectStr}`,
      "",
    ].join("\n");
  }

  // Wide desktop layout
  const top = pc.dim("╭" + "─".repeat(width - 2) + "╮");
  const bottom = pc.dim("╰" + "─".repeat(width - 2) + "╯");
  const border = pc.dim("│");

  return [
    top,
    `${border}  ${brandText} ${versionText}`.padEnd(width + 18) + ` ${border}`,
    `${border}  ${pc.dim("Universal Command-Line Interface for AI Vibe-Coding Platforms")}`.padEnd(width + 10) + ` ${border}`,
    `${border} ${" ".repeat(width - 4)} ${border}`,
    `${border}  ${pc.bold("Connected:")} ${chipStr}`.padEnd(width + 16) + ` ${border}`,
    `${border}  ${pc.bold("Context:")}   ${projectStr}`.padEnd(width + 16) + ` ${border}`,
    bottom,
  ].join("\n");
}
