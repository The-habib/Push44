import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { getCredentials } from "../auth/store.js";
import { listWorkflowRuns, getWorkflowLogs } from "../github/actions.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

export async function logsCommand(options: { follow?: boolean } = {}): Promise<void> {
  const found = await findProjectConfig();
  if (!found) throw new Push44Error("No .push44.json found in current directory.");

  const { config } = found;
  const creds = await getCredentials();

  if (!config.repo || !creds.githubToken) {
    logger.info(`Platform Log Streamer for ${config.appName} (${config.platform})`);
    console.log(pc.dim("  No GitHub CI repository linked yet. Run `push44 push` to enable workflow logs."));
    return;
  }

  const [owner, repoName] = config.repo.split("/");
  const runs = await withSpinner("Fetching CI build logs...", async () =>
    listWorkflowRuns(creds.githubToken!, owner, repoName, 1)
  );

  if (runs.length === 0) {
    logger.info("No active workflow runs found.");
    return;
  }

  const latest = runs[0];
  console.log(`\n${pc.bold("✦ CI Workflow Log Stream:")} ${pc.cyan(latest.name)} (#${latest.id})`);
  console.log(`  Status: ${pc.bold(latest.status)} · Conclusion: ${pc.bold(latest.conclusion || "running")}\n`);

  const logs = await getWorkflowLogs(creds.githubToken!, owner, repoName, latest.id);
  if (logs) {
    console.log(pc.dim(logs.slice(-2000)));
  } else {
    console.log(pc.dim("  Logs are streaming in real time on GitHub Actions."));
  }
  console.log();
}
