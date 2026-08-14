import pc from "picocolors";
import { getHistory } from "../storage/history.js";
import { renderBarChart, type BarChartData } from "../ui/chart.js";
import { createTable } from "../ui/table.js";
import { formatBytes } from "../utils/files.js";

const MS_PER_DAY = 86_400_000;

function toUtcDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

export async function statsCommand(): Promise<void> {
  const history = await getHistory();
  const successful = history.filter((h) => h.status === "success");

  // Compute streak
  let streak = 0;
  if (successful.length > 0) {
    const days = new Set(successful.map((h) => toUtcDay(h.timestamp)));
    const today = toUtcDay(Date.now());
    const yesterday = toUtcDay(Date.now() - MS_PER_DAY);
    if (days.has(today) || days.has(yesterday)) {
      let cursor = days.has(today) ? Date.now() : Date.now() - MS_PER_DAY;
      while (days.has(toUtcDay(cursor))) {
        streak++;
        cursor -= MS_PER_DAY;
      }
    }
  }

  // Weekly bar chart
  const weeklyData: BarChartData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * MS_PER_DAY);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" });
    const dayStr = toUtcDay(d.getTime());
    const dayPushes = successful.filter((h) => toUtcDay(h.timestamp) === dayStr);
    const filesCount = dayPushes.reduce((acc, p) => acc + (p.filesCount || 0), 0);

    weeklyData.push({
      label: dayLabel,
      value: dayPushes.length,
      subValue: filesCount,
      highlight: i === 0,
    });
  }

  const totalFilesPushed = successful.reduce((acc, h) => acc + (h.filesCount || 0), 0);
  const uniqueRepos = new Set(successful.map((h) => h.repo)).size;

  console.log(`\n${pc.bold("✦ Push44 Activity & Synchronization Dashboard")}\n`);

  const summaryTable = createTable({ head: ["Metric", "Statistic"] });
  summaryTable.push(["Active Push Streak", pc.bold(streak > 0 ? pc.yellow(`🔥 ${streak} Days Active`) : pc.dim("0 Days"))]);
  summaryTable.push(["Total Pushes Executed", pc.bold(pc.green(String(successful.length)))]);
  summaryTable.push(["Total Files Synchronized", pc.bold(pc.cyan(totalFilesPushed.toLocaleString()))]);
  summaryTable.push(["Connected GitHub Repos", pc.bold(String(uniqueRepos))]);

  console.log(summaryTable.toString());
  console.log();

  console.log(pc.bold("Weekly Synchronization Frequency:\n"));
  console.log(renderBarChart(weeklyData));
  console.log();

  if (successful.length > 0) {
    console.log(pc.bold("Recent Activity History:\n"));
    const historyTable = createTable({ head: ["App", "Platform", "Repo", "Branch", "Commit", "Date"] });
    for (const h of successful.slice(0, 5)) {
      historyTable.push([
        pc.bold(h.appName),
        pc.cyan(h.platform || "—"),
        h.repo,
        pc.magenta(h.branch),
        pc.dim(h.commitHash.slice(0, 7)),
        new Date(h.timestamp).toLocaleDateString(),
      ]);
    }
    console.log(historyTable.toString());
    console.log();
  }
}
