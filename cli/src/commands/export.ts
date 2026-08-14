import { promises as fs } from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter, getAllAdapters } from "../platforms/index.js";
import { writeProjectFiles, createZipArchive, formatBytes } from "../utils/files.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";
import type { ExportedProject } from "../types.js";

export async function exportCommand(
  appIdentifier?: string,
  options: {
    platform?: string;
    zip?: boolean;
    out?: string;
  } = {}
): Promise<void> {
  const creds = await getCredentials();

  let targetPlatform = options.platform;
  let resolvedProject: ExportedProject | null = null;

  if (targetPlatform && appIdentifier) {
    const adapter = getPlatformAdapter(targetPlatform);
    resolvedProject = await withSpinner(
      `Exporting from ${adapter.displayName}...`,
      async () => adapter.exportProject(appIdentifier, creds)
    );
  } else if (appIdentifier) {
    const adapters = getAllAdapters();
    for (const adapter of adapters) {
      try {
        const app = await adapter.getApp(appIdentifier, creds);
        if (app) {
          resolvedProject = await withSpinner(
            `Exporting from ${adapter.displayName}...`,
            async () => adapter.exportProject(app.id, creds)
          );
          break;
        }
      } catch {}
    }
  }

  if (!resolvedProject) {
    throw new Push44Error({
      message: "Please specify an app ID or name to export.",
      suggestion: "Run `push44 apps` to see available projects.",
    });
  }

  const safeName = resolvedProject.appName.replace(/[^a-zA-Z0-9_\-]/g, "_").toLowerCase();

  if (options.zip) {
    const zipPath = path.resolve(process.cwd(), options.out || `${safeName}.zip`);
    const zipBuf = await withSpinner("Building ZIP archive...", async () =>
      createZipArchive(resolvedProject!.files)
    );
    await fs.writeFile(zipPath, zipBuf);
    logger.success(`Exported ZIP archive to ${pc.bold(zipPath)} (${formatBytes(zipBuf.length)})`);
  } else {
    const outDir = path.resolve(process.cwd(), options.out || safeName);
    const { written, totalBytes } = await writeProjectFiles(outDir, resolvedProject.files);
    logger.success(`Exported ${written} files to ${pc.bold(outDir)} (${formatBytes(totalBytes)})`);
  }
}
