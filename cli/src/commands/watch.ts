import * as fs from "node:fs";
import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { syncCommand } from "./sync.js";
import { logger } from "../ui/logger.js";
import { symbols } from "../ui/theme.js";

export async function watchCommand(options: { autoSync?: boolean; interval?: number } = {}): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    logger.error("No .push44.json config found in current directory.");
    return;
  }

  const { config, projectRoot } = found;
  console.log(
    `\n${symbols.pulse} ${pc.bold("Push44 Watcher active")} on ${pc.cyan(config.appName)} (${pc.dim(projectRoot)})`
  );
  console.log(pc.dim("  Watching for file modifications. Press Ctrl+C to exit.\n"));

  let debounceTimer: NodeJS.Timeout | null = null;

  const watcher = fs.watch(projectRoot, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.includes(".git") || filename.includes("node_modules") || filename.includes(".push44")) {
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      logger.info(`Change detected: ${pc.cyan(filename)} (${eventType})`);
      if (options.autoSync) {
        try {
          await syncCommand({ yes: true });
        } catch (err: any) {
          logger.error(`Auto-sync failed: ${err.message}`);
        }
      }
    }, options.interval || 1500);
  });

  process.on("SIGINT", () => {
    watcher.close();
    console.log(pc.dim("\nWatcher stopped."));
    process.exit(0);
  });
}
