import type { FileDiffItem } from "../types.js";

/**
 * Heuristic semantic commit generator based on file change paths and categories.
 */
export function generateSemanticCommitMessage(
  diffs: FileDiffItem[],
  platform = "AI",
  appName = "project"
): string {
  const changed = diffs.filter((d) => d.status !== "unchanged");
  if (changed.length === 0) return `chore: sync ${appName}`;

  const added = diffs.filter((d) => d.status === "new");
  const modified = diffs.filter((d) => d.status === "modified");
  const deleted = diffs.filter((d) => d.status === "deleted");

  // Check categories
  const hasUi = changed.some((f) => f.path.includes("components/") || f.path.includes("pages/") || f.path.includes("routes/"));
  const hasStyles = changed.some((f) => f.path.endsWith(".css") || f.path.includes("tailwind"));
  const hasConfig = changed.some((f) => f.path.endsWith(".json") || f.path.endsWith("config.ts") || f.path.endsWith("config.js"));
  const hasAuth = changed.some((f) => f.path.toLowerCase().includes("auth") || f.path.toLowerCase().includes("login"));
  const hasApi = changed.some((f) => f.path.includes("api/") || f.path.includes("lib/") || f.path.includes("endpoints/"));
  const hasDocs = changed.some((f) => f.path.endsWith(".md") || f.path.includes("docs/"));

  let scope = "";
  if (hasAuth) scope = "(auth)";
  else if (hasUi) scope = "(ui)";
  else if (hasStyles) scope = "(styles)";
  else if (hasApi) scope = "(api)";
  else if (hasConfig) scope = "(config)";
  else if (hasDocs) scope = "(docs)";

  if (added.length > 0 && modified.length === 0 && deleted.length === 0) {
    const mainPath = added[0].path;
    return `feat${scope}: add ${mainPath} and initial assets from ${platform}`;
  }

  if (deleted.length > 0 && added.length === 0 && modified.length === 0) {
    return `refactor${scope}: remove deprecated files in ${appName}`;
  }

  if (hasAuth) {
    return `feat(auth): update authentication flow and session handling in ${appName}`;
  }

  if (hasUi && hasStyles) {
    return `feat(ui): update visual design and component hierarchy in ${appName}`;
  }

  if (hasUi) {
    const sampleComponent = changed.find((c) => c.path.includes("components/"))?.path.split("/").pop()?.replace(/\.\w+$/, "");
    return `feat(ui): update ${sampleComponent || "components"} and layout in ${appName}`;
  }

  if (hasApi) {
    return `feat(api): update business logic and service integrations in ${appName}`;
  }

  if (hasConfig) {
    return `chore(config): update project dependencies and build configuration`;
  }

  return `sync(${platform}): update ${changed.length} file${changed.length === 1 ? "" : "s"} in ${appName}`;
}
