import { promises as fs } from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getAllAdapters, getPlatformAdapter } from "../platforms/index.js";
import { createZipArchive, formatBytes } from "../utils/files.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import type { RemoteApp } from "../types.js";

export async function backupCommand(
  options: {
    all?: boolean;
    platform?: string;
    out?: string;
  } = {}
): Promise<void> {
  const creds = await getCredentials();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupBaseDir = path.resolve(process.cwd(), options.out || `push44-backups-${timestamp}`);

  await fs.mkdir(backupBaseDir, { recursive: true });

  const targetAdapters = options.platform
    ? [getPlatformAdapter(options.platform)]
    : getAllAdapters();

  const allApps: { adapter: any; app: RemoteApp }[] = [];

  await withSpinner("Finding all connected projects for backup...", async () => {
    for (const adapter of targetAdapters) {
      try {
        const apps = await adapter.listApps(creds);
        for (const app of apps) {
          allApps.push({ adapter, app });
        }
      } catch {}
    }
  });

  if (allApps.length === 0) {
    logger.warn("No projects found to backup.");
    return;
  }

  logger.info(`Backing up ${allApps.length} projects to ${pc.bold(backupBaseDir)}...`);

  let totalSize = 0;
  let successCount = 0;

  for (let i = 0; i < allApps.length; i++) {
    const { adapter, app } = allApps[i];
    const safeName = `${adapter.platform}_${app.name.replace(/[^a-zA-Z0-9_\-]/g, "_")}_${app.id.slice(0, 8)}`;
    const zipPath = path.join(backupBaseDir, `${safeName}.zip`);

    try {
      await withSpinner(`[${i + 1}/${allApps.length}] Exporting ${app.name} (${adapter.displayName})...`, async () => {
        const exported = await adapter.exportProject(app.id, creds);
        const zipBuf = await createZipArchive(exported.files);
        await fs.writeFile(zipPath, zipBuf);
        totalSize += zipBuf.length;
        successCount++;
      });
    } catch (err: any) {
      logger.error(`Failed to backup ${app.name}: ${err.message}`);
    }
  }

  console.log(
    pc.green(
      `\n✓ Backup complete! Successfully exported ${successCount}/${allApps.length} projects (${formatBytes(totalSize)}) to:`
    )
  );
  console.log(pc.cyan(`  ${backupBaseDir}\n`));
}
