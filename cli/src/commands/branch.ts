import { execFile } from "node:child_process";
import { promisify } from "node:util";
import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { getCredentials } from "../auth/store.js";
import { requestWithRetry } from "../utils/network.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { askText } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";

const execFileAsync = promisify(execFile);

export async function branchCommand(
  action = "list",
  branchName?: string,
  options: { pr?: boolean; title?: string; base?: string } = {}
): Promise<void> {
  const found = await findProjectConfig();
  if (!found) throw new Push44Error("No .push44.json config found in current directory.");

  const { config, projectRoot } = found;

  if (action === "list") {
    try {
      const { stdout } = await execFileAsync("git", ["branch", "-a"], { cwd: projectRoot });
      console.log(`\n${pc.bold("✦ Project Git Branches")}\n`);
      for (const line of stdout.split("\n").filter((l) => l.trim().length > 0)) {
        if (line.startsWith("*")) {
          console.log(`  ${pc.green(line)}`);
        } else {
          console.log(`  ${pc.dim(line)}`);
        }
      }
      console.log();
    } catch {
      console.log(pc.dim("No git repository branches found."));
    }
    return;
  }

  if (action === "create" || action === "new" || action === "checkout") {
    const targetBranch = branchName || (await askText("Enter new branch name:"));
    if (!targetBranch) throw new Push44Error("Branch name is required.");

    try {
      await execFileAsync("git", ["checkout", "-b", targetBranch], { cwd: projectRoot });
      logger.success(`Switched to new branch: ${pc.bold(targetBranch)}`);
    } catch {
      await execFileAsync("git", ["checkout", targetBranch], { cwd: projectRoot });
      logger.success(`Switched to existing branch: ${pc.bold(targetBranch)}`);
    }
    return;
  }

  if (action === "pr") {
    const creds = await getCredentials();
    if (!creds.githubToken) throw new Push44Error("GitHub token required to open Pull Requests.");
    if (!config.repo) throw new Push44Error("Project has no GitHub repo configured in .push44.json.");

    const { stdout: currentBranchOut } = await execFileAsync("git", ["branch", "--show-current"], { cwd: projectRoot });
    const headBranch = currentBranchOut.trim();
    const baseBranch = options.base || config.branch || "main";

    const title = options.title || (await askText("Pull Request Title:", `feat: updates from ${config.appName}`));

    const [owner, repoName] = config.repo.split("/");

    const pr = await withSpinner("Creating GitHub Pull Request...", async () => {
      const res = await requestWithRetry(`https://api.github.com/repos/${owner}/${repoName}/pulls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "Push44-CLI",
        },
        body: JSON.stringify({
          title,
          head: headBranch,
          base: baseBranch,
          body: `Created automatically with Push44 CLI for ${config.appName}.`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Push44Error(err.message || `GitHub PR creation failed with ${res.status}`);
      }

      return res.json();
    });

    logger.success(`Pull Request created: ${pc.bold(pc.cyan(pr.html_url))}`);
    return;
  }

  throw new Push44Error(`Unknown branch action "${action}". Try: list, create, checkout, pr.`);
}
