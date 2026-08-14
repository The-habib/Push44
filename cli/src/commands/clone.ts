import * as path from "node:path";
import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getAllAdapters, getPlatformAdapter } from "../platforms/index.js";
import { writeProjectFiles, formatBytes } from "../utils/files.js";
import { saveProjectConfig } from "../storage/project-config.js";
import { computeFilesSnapshot } from "../storage/snapshot.js";
import { initGitRepo, stageAllFiles, commitChanges, isGitInstalled } from "../git/operations.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";
import type { ExportedProject } from "../types.js";

export async function cloneCommand(
  appIdentifier: string,
  options: {
    platform?: string;
    out?: string;
    git?: boolean;
    repo?: string;
    branch?: string;
  } = {}
): Promise<void> {
  const creds = await getCredentials();

  let resolvedProject: ExportedProject | null = null;

  if (options.platform) {
    const adapter = getPlatformAdapter(options.platform);
    resolvedProject = await withSpinner(
      `Exporting ${pc.bold(appIdentifier)} from ${adapter.displayName}...`,
      async () => adapter.exportProject(appIdentifier, creds)
    );
  } else {
    // Try matching across all connected platforms
    const adapters = getAllAdapters();
    for (const adapter of adapters) {
      try {
        const app = await adapter.getApp(appIdentifier, creds);
        if (app) {
          resolvedProject = await withSpinner(
            `Exporting ${pc.bold(app.name)} from ${adapter.displayName}...`,
            async () => adapter.exportProject(app.id, creds)
          );
          break;
        }
      } catch {}
    }

    // Direct platform attempt fallback
    if (!resolvedProject) {
      for (const adapter of adapters) {
        try {
          resolvedProject = await withSpinner(
            `Probing ${adapter.displayName}...`,
            async () => adapter.exportProject(appIdentifier, creds)
          );
          if (resolvedProject && resolvedProject.files.length > 0) break;
        } catch {}
      }
    }
  }

  if (!resolvedProject) {
    throw new Push44Error({
      message: `Could not find project "${appIdentifier}".`,
      suggestion:
        "Specify `--platform <base44|rocket|floot|zite|bolt|lovable>` or run `push44 apps` to see available IDs.",
    });
  }

  const safeDirName = (options.out || resolvedProject.appName || resolvedProject.appId)
    .replace(/[^a-zA-Z0-9_\-]/g, "-")
    .toLowerCase();
  const targetDir = path.resolve(process.cwd(), safeDirName);

  logger.info(`Reconstructing project in ${pc.bold(targetDir)}...`);
  const { written, totalBytes } = await writeProjectFiles(targetDir, resolvedProject.files);

  // Compute snapshot & save config
  const snapshot = computeFilesSnapshot(resolvedProject.files);
  await saveProjectConfig(targetDir, {
    version: "1.0",
    appId: resolvedProject.appId,
    appName: resolvedProject.appName,
    platform: resolvedProject.platform,
    repo: options.repo,
    branch: options.branch || "main",
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
    filesSnapshot: snapshot,
  });

  // Initialize Git repository
  if (options.git !== false && (await isGitInstalled())) {
    try {
      await initGitRepo(targetDir, options.branch || "main");
      await stageAllFiles(targetDir);
      await commitChanges(
        `chore: initial export of ${resolvedProject.appName} from ${resolvedProject.platform}`,
        targetDir,
        creds.githubName && creds.githubEmail
          ? { name: creds.githubName, email: creds.githubEmail }
          : undefined
      );
    } catch {}
  }

  console.log(
    pc.green(
      `\n✓ Successfully cloned ${pc.bold(resolvedProject.appName)} (${written} files, ${formatBytes(totalBytes)})`
    )
  );
  console.log(pc.dim(`  Location: ${targetDir}\n`));
  console.log(pc.bold(pc.yellow(`✦ What to do next:`)));
  console.log(`  1. ${pc.cyan(`cd ${safeDirName}`)}`);
  console.log(`  2. Open in Cursor / VS Code / your editor and edit your code!`);
  console.log(`  3. Run ${pc.bold(pc.cyan("push44 sync"))} anytime to auto-save your changes to GitHub!\n`);
}
