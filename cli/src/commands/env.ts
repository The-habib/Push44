import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import pc from "picocolors";
import { getCredentials, writeRawCredentials } from "../auth/store.js";
import { createTable } from "../ui/table.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

const PROFILES_DIR = path.join(os.homedir(), ".push44", "profiles");

async function ensureProfilesDir(): Promise<void> {
  await fs.mkdir(PROFILES_DIR, { recursive: true });
}

export async function envProfileCommand(
  action = "list",
  profileName?: string
): Promise<void> {
  await ensureProfilesDir();

  if (action === "list") {
    const entries = await fs.readdir(PROFILES_DIR).catch(() => []);
    const profiles = entries.filter((e) => e.endsWith(".json")).map((e) => e.replace(/\.json$/, ""));

    console.log(`\n${pc.bold("✦ Push44 Credential Profiles")}\n`);
    if (profiles.length === 0) {
      console.log(pc.dim("  No custom profiles saved yet. Save current profile with: `push44 env save <name>`\n"));
      return;
    }

    const table = createTable({ head: ["Profile Name", "Stored Credentials Path"] });
    for (const p of profiles) {
      table.push([pc.bold(pc.cyan(p)), path.join(PROFILES_DIR, `${p}.json`)]);
    }
    console.log(table.toString());
    console.log();
    return;
  }

  if (action === "save" || action === "add") {
    if (!profileName) throw new Push44Error("Please provide a profile name: `push44 env save <name>`");
    const current = await getCredentials();
    const filePath = path.join(PROFILES_DIR, `${profileName}.json`);
    await fs.writeFile(filePath, JSON.stringify(current, null, 2), "utf-8");
    logger.success(`Saved current credentials to profile: ${pc.bold(profileName)}`);
    return;
  }

  if (action === "use" || action === "switch") {
    if (!profileName) throw new Push44Error("Please provide a profile name: `push44 env use <name>`");
    const filePath = path.join(PROFILES_DIR, `${profileName}.json`);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const creds = JSON.parse(raw);
      await writeRawCredentials(creds);
      logger.success(`Switched active credential profile to: ${pc.bold(profileName)}`);
    } catch {
      throw new Push44Error(`Profile "${profileName}" not found in ${PROFILES_DIR}.`);
    }
    return;
  }

  throw new Push44Error(`Unknown env action "${action}". Try: list, save, use.`);
}
