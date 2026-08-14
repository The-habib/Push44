import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter } from "../platforms/index.js";
import { FlootAdapter } from "../platforms/floot.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { askText } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";

export async function deployCommand(
  platformArg?: string,
  options: { subdomain?: string; update?: boolean } = {}
): Promise<void> {
  const creds = await getCredentials();
  let platform = platformArg?.toLowerCase();
  let appId = "";

  const found = await findProjectConfig();
  if (found) {
    platform = platform || found.config.platform;
    appId = found.config.appId;
  }

  if (platform === "floot") {
    const floot = getPlatformAdapter("floot") as FlootAdapter;
    const subdomain = options.subdomain || (await askText("Enter subdomain for floot.app:", appId.slice(0, 12)));

    await withSpinner(`Triggering Floot deployment to https://${subdomain}.floot.app...`, async () =>
      floot.deploy(appId, subdomain, creds, options.update)
    );

    logger.success(`Deploy initiated! Your live app will be accessible at: ${pc.cyan(`https://${subdomain}.floot.app`)}`);
    return;
  }

  throw new Push44Error(`Deployment action not supported for "${platform || "unknown"}".`);
}
