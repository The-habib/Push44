import pc from "picocolors";
import { findProjectConfig, saveProjectConfig } from "../storage/project-config.js";
import { getCredentials } from "../auth/store.js";
import { readDirectoryFiles } from "../utils/files.js";
import { computeFilesSnapshot, computeDiff } from "../storage/snapshot.js";
import { pushFilesToGitHub, getGitHubUser, createGitHubRepo, listGitHubRepos } from "../github/client.js";
import { addHistoryRecord } from "../storage/history.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { askText, askSelect, askConfirm } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";
import type { PushRecord } from "../types.js";

export async function pushCommand(
  options: {
    repo?: string;
    branch?: string;
    message?: string;
    private?: boolean;
  } = {}
): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error({
      message: "No .push44.json found in current directory.",
      suggestion: "Run `push44 clone <app-id>` first to link a project.",
    });
  }

  const { config, projectRoot } = found;
  const creds = await getCredentials();

  if (!creds.githubToken) {
    throw new Push44Error({
      message: "GitHub token not configured.",
      suggestion: "Run `push44 github login` or `push44 login github` first.",
    });
  }

  const token = creds.githubToken;
  const user = await getGitHubUser(token);

  let targetRepo = options.repo || config.repo;
  let targetBranch = options.branch || config.branch || "main";

  if (!targetRepo) {
    const repos = await withSpinner("Fetching your GitHub repositories...", async () =>
      listGitHubRepos(token)
    );

    const action = await askSelect("Choose target GitHub repository:", [
      { title: "Create new repository", value: "__create__" },
      ...repos.slice(0, 20).map((r) => ({
        title: `${r.full_name} (${r.private ? "Private" : "Public"})`,
        value: r.full_name,
      })),
    ]);

    if (action === "__create__") {
      const defaultName = config.appName.replace(/[^a-zA-Z0-9_\-]/g, "-").toLowerCase();
      const newName = await askText("Enter new repository name:", defaultName);
      const isPrivate = await askConfirm("Make repository private?", true);

      const created = await withSpinner("Creating GitHub repository...", async () =>
        createGitHubRepo(token, newName, isPrivate)
      );
      targetRepo = created.full_name;
    } else if (action) {
      targetRepo = action;
    }
  }

  if (!targetRepo) {
    throw new Push44Error("Target repository is required.");
  }

  const [owner, repoName] = targetRepo.includes("/") ? targetRepo.split("/") : [user.login, targetRepo];

  const localFiles = await readDirectoryFiles(projectRoot);
  const diffs = computeDiff(localFiles, config.filesSnapshot);
  const deletedPaths = diffs.filter((d) => d.status === "deleted").map((d) => d.path);

  const commitMsg =
    options.message ||
    `sync: update ${config.appName} from ${config.platform} (${new Date().toISOString().slice(0, 10)})`;

  logger.info(`Pushing ${localFiles.length} files to ${pc.bold(`${owner}/${repoName}`)} (${targetBranch})...`);

  const result = await withSpinner(
    "Uploading blobs and committing to GitHub...",
    async () =>
      pushFilesToGitHub({
        token,
        owner,
        repo: repoName,
        branch: targetBranch,
        files: localFiles,
        filesToDelete: deletedPaths,
        commitMessage: commitMsg,
        authorName: user.name || user.login,
        authorEmail: user.email,
      }),
    (res) => `Pushed commit ${pc.cyan(res.shortSha)} to GitHub!`
  );

  // Update snapshot & config
  const newSnapshot = computeFilesSnapshot(localFiles);
  await saveProjectConfig(projectRoot, {
    ...config,
    repo: `${owner}/${repoName}`,
    branch: targetBranch,
    lastPushedCommit: result.commitSha,
    lastSyncedAt: Date.now(),
    filesSnapshot: newSnapshot,
  });

  // Record history
  const record: PushRecord = {
    id: `push_${Date.now()}`,
    appName: config.appName,
    platform: config.platform,
    repo: `${owner}/${repoName}`,
    branch: targetBranch,
    commitMessage: commitMsg,
    commitHash: result.commitSha,
    filesCount: localFiles.length,
    status: "success",
    timestamp: Date.now(),
  };
  await addHistoryRecord(record);

  console.log(
    pc.green(
      `\n✓ Push complete: https://github.com/${owner}/${repoName}/commit/${result.commitSha}\n`
    )
  );
}
