import pc from "picocolors";
import { getCredentials, saveCredentials } from "../auth/store.js";
import { createTable } from "../ui/table.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

export async function configCommand(
  action = "list",
  key?: string,
  value?: string
): Promise<void> {
  const creds = await getCredentials();

  if (action === "list" || action === "show") {
    const table = createTable({ head: ["Setting Key", "Current Value"] });
    table.push(["defaultBranch", creds.defaultBranch || pc.dim("main (default)")]);
    table.push(["defaultRepo", creds.defaultRepo || pc.dim("None")]);
    table.push(["defaultOwner", creds.defaultOwner || pc.dim("None")]);
    table.push(["githubUsername", creds.githubUsername || pc.dim("None")]);
    table.push(["rocketCompanyId", creds.rocketCompanyId || pc.dim("None")]);

    console.log(`\n${pc.bold("✦ Push44 Global Configuration")}\n`);
    console.log(table.toString());
    console.log();
    return;
  }

  if (action === "get" && key) {
    const val = (creds as any)[key];
    console.log(val !== undefined ? String(val) : pc.dim("Not set"));
    return;
  }

  if (action === "set" && key && value !== undefined) {
    await saveCredentials({ [key]: value });
    logger.success(`Configuration updated: ${pc.bold(key)} = ${pc.cyan(value)}`);
    return;
  }

  throw new Push44Error("Usage: `push44 config list` or `push44 config set <key> <value>`");
}
