import * as path from "node:path";
import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter, getAllAdapters } from "../platforms/index.js";
import { writeProjectFiles, formatBytes } from "../utils/files.js";
import { saveProjectConfig } from "../storage/project-config.js";
import { computeFilesSnapshot } from "../storage/snapshot.js";
import { initGitRepo, isGitInstalled, stageAllFiles, commitChanges } from "../git/operations.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { createProgressBar } from "../ui/progress.js";
import { askSelect } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";
import type { ExportedProject, SupportedPlatform } from "../types.js";

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

  let targetPlatform = options.platform;
  let resolvedProject: ExportedProject | null = null;

  if (targetPlatform) {
    const adapter = getPlatformAdapter(targetPlatform);
    const progress = createProgressBar("Exporting");
    let startedProgress = false;

    resolvedProject = await withSpinner(
      `Fetching project from ${adapter.displayName}...`,
      async (spinner) => {
        return adapter.exportProject(appIdentifier, creds, {
          onStatus: (msg) => {
            spinner.text = pc.cyan(msg);
          },
          onProgress: (current, total, p) => {
            if (!startedProgress) {
              spinner.stop();
              progress.start(total, 0);
              startedProgress = true;
            }
            progress.update(current);
          },
        });
      }
    );
    if (startedProgress) progress.stop();
  } else {
    // Probe all platforms to find matching app
    const adapters = getAllAdapters();
    for (const adapter of adapters) {
      try {
        const app = await adapter.getApp(appIdentifier, creds);
        if (app) {
          targetPlatform = adapter.platform;
          resolvedProject = await withSpinner(
            `Found on ${adapter.displayName}. Exporting files...`,
            async () => adapter.exportProject(app.id, creds)
          );
          break;
        }
      } catch {}
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
      `\n✓ Cloned ${pc.bold(resolvedProject.appName)} (${written} files, ${formatBytes(totalBytes)})`
    )
  );
  console.log(pc.dim(`  Directory: ${targetDir}\n`));
  console.log(pc.cyan(`Next steps:`));
  console.log(pc.dim(`  cd ${safeDirName}`));
  console.log(pc.dim(`  push44 sync       # sync changes back to GitHub\n`));
}
