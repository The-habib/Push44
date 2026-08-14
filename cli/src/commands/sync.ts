import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { readDirectoryFiles } from "../utils/files.js";
import { computeDiff } from "../storage/snapshot.js";
import { renderDiffSummary } from "../ui/diff-viewer.js";
import { generateSemanticCommitMessage } from "../utils/ai-commit.js";
import { pushCommand } from "./push.js";
import { logger } from "../ui/logger.js";
import { askConfirm, askText } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";

export async function syncCommand(
  options: {
    message?: string;
    yes?: boolean;
    repo?: string;
    branch?: string;
  } = {}
): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error({
      message: "No .push44.json config found.",
      suggestion: "Run `push44 clone <app-id>` to initialize or set up a project.",
    });
  }

  const { config, projectRoot } = found;
  const localFiles = await readDirectoryFiles(projectRoot);
  const diffs = computeDiff(localFiles, config.filesSnapshot);

  const changed = diffs.filter((d) => d.status !== "unchanged");

  renderDiffSummary(diffs);

  if (changed.length === 0 && !options.message) {
    logger.info("No file modifications detected. Project is already in sync.");
    return;
  }

  let commitMessage = options.message;
  if (!commitMessage) {
    const aiSuggestedMsg = generateSemanticCommitMessage(diffs, config.platform, config.appName);

    if (options.yes) {
      commitMessage = aiSuggestedMsg;
    } else {
      commitMessage = await askText("Commit message (AI generated):", aiSuggestedMsg);
    }
  }

  if (!options.yes) {
    const proceed = await askConfirm("Proceed with synchronization to GitHub?", true);
    if (!proceed) {
      logger.info("Sync cancelled.");
      return;
    }
  }

  await pushCommand({
    repo: options.repo || config.repo,
    branch: options.branch || config.branch || "main",
    message: commitMessage,
  });
}
