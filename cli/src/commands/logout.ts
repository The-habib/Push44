import { clearCredentials } from "../auth/store.js";
import { logger } from "../ui/logger.js";
import { askSelect, askConfirm } from "../ui/prompts.js";
import type { SupportedPlatform } from "../types.js";

export async function logoutCommand(platformArg?: string, options: { all?: boolean } = {}): Promise<void> {
  if (options.all) {
    const confirm = await askConfirm("Are you sure you want to log out of ALL platforms?");
    if (confirm) {
      await clearCredentials();
      logger.success("Logged out of all platforms and cleared local credentials.");
    }
    return;
  }

  let target = platformArg?.toLowerCase();
  if (!target) {
    const choice = await askSelect("Select account to log out:", [
      { title: "GitHub", value: "github" },
      { title: "Base44", value: "base44" },
      { title: "Rocket.new", value: "rocket" },
      { title: "Floot", value: "floot" },
      { title: "Zite", value: "zite" },
      { title: "Bolt.new", value: "bolt" },
      { title: "Lovable.dev", value: "lovable" },
      { title: "All Platforms", value: "all" },
    ]);
    if (!choice) return;
    target = choice;
  }

  if (target === "all") {
    await clearCredentials();
    logger.success("Logged out of all platforms.");
  } else {
    await clearCredentials(target as SupportedPlatform | "github");
    logger.success(`Logged out of ${target}.`);
  }
}
