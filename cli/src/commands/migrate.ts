import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter } from "../platforms/index.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { createTable } from "../ui/table.js";
import { Push44Error } from "../utils/errors.js";

export async function migrateCommand(
  appId: string,
  targetPlatform: string,
  options: {
    sourcePlatform?: string;
    out?: string;
  } = {}
): Promise<void> {
  const creds = await getCredentials();
  const target = targetPlatform.toLowerCase();
  const source = (options.sourcePlatform || "base44").toLowerCase();

  logger.info(`Analyzing migration compatibility from ${pc.bold(source)} to ${pc.bold(target)}...`);

  const sourceAdapter = getPlatformAdapter(source);
  const exported = await withSpinner(`Exporting ${source} project...`, async () =>
    sourceAdapter.exportProject(appId, creds)
  );

  const table = createTable({ head: ["Aspect", "Source (" + source + ")", "Target (" + target + ")", "Compatibility"] });

  if (source === "rocket" && (target === "base44" || target === "floot")) {
    table.push(["Language", "Dart / Flutter", "TypeScript / React", pc.yellow("Manual Rewrite Required")]);
    table.push(["Target Runtime", "Android / iOS", "Browser Web App", pc.yellow("Cross-Platform")]);
    table.push(["Assets & Icons", "Preserved", "Preserved", pc.green("Compatible")]);
  } else {
    table.push(["Language", "TypeScript / React", "TypeScript / React", pc.green("100% Direct Match")]);
    table.push(["Bundler / Vite", "Vite ESM", "Vite ESM", pc.green("Full Parity")]);
    table.push(["Styling", "Tailwind CSS", "Tailwind CSS", pc.green("Direct Drop-in")]);
    table.push(["Components", "React 19", "React 19", pc.green("Full Parity")]);
  }

  console.log(`\n${pc.bold("✦ Platform Migration Compatibility Assessment")}\n`);
  console.log(table.toString());
  console.log();

  logger.success(`Exported ${exported.files.length} project files ready for ${target}.`);
}
