import pc from "picocolors";

export interface LineDiff {
  type: "added" | "removed" | "unchanged";
  content: string;
  oldLine?: number;
  newLine?: number;
}

export function computeLineDiff(oldContent: string, newContent: string): LineDiff[] {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  const diffs: LineDiff[] = [];

  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length) {
      if (oldLines[oldIdx] === newLines[newIdx]) {
        diffs.push({
          type: "unchanged",
          content: oldLines[oldIdx],
          oldLine: oldIdx + 1,
          newLine: newIdx + 1,
        });
        oldIdx++;
        newIdx++;
      } else {
        diffs.push({
          type: "removed",
          content: oldLines[oldIdx],
          oldLine: oldIdx + 1,
        });
        diffs.push({
          type: "added",
          content: newLines[newIdx],
          newLine: newIdx + 1,
        });
        oldIdx++;
        newIdx++;
      }
    } else if (oldIdx < oldLines.length) {
      diffs.push({
        type: "removed",
        content: oldLines[oldIdx],
        oldLine: oldIdx + 1,
      });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      diffs.push({
        type: "added",
        content: newLines[newIdx],
        newLine: newIdx + 1,
      });
      newIdx++;
    }
  }

  return diffs;
}

export function renderInlineDiff(filePath: string, oldContent: string, newContent: string, maxContext = 5): string {
  const lineDiffs = computeLineDiff(oldContent, newContent);
  const changedOnly = lineDiffs.filter((d) => d.type !== "unchanged");

  if (changedOnly.length === 0) {
    return pc.dim(`  ${filePath}: Identical content.`);
  }

  const lines: string[] = [];
  lines.push(`\n${pc.bold(pc.cyan(`--- a/${filePath}`))}`);
  lines.push(`${pc.bold(pc.cyan(`+++ b/${filePath}`))}`);

  let displayed = 0;
  for (const item of lineDiffs) {
    if (item.type === "added") {
      const lineNo = String(item.newLine || "").padStart(4);
      lines.push(`${pc.green(`+ ${lineNo} │ ${item.content}`)}`);
      displayed++;
    } else if (item.type === "removed") {
      const lineNo = String(item.oldLine || "").padStart(4);
      lines.push(`${pc.red(`- ${lineNo} │ ${item.content}`)}`);
      displayed++;
    } else if (displayed < 20) {
      const lineNo = String(item.newLine || "").padStart(4);
      lines.push(pc.dim(`  ${lineNo} │ ${item.content}`));
    }
  }

  return lines.join("\n");
}
