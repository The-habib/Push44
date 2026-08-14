import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { findProjectConfig } from "../storage/project-config.js";
import { readDirectoryFiles } from "../utils/files.js";
import { requestWithRetry } from "../utils/network.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

export async function shareCommand(options: { file?: string; public?: boolean } = {}): Promise<void> {
  const creds = await getCredentials();
  if (!creds.githubToken) {
    throw new Push44Error("GitHub token required to share Gists. Run `push44 github login` first.");
  }

  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error("No .push44.json found in current directory.");
  }

  const { config, projectRoot } = found;
  const files = await readDirectoryFiles(projectRoot);

  const gistFiles: Record<string, { content: string }> = {};

  if (options.file) {
    const target = files.find((f) => f.path === options.file);
    if (!target) throw new Push44Error(`File "${options.file}" not found in project.`);
    gistFiles[options.file.replace(/\//g, "-")] = { content: target.content };
  } else {
    // Share project overview & key files
    const readme = files.find((f) => f.path.toLowerCase() === "readme.md");
    const pkg = files.find((f) => f.path === "package.json");

    gistFiles[`${config.appName}-summary.md`] = {
      content: `# ${config.appName}\n\nExported from ${config.platform} using Push44 CLI.\nTotal Files: ${files.length}\nLast Synced: ${new Date().toLocaleString()}`,
    };
    if (readme && !readme.binary) gistFiles["README.md"] = { content: readme.content };
    if (pkg && !pkg.binary) gistFiles["package.json"] = { content: pkg.content };
  }

  const res = await withSpinner("Publishing secret GitHub Gist...", async () => {
    const response = await requestWithRetry("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.githubToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "Push44-CLI",
      },
      body: JSON.stringify({
        description: `Push44 Snapshot — ${config.appName} (${config.platform})`,
        public: Boolean(options.public),
        files: gistFiles,
      }),
    });

    if (!response.ok) throw new Push44Error(`GitHub Gist API returned ${response.status}`);
    return response.json();
  });

  console.log(`\n${pc.bold("✦ Shareable Snapshot Created!")}`);
  console.log(`  Gist URL: ${pc.bold(pc.cyan(res.html_url))}`);
  console.log(`  Raw URL:  ${pc.dim(res.url)}\n`);
}
