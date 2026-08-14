import pc from "picocolors";
import { getCredentials, saveCredentials } from "../auth/store.js";
import { getGitHubUser, listGitHubRepos, createGitHubRepo } from "../github/client.js";
import { createTable } from "../ui/table.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { askPassword, askText, askConfirm } from "../ui/prompts.js";
import { Push44Error } from "../utils/errors.js";

export async function githubCommand(
  action = "status",
  options: {
    token?: string;
    name?: string;
    private?: boolean;
    description?: string;
  } = {}
): Promise<void> {
  const creds = await getCredentials();

  if (action === "login") {
    let token = options.token;
    if (!token) {
      logger.info(
        "Generate a classic token with `repo` and `user` scopes at:\n" +
          pc.cyan("https://github.com/settings/tokens")
      );
      token = await askPassword("Enter your GitHub Personal Access Token:");
    }

    if (!token) throw new Push44Error("GitHub token cannot be empty.");

    const user = await withSpinner("Validating GitHub token...", async () =>
      getGitHubUser(token!)
    );

    await saveCredentials({
      githubToken: token,
      githubUsername: user.login,
      githubName: user.name,
      githubEmail: user.email,
      githubId: user.id,
    });

    logger.success(`Logged in as @${user.login} (${user.name || user.email}).`);
    return;
  }

  if (!creds.githubToken) {
    throw new Push44Error({
      message: "GitHub is not connected.",
      suggestion: "Run `push44 github login` to authenticate.",
    });
  }

  const token = creds.githubToken;

  if (action === "status" || action === "whoami") {
    const user = await withSpinner("Checking GitHub connection...", async () =>
      getGitHubUser(token)
    );

    console.log(`\n${pc.bold("GitHub Connection")}`);
    console.log(`  User:   @${pc.cyan(user.login)} (${user.name || "No name set"})`);
    console.log(`  Email:  ${user.email}`);
    console.log(`  ID:     ${user.id}`);
    console.log();
    return;
  }

  if (action === "repos" || action === "list") {
    const repos = await withSpinner("Fetching your GitHub repositories...", async () =>
      listGitHubRepos(token)
    );

    const table = createTable({
      head: ["Repository", "Visibility", "Default Branch", "Stars", "Updated"],
    });

    for (const r of repos.slice(0, 30)) {
      table.push([
        pc.bold(r.full_name),
        r.private ? pc.yellow("Private") : pc.green("Public"),
        r.default_branch,
        String(r.stargazers_count),
        new Date(r.updated_at).toLocaleDateString(),
      ]);
    }

    console.log(`\n${pc.bold(`GitHub Repositories (${repos.length})`)}\n`);
    console.log(table.toString());
    console.log();
    return;
  }

  if (action === "create") {
    const name = options.name || (await askText("Repository name:"));
    if (!name) throw new Push44Error("Repository name is required.");

    const isPrivate =
      options.private !== undefined ? options.private : await askConfirm("Private repository?", true);
    const desc = options.description || (await askText("Description (optional):", "Exported by Push44"));

    const created = await withSpinner("Creating repository...", async () =>
      createGitHubRepo(token, name, isPrivate, desc)
    );

    logger.success(`Created GitHub repository: ${pc.cyan(created.html_url)}`);
    return;
  }

  throw new Push44Error(`Unknown GitHub command action "${action}". Try: status, login, repos, create.`);
}
