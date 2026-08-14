import pc from "picocolors";
import { getTerminalWidth } from "./responsive.js";

export function renderKeybar(shortcuts: { key: string; label: string }[]): string {
  const items = shortcuts.map(
    (s) => `${pc.bold(pc.cyan(`[${s.key}]`))} ${pc.dim(s.label)}`
  );
  const content = items.join(pc.dim("  ·  "));
  const width = Math.min(getTerminalWidth(), 70);
  const border = pc.dim("─".repeat(width));

  return `\n${border}\n  ${content}\n${border}`;
}
