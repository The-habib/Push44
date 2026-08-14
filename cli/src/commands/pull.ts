import pc from "picocolors";
import { findProjectConfig, saveProjectConfig } from "../storage/project-config.js";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter } from "../platforms/index.js";
import { writeProjectFiles, formatBytes } from "../utils/files.js";
import { computeFilesSnapshot } from "../storage/snapshot.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

export async function pullCommand(): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error({
      message: "No .push44.json config found in this directory or any parent.",
      suggestion: "Run `push44 clone <app-id>` first to set up a project.",
    });
  }

  const { config, projectRoot } = found;
  const creds = await getCredentials();
  const adapter = getPlatformAdapter(config.platform);

  const exported = await withSpinner(
    `Pulling latest source from ${adapter.displayName}...`,
    async () => adapter.exportProject(config.appId, creds)
  );

  logger.info(`Updating files in ${pc.bold(projectRoot)}...`);
  const { written, totalBytes } = await writeProjectFiles(projectRoot, exported.files);

  const snapshot = computeFilesSnapshot(exported.files);
  await saveProjectConfig(projectRoot, {
    ...config,
    appName: exported.appName,
    lastSyncedAt: Date.now(),
    filesSnapshot: snapshot,
  });

  logger.success(`Pulled ${written} files (${formatBytes(totalBytes)}) from ${adapter.displayName}.`);
}
