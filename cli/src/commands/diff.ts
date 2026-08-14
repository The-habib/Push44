import { findProjectConfig } from "../storage/project-config.js";
import { readDirectoryFiles } from "../utils/files.js";
import { computeDiff } from "../storage/snapshot.js";
import { renderDiffSummary } from "../ui/diff-viewer.js";
import { getPlatformAdapter } from "../platforms/index.js";
import { getCredentials } from "../auth/store.js";
import { withSpinner } from "../ui/spinner.js";
import { Push44Error } from "../utils/errors.js";

export async function diffCommand(options: { live?: boolean } = {}): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error({
      message: "No .push44.json found in current directory.",
      suggestion: "Run `push44 clone <app-id>` first.",
    });
  }

  const { config, projectRoot } = found;
  const localFiles = await readDirectoryFiles(projectRoot);

  let baselineSnapshot = config.filesSnapshot;

  if (options.live) {
    const creds = await getCredentials();
    const adapter = getPlatformAdapter(config.platform);
    const remote = await withSpinner("Fetching live files from platform...", async () =>
      adapter.exportProject(config.appId, creds)
    );
    baselineSnapshot = remote.files.map((f) => ({
      path: f.path,
      hash: f.content,
    }));
  }

  const diffs = computeDiff(localFiles, baselineSnapshot);
  renderDiffSummary(diffs);
}
