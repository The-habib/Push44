export interface Credentials {
  displayName: string;
  githubToken: string;
  githubUsername: string;
  base44Token: string;
  base44Email: string;
  rocketToken: string;
  rocketEmail: string;
  rocketCompanyId: string;
  defaultBranch: string;
  defaultRepo: string;
  defaultOwner: string;
}

export interface PushRecord {
  id: string;
  appName: string;
  platform?: "base44" | "rocket";
  repo: string;
  branch: string;
  commitMessage: string;
  commitHash: string;
  filesCount: number;
  stagedCount?: number;
  newCount?: number;
  modifiedCount?: number;
  status: "success" | "failed";
  error?: string;
  timestamp: number;
}

export interface FileSnapshot {
  files: { path: string; hash: string }[];
  timestamp: number;
}

export type DiffStatus = "new" | "modified" | "unchanged";

const CREDS_KEY      = "push44_credentials";
const HISTORY_KEY    = "push44_history";
const SNAPSHOTS_KEY  = "push44_snapshots";
const ONBOARDING_KEY = "push44_onboarded";

if (typeof localStorage !== "undefined") {
  const oldCreds   = localStorage.getItem("b44push_credentials");
  const oldHistory = localStorage.getItem("b44push_history");
  if (oldCreds   && !localStorage.getItem(CREDS_KEY))   { localStorage.setItem(CREDS_KEY, oldCreds);     localStorage.removeItem("b44push_credentials"); }
  if (oldHistory && !localStorage.getItem(HISTORY_KEY)) { localStorage.setItem(HISTORY_KEY, oldHistory); localStorage.removeItem("b44push_history"); }
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export function getCredentials(): Partial<Credentials> {
  try { const raw = localStorage.getItem(CREDS_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

export function saveCredentials(creds: Partial<Credentials>): void {
  const existing = getCredentials();
  localStorage.setItem(CREDS_KEY, JSON.stringify({ ...existing, ...creds }));
}

export function clearCredentials(): void { localStorage.removeItem(CREDS_KEY); }

export function getHistory(): PushRecord[] {
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

export function addHistory(record: PushRecord): void {
  const history = getHistory();
  history.unshift(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
}

export function clearHistory(): void { localStorage.removeItem(HISTORY_KEY); }

export function isOnboardingDone(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === "true"; }
  catch { return false; }
}

export function markOnboardingDone(): void {
  try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch {}
}

export function resetOnboarding(): void {
  try { localStorage.removeItem(ONBOARDING_KEY); } catch {}
}

function getSnapshots(): Record<string, FileSnapshot> {
  try { const raw = localStorage.getItem(SNAPSHOTS_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

export function saveAppSnapshot(appId: string, files: { path: string; content: string }[]): void {
  try {
    const all = getSnapshots();
    all[appId] = {
      files: files.map(f => ({ path: f.path, hash: simpleHash(f.content) })),
      timestamp: Date.now(),
    };
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(all));
  } catch {}
}

export function getAppSnapshot(appId: string): FileSnapshot | null {
  return getSnapshots()[appId] ?? null;
}

export function deleteAppSnapshot(appId: string): void {
  try {
    const all = getSnapshots();
    delete all[appId];
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(all));
  } catch {}
}

export function computeFileDiff(
  files: { path: string; content: string }[],
  snapshot: FileSnapshot | null
): Map<string, DiffStatus> {
  const result = new Map<string, DiffStatus>();
  if (!snapshot) {
    for (const f of files) result.set(f.path, "new");
    return result;
  }
  const snapshotMap = new Map(snapshot.files.map(f => [f.path, f.hash]));
  for (const f of files) {
    const hash = simpleHash(f.content);
    if (!snapshotMap.has(f.path)) result.set(f.path, "new");
    else if (snapshotMap.get(f.path) !== hash) result.set(f.path, "modified");
    else result.set(f.path, "unchanged");
  }
  return result;
}

export function getPushStreak(): number {
  const history = getHistory().filter(h => h.status === "success");
  if (!history.length) return 0;
  const days = new Set(history.map(h => new Date(h.timestamp).toDateString()));
  const today = new Date().toDateString();
  if (!days.has(today) && !days.has(new Date(Date.now() - 86400000).toDateString())) return 0;
  let streak = 0;
  let cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor = new Date(Date.now() - 86400000);
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

export function getWeeklyActivity(): { day: string; pushes: number; files: number }[] {
  const history = getHistory();
  const result: { day: string; pushes: number; files: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const dayStr = d.toDateString();
    const dayRecords = history.filter(h => new Date(h.timestamp).toDateString() === dayStr && h.status === "success");
    result.push({ day: label, pushes: dayRecords.length, files: dayRecords.reduce((s, r) => s + r.filesCount, 0) });
  }
  return result;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
