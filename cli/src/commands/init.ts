import * as path from "node:path";
import pc from "picocolors";
import { saveProjectConfig, readProjectConfig } from "../storage/project-config.js";
import { computeFilesSnapshot } from "../storage/snapshot.js";
import { readDirectoryFiles } from "../utils/files.js";
import { initGitRepo, isGitInstalled, stageAllFiles, commitChanges } from "../git/operations.js";
import { askSelect, askText, askConfirm } from "../ui/prompts.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

export async function initCommand(): Promise<void> {
  const projectDir = process.cwd();
  const existing = await readProjectConfig(projectDir);

  if (existing) {
    logger.info(`Project is already initialized as ${pc.bold(existing.appName)} (${existing.platform}).`);
    return;
  }

  console.log(`\n${pc.bold(pc.yellow("✦ Push44 Project Quickstart Initializer"))}\n`);
  console.log(pc.dim("Link this directory to your AI platform builder and GitHub repository.\n"));

  const appName = await askText("Project name:", path.basename(projectDir));
  const platform = await askSelect("Select source AI platform:", [
    { title: "Base44", value: "base44" },
    { title: "Rocket.new (Mobile/Flutter)", value: "rocket" },
    { title: "Floot", value: "floot" },
    { title: "Zite / Fillout", value: "zite" },
    { title: "Bolt.new", value: "bolt" },
    { title: "Lovable.dev", value: "lovable" },
  ]);

  const appId = await askText("Platform App ID (optional, press Enter to generate):", `app_${Date.now().toString(36)}`);
  const repo = await askText("GitHub Repository (e.g. username/my-app, optional):");

  const files = await readDirectoryFiles(projectDir);
  const snapshot = computeFilesSnapshot(files);

  await saveProjectConfig(projectDir, {
    version: "1.0",
    appId,
    appName,
    platform: platform as any,
    repo: repo || undefined,
    branch: "main",
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
    filesSnapshot: snapshot,
  });

  if (await isGitInstalled()) {
    try {
      await initGitRepo(projectDir, "main");
      await stageAllFiles(projectDir);
      await commitChanges(`chore: initialize Push44 project ${appName}`);
    } catch {}
  }

  logger.success(`Initialized ${pc.bold(appName)} in current directory!`);
  console.log(pc.dim(`  Config saved to: ${path.join(projectDir, ".push44.json")}`));
  console.log(pc.cyan(`\nRun \`push44 sync\` anytime to save your changes to GitHub!\n`));
}
