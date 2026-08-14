import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { PushRecord } from "../types.js";

const HISTORY_FILE = path.join(os.homedir(), ".push44", "history.json");

export async function getHistory(): Promise<PushRecord[]> {
  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addHistoryRecord(record: PushRecord): Promise<void> {
  const history = await getHistory();
  history.unshift(record);
  const truncated = history.slice(0, 100);

  const dir = path.dirname(HISTORY_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(HISTORY_FILE, JSON.stringify(truncated, null, 2), "utf-8");
}

export async function clearHistory(): Promise<void> {
  try {
    await fs.unlink(HISTORY_FILE);
  } catch {}
}
