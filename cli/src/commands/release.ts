import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { getCredentials } from "../auth/store.js";
import { syncCommand } from "./sync.js";
import { createReleaseTag, getGitHubUser } from "../github/client.js";
import { listWorkflowRuns, watchWorkflow } from "../github/actions.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { askText, askConfirm } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";

export async function releaseCommand(
  versionTag?: string,
  options: {
    name?: string;
    notes?: string;
    watch?: boolean;
    yes?: boolean;
  } = {}
): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error("No .push44.json project config found.");
  }

  const { config } = found;
  const creds = await getCredentials();

  if (!creds.githubToken) {
    throw new Push44Error("GitHub token required for release management. Run `push44 github login`.");
  }

  if (!config.repo) {
    throw new Push44Error("Project is not linked to a GitHub repository yet. Run `push44 push` first.");
  }

  console.log(`\n${pc.bold(`Preparing Release for ${config.appName}`)} (${pc.cyan(config.repo)})\n`);

  // Step 1: Sync to make sure local changes are committed & pushed
  logger.info("Step 1/4: Synchronizing working tree with GitHub...");
  await syncCommand({ yes: options.yes });

  // Step 2: Formulate tag & release info
  const tag = versionTag || (await askText("Enter release version tag:", `v1.0.${Math.floor(Date.now() / 100000) % 100}`));
  const releaseName = options.name || (await askText("Release title:", `${config.appName} ${tag}`));
  const releaseNotes = options.notes || `Automated release ${tag} for ${config.appName} built with Push44 CLI.`;

  const [owner, repoName] = config.repo.split("/");

  // Step 3: Publish Release Tag on GitHub
  logger.info(`Step 2/4: Creating GitHub Release ${pc.bold(tag)}...`);
  const release = await withSpinner("Publishing release on GitHub...", async () =>
    createReleaseTag(creds.githubToken!, owner, repoName, tag, releaseName, releaseNotes)
  );

  logger.success(`GitHub Release created: ${pc.cyan(release.html_url)}`);

  // Step 4: Check if GitHub Actions workflows exist and monitor them
  logger.info("Step 3/4: Inspecting active CI/CD workflows...");
  const runs = await listWorkflowRuns(creds.githubToken!, owner, repoName, 3);

  if (runs.length > 0) {
    const latestRun = runs[0];
    logger.info(`Detected CI Workflow: "${latestRun.name}" (#${latestRun.id}) — Status: ${latestRun.status}`);

    if (options.watch !== false && (latestRun.status === "in_progress" || latestRun.status === "queued")) {
      await withSpinner("Watching workflow completion in real time...", async (spinner) => {
        return watchWorkflow(creds.githubToken!, owner, repoName, latestRun.id, (run) => {
          spinner.text = pc.cyan(`Workflow "${run.name}" is ${run.status}...`);
        });
      });
      logger.success("Workflow completed successfully!");
    }
  } else {
    logger.info("No active GitHub Action runs found.");
  }

  // Release summary
  console.log(
    pc.green(
      `\n✓ Release ${pc.bold(tag)} successfully deployed and recorded for ${pc.bold(config.appName)}!\n`
    )
  );
}
