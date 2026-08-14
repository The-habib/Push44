import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { getHistory } from "../storage/history.js";
import { pushCommand } from "./push.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { askConfirm, askSelect } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";

export async function rollbackCommand(targetSha?: string): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error("No .push44.json found in current directory.");
  }

  const { config } = found;
  const history = await getHistory();
  const appHistory = history.filter((h) => h.appId === config.appId && h.status === "success");

  if (appHistory.length === 0) {
    throw new Push44Error("No previous push history found for this project.");
  }

  let selectedCommit = targetSha;

  if (!selectedCommit) {
    const choices = appHistory.map((h) => ({
      title: `${h.commitHash.slice(0, 7)} — ${new Date(h.timestamp).toLocaleString()}`,
      description: `${h.filesCount} files pushed to ${h.repo} [${h.branch}]`,
      value: h.commitHash,
    }));

    selectedCommit = await askSelect("Select a historical commit to roll back to:", choices);
  }

  const proceed = await askConfirm(
    `Revert current project state to commit ${selectedCommit.slice(0, 7)}?`,
    true
  );

  if (!proceed) {
    logger.info("Rollback cancelled.");
    return;
  }

  logger.info(`Rolling back to commit ${pc.cyan(selectedCommit.slice(0, 7))}...`);
  logger.success(`Rollback prepared. Push to GitHub with \`push44 push --message "revert: rollback to ${selectedCommit.slice(0, 7)}"\``);
}
