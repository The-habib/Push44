import pc from "picocolors";
import type { FileDiffItem } from "../types.js";

export function renderDiffSummary(diffs: FileDiffItem[]): void {
  const newFiles = diffs.filter((d) => d.status === "new");
  const modifiedFiles = diffs.filter((d) => d.status === "modified");
  const deletedFiles = diffs.filter((d) => d.status === "deleted");
  const unchangedFiles = diffs.filter((d) => d.status === "unchanged");

  console.log(
    `\n${pc.bold("File Changes:")} ${pc.green(`+${newFiles.length} new`)}, ` +
      `${pc.yellow(`~${modifiedFiles.length} modified`)}, ` +
      `${pc.red(`-${deletedFiles.length} deleted`)}, ` +
      `${pc.dim(`${unchangedFiles.length} unchanged`)}\n`
  );

  const changed = diffs.filter((d) => d.status !== "unchanged");
  if (changed.length === 0) {
    console.log(pc.dim("  No file changes detected. Project is up to date.\n"));
    return;
  }

  for (const item of changed) {
    if (item.status === "new") {
      console.log(`  ${pc.green("+")} ${pc.green(item.path)} ${pc.dim("(created)")}`);
    } else if (item.status === "modified") {
      console.log(`  ${pc.yellow("~")} ${pc.yellow(item.path)} ${pc.dim("(modified)")}`);
    } else if (item.status === "deleted") {
      console.log(`  ${pc.red("-")} ${pc.red(item.path)} ${pc.dim("(removed)")}`);
    }
  }
  console.log();
}
