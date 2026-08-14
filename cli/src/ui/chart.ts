import pc from "picocolors";

export interface BarChartData {
  label: string;
  value: number;
  subValue?: number;
  highlight?: boolean;
}

export function renderBarChart(data: BarChartData[], maxBarWidth = 24): string {
  if (data.length === 0) return pc.dim("No activity recorded.");

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const maxLabelLen = Math.max(...data.map((d) => d.label.length), 3);

  const lines: string[] = [];

  for (const item of data) {
    const paddedLabel = item.label.padEnd(maxLabelLen);
    const barLength = Math.round((item.value / maxValue) * maxBarWidth);
    const bar = "█".repeat(barLength).padEnd(1);

    const coloredBar = item.highlight
      ? pc.bold(pc.yellow(bar))
      : item.value > 0
      ? pc.cyan(bar)
      : pc.dim("·");

    const valStr = item.value > 0 ? pc.bold(String(item.value)) : pc.dim("0");
    const subStr = item.subValue ? pc.dim(` (${item.subValue} files)`) : "";

    lines.push(`  ${pc.dim(paddedLabel)} │ ${coloredBar} ${valStr}${subStr}`);
  }

  return lines.join("\n");
}
