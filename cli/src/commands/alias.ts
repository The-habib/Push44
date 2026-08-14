import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import pc from "picocolors";
import { createTable } from "../ui/table.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

const ALIASES_FILE = path.join(os.homedir(), ".push44", "aliases.json");

export async function getAliases(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(ALIASES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      s: "sync -y",
      d: "diff",
      i: "inspect",
      doc: "doctor --fix",
      b: "backup --all",
    };
  }
}

export async function aliasCommand(
  action = "list",
  aliasKey?: string,
  targetCmd?: string
): Promise<void> {
  const aliases = await getAliases();

  if (action === "list" || action === "show") {
    console.log(`\n${pc.bold("✦ Push44 Command Aliases & Macros")}\n`);
    const table = createTable({ head: ["Alias Shortcut", "Expanded Command"] });
    for (const [k, v] of Object.entries(aliases)) {
      table.push([pc.bold(pc.cyan(`push44 ${k}`)), `push44 ${v}`]);
    }
    console.log(table.toString());
    console.log();
    return;
  }

  if (action === "set" && aliasKey && targetCmd) {
    aliases[aliasKey] = targetCmd;
    await fs.mkdir(path.dirname(ALIASES_FILE), { recursive: true });
    await fs.writeFile(ALIASES_FILE, JSON.stringify(aliases, null, 2), "utf-8");
    logger.success(`Alias created: ${pc.bold(aliasKey)} -> ${pc.cyan(targetCmd)}`);
    return;
  }

  if (action === "remove" || action === "rm") {
    if (!aliasKey) throw new Push44Error("Please provide an alias name to remove.");
    delete aliases[aliasKey];
    await fs.writeFile(ALIASES_FILE, JSON.stringify(aliases, null, 2), "utf-8");
    logger.success(`Removed alias: ${pc.bold(aliasKey)}`);
    return;
  }

  throw new Push44Error("Usage: `push44 alias list` or `push44 alias set <name> <command>`");
}
