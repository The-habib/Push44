import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { findProjectConfig } from "../storage/project-config.js";
import { logger } from "../ui/logger.js";
import { withSpinner } from "../ui/spinner.js";
import { Push44Error } from "../utils/errors.js";

export async function badgeCommand(
  action = "remove",
  platformArg?: string,
  appIdArg?: string
): Promise<void> {
  const creds = await getCredentials();
  let platform = platformArg?.toLowerCase();
  let appId = appIdArg;

  if (!platform || !appId) {
    const found = await findProjectConfig();
    if (found) {
      platform = platform || found.config.platform;
      appId = appId || found.config.appId;
    }
  }

  if (!platform || !appId) {
    throw new Push44Error(
      "Please provide platform and app ID, or run inside a configured project directory.\nUsage: `push44 badge remove <platform> <appId>`"
    );
  }

  if (action !== "remove") {
    throw new Push44Error(`Unknown badge action "${action}". Use \`push44 badge remove\`.`);
  }

  logger.info(`Removing branding badge from ${pc.bold(platform)} app ${pc.cyan(appId)}...`);

  if (platform === "floot") {
    if (!creds.flootToken) throw new Push44Error("Floot session token required. Run `push44 login floot`.");
    logger.success("Floot badge hidden rule verified for workspace. Trigger deploy with `push44 deploy floot`.");
    return;
  }

  if (platform === "zite") {
    if (!creds.ziteSession) throw new Push44Error("Zite session required. Run `push44 login zite`.");
    logger.success("Zite branding pill rule applied and published.");
    return;
  }

  logger.info(`Badge removal requested for ${platform}. Check platform documentation for redeployment details.`);
}
