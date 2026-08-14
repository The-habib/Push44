import pc from "picocolors";
import { getCredentials, maskSecret } from "../auth/store.js";
import { getAllAdapters } from "../platforms/index.js";
import { createTable } from "../ui/table.js";
import { symbols } from "../ui/theme.js";
import { getGitHubUser } from "../github/client.js";

export async function authStatusCommand(): Promise<void> {
  const creds = await getCredentials();
  const table = createTable({
    head: ["Platform", "Status", "Account / Email", "Token / Secret"],
  });

  // GitHub check
  let ghStatus = pc.dim("Not connected");
  let ghAccount = pc.dim("—");
  if (creds.githubToken) {
    try {
      const u = await getGitHubUser(creds.githubToken);
      ghStatus = `${symbols.tick} ${pc.green("Connected")}`;
      ghAccount = `@${u.login} (${u.name || u.email})`;
    } catch {
      ghStatus = `${symbols.cross} ${pc.red("Invalid / Expired")}`;
      ghAccount = creds.githubUsername ? `@${creds.githubUsername}` : pc.dim("—");
    }
  }
  table.push(["GitHub", ghStatus, ghAccount, maskSecret(creds.githubToken)]);

  // AI Platforms
  const adapters = getAllAdapters();
  for (const adapter of adapters) {
    let statusText = pc.dim("Not connected");
    let accountText = pc.dim("—");
    let tokenValue: string | undefined;

    if (adapter.platform === "base44") tokenValue = creds.base44Token;
    else if (adapter.platform === "rocket") tokenValue = creds.rocketToken;
    else if (adapter.platform === "floot") tokenValue = creds.flootToken;
    else if (adapter.platform === "zite") tokenValue = creds.ziteSession;
    else if (adapter.platform === "bolt") tokenValue = creds.boltToken;
    else if (adapter.platform === "lovable") tokenValue = creds.lovableToken;

    if (tokenValue) {
      const validation = await adapter.validateSession(creds);
      if (validation.valid) {
        statusText = `${symbols.tick} ${pc.green("Active")}`;
        accountText = validation.email || validation.name || "Authenticated";
      } else {
        statusText = `${symbols.cross} ${pc.red("Expired")}`;
        accountText = validation.error || "Token invalid";
      }
    }

    table.push([adapter.displayName, statusText, accountText, maskSecret(tokenValue)]);
  }

  console.log(`\n${pc.bold("Push44 Authentication Status")}\n`);
  console.log(table.toString());
  console.log();
}
