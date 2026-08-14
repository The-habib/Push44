import pc from "picocolors";

/**
 * Get current terminal width with safe defaults.
 */
export function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Checks if the terminal is running in a narrow or mobile environment (e.g. Termux, split pane).
 */
export function isNarrowTerminal(): boolean {
  return getTerminalWidth() < 75;
}

/**
 * Wrap text to fit within specified maximum width.
 */
export function wrapText(text: string, maxWidth?: number): string {
  const width = maxWidth || Math.max(getTerminalWidth() - 4, 30);
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= width) {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.join("\n");
}

/**
 * Render a responsive card that adapts gracefully between wide screens and mobile terminals.
 */
export function renderResponsiveCard(title: string, items: { label: string; value: string; hint?: string }[]): string {
  const width = Math.min(getTerminalWidth(), 68);

  if (isNarrowTerminal()) {
    // Compact mobile card layout
    const lines: string[] = [];
    lines.push(pc.bold(pc.yellow(`✦ ${title}`)));
    lines.push(pc.dim("─".repeat(Math.min(getTerminalWidth() - 2, 40))));
    for (const item of items) {
      lines.push(`${pc.bold(item.label)}: ${item.value}`);
      if (item.hint) lines.push(`  ${pc.dim(item.hint)}`);
    }
    return lines.join("\n");
  }

  // Rounded desktop card layout
  const top = pc.dim("╭" + "─".repeat(width - 2) + "╮");
  const bottom = pc.dim("╰" + "─".repeat(width - 2) + "╯");
  const border = pc.dim("│");

  const lines: string[] = [
    top,
    `${border}  ${pc.bold(pc.yellow(`✦ ${title}`))}`.padEnd(width + 8) + ` ${border}`,
    `${border} ${pc.dim("─".repeat(width - 4))} ${border}`,
  ];

  for (const item of items) {
    const row = `  ${pc.bold(item.label.padEnd(16))} ${item.value}`;
    lines.push(`${border}${row}`.padEnd(width + 8) + `${border}`);
    if (item.hint) {
      lines.push(`${border}    ${pc.dim(item.hint)}`.padEnd(width + 8) + `${border}`);
    }
  }

  lines.push(bottom);
  return lines.join("\n");
}
