import pc from "picocolors";
import type { StoredCredentials, ProjectConfig } from "../types.js";

export function renderClaudeBanner(creds?: StoredCredentials, project?: ProjectConfig | null): string {
  const width = 64;
  const top = pc.dim("╭" + "─".repeat(width - 2) + "╮");
  const bottom = pc.dim("╰" + "─".repeat(width - 2) + "╯");
  const border = pc.dim("│");

  const titleLine = `  ${pc.bold(pc.yellow("✦ Push44"))} ${pc.dim("v1.0.0")} ${" ".repeat(width - 32)} ${pc.dim("Anthropic / CLI")}`;

  // Connected chips
  const chips: string[] = [];
  if (creds?.githubToken) chips.push(pc.green("GitHub ✓"));
  if (creds?.base44Token) chips.push(pc.cyan("Base44 ●"));
  if (creds?.rocketToken) chips.push(pc.red("Rocket ●"));
  if (creds?.flootToken) chips.push(pc.blue("Floot ●"));
  if (creds?.ziteSession) chips.push(pc.magenta("Zite ●"));
  if (creds?.boltToken) chips.push(pc.yellow("Bolt ●"));
  if (creds?.lovableToken) chips.push(pc.green("Lovable ●"));

  const chipStr = chips.length > 0 ? chips.join(pc.dim(" · ")) : pc.dim("No accounts connected (`push44 login`)");

  let projectStr = pc.dim("No active project (`push44 clone <id>`)");
  if (project) {
    projectStr = `${pc.bold(project.appName)} ${pc.dim(`(${project.platform})`)} ${pc.dim("→")} ${pc.cyan(project.repo || "local")} ${pc.magenta(`[${project.branch || "main"}]`)}`;
  }

  const lines = [
    top,
    `${border} ${titleLine.padEnd(width - 3)} ${border}`,
    `${border} ${pc.dim("  Universal Command-Line Interface for AI Vibe-Coding").padEnd(width + 4)} ${border}`,
    `${border} ${" ".repeat(width - 4)} ${border}`,
    `${border}   ${pc.bold("Status:")}  ${chipStr}`.padEnd(width + 12) + ` ${border}`,
    `${border}   ${pc.bold("Context:")} ${projectStr}`.padEnd(width + 12) + ` ${border}`,
    bottom,
  ];

  return lines.join("\n");
}
