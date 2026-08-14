import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getAllAdapters, getPlatformAdapter } from "../platforms/index.js";
import { withSpinner } from "../ui/spinner.js";
import { createTable } from "../ui/table.js";
import { formatBytes } from "../utils/files.js";
import { Push44Error } from "../utils/errors.js";
import type { ExportedProject } from "../types.js";

export async function compareCommand(
  app1Identifier: string,
  app2Identifier: string,
  options: {
    platform1?: string;
    platform2?: string;
  } = {}
): Promise<void> {
  const creds = await getCredentials();

  async function resolveApp(id: string, platformHint?: string): Promise<ExportedProject> {
    if (platformHint) {
      const adapter = getPlatformAdapter(platformHint);
      return adapter.exportProject(id, creds);
    }
    const adapters = getAllAdapters();
    for (const adapter of adapters) {
      try {
        const app = await adapter.getApp(id, creds);
        if (app) {
          return await adapter.exportProject(app.id, creds);
        }
      } catch {}
    }
    throw new Push44Error(`Could not find project "${id}". Specify --platform1 / --platform2.`);
  }

  const [p1, p2] = await withSpinner("Exporting and comparing projects...", async () => {
    return Promise.all([
      resolveApp(app1Identifier, options.platform1),
      resolveApp(app2Identifier, options.platform2),
    ]);
  });

  const p1Paths = new Set(p1.files.map((f) => f.path));
  const p2Paths = new Set(p2.files.map((f) => f.path));

  const common = Array.from(p1Paths).filter((p) => p2Paths.has(p));
  const onlyP1 = Array.from(p1Paths).filter((p) => !p2Paths.has(p));
  const onlyP2 = Array.from(p2Paths).filter((p) => !p1Paths.has(p));

  const p1Bytes = p1.files.reduce((s, f) => s + (f.sizeBytes || f.content.length), 0);
  const p2Bytes = p2.files.reduce((s, f) => s + (f.sizeBytes || f.content.length), 0);

  console.log(`\n${pc.bold("✦ Project Architectural Comparison")}\n`);

  const table = createTable({
    head: ["Metric", `${p1.appName} (${p1.platform})`, `${p2.appName} (${p2.platform})`],
  });

  table.push(["Total Files", String(p1.files.length), String(p2.files.length)]);
  table.push(["Total Size", formatBytes(p1Bytes), formatBytes(p2Bytes)]);
  table.push(["Shared Files", `${common.length} files`, `${common.length} files`]);
  table.push(["Unique Files", `${onlyP1.length} files`, `${onlyP2.length} files`]);

  console.log(table.toString());
  console.log();

  if (onlyP1.length > 0 || onlyP2.length > 0) {
    console.log(pc.bold("File Divergence Summary:"));
    if (onlyP1.length > 0) {
      console.log(pc.cyan(`  Only in ${p1.appName} (${p1.platform}):`));
      for (const f of onlyP1.slice(0, 8)) console.log(`    ${pc.dim("•")} ${f}`);
      if (onlyP1.length > 8) console.log(`    ${pc.dim(`... and ${onlyP1.length - 8} more`)}`);
    }
    if (onlyP2.length > 0) {
      console.log(pc.magenta(`  Only in ${p2.appName} (${p2.platform}):`));
      for (const f of onlyP2.slice(0, 8)) console.log(`    ${pc.dim("•")} ${f}`);
      if (onlyP2.length > 8) console.log(`    ${pc.dim(`... and ${onlyP2.length - 8} more`)}`);
    }
    console.log();
  }
}
