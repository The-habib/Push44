import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter, getAllAdapters } from "../platforms/index.js";
import { createTable } from "../ui/table.js";
import { withSpinner } from "../ui/spinner.js";
import { askSelect } from "../ui/prompts.js";
import { cloneCommand } from "./clone.js";
import type { RemoteApp } from "../types.js";

export async function appsCommand(
  platformArg?: string,
  options: { interactive?: boolean; json?: boolean } = {}
): Promise<void> {
  const creds = await getCredentials();
  const allApps: RemoteApp[] = [];

  const targetAdapters = platformArg ? [getPlatformAdapter(platformArg)] : getAllAdapters();

  await withSpinner("Scanning platforms for projects...", async () => {
    for (const adapter of targetAdapters) {
      try {
        const apps = await adapter.listApps(creds);
        allApps.push(...apps);
      } catch {}
    }
  });

  if (options.json) {
    console.log(JSON.stringify(allApps, null, 2));
    return;
  }

  if (allApps.length === 0) {
    console.log(
      pc.yellow(
        `\nNo projects found across connected platforms. Run \`push44 login\` to authenticate.`
      )
    );
    return;
  }

  const table = createTable({
    head: ["Project Name", "Platform", "ID", "Last Updated"],
  });

  for (const app of allApps) {
    const updated = app.updated_at ? new Date(app.updated_at).toLocaleDateString() : "—";
    table.push([
      pc.bold(app.name),
      pc.cyan(app.platform),
      pc.dim(app.id.slice(0, 18) + (app.id.length > 18 ? "…" : "")),
      updated,
    ]);
  }

  console.log(`\n${pc.bold(`Discovered Projects (${allApps.length})`)}\n`);
  console.log(table.toString());
  console.log();

  if (options.interactive) {
    const selectedAppId = await askSelect(
      "Choose a project to clone locally:",
      allApps.map((a) => ({
        title: `${a.name} (${a.platform})`,
        value: `${a.platform}:${a.id}`,
        description: `ID: ${a.id}`,
      }))
    );

    if (selectedAppId) {
      const [platform, id] = selectedAppId.split(":");
      await cloneCommand(id, { platform });
    }
  }
}
