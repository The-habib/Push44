import pc from "picocolors";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { requestWithRetry } from "../utils/network.js";

const CURRENT_VERSION = "1.0.0";

export async function upgradeCommand(): Promise<void> {
  const latest = await withSpinner("Checking for Push44 updates...", async () => {
    try {
      const res = await requestWithRetry("https://api.github.com/repos/The-habib/Push44/releases/latest", {
        headers: { "User-Agent": "Push44-CLI" },
      });
      if (!res.ok) return CURRENT_VERSION;
      const data = await res.json();
      return (data.tag_name as string).replace(/^v/, "") || CURRENT_VERSION;
    } catch {
      return CURRENT_VERSION;
    }
  });

  if (latest === CURRENT_VERSION) {
    logger.success(`Push44 CLI is already up to date (v${CURRENT_VERSION}).`);
    return;
  }

  logger.info(`New version available: ${pc.bold(pc.yellow(latest))} (current: v${CURRENT_VERSION})`);
  console.log(pc.cyan("Run this command to update:"));
  console.log(`  curl -fsSL https://raw.githubusercontent.com/The-habib/Push44/main/install.sh | sh\n`);
}
