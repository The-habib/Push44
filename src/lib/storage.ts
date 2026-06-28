export interface Credentials {
  displayName: string;
  githubToken: string;
  githubUsername: string;
  base44Token: string;
  base44Email: string;
  rocketToken: string;
  rocketEmail: string;
  rocketCompanyId: string;
  flootToken: string;
  flootEmail: string;
  ziteSession: string;
  ziteCsrf: string;
  ziteEmail: string;
  defaultBranch: string;
  defaultRepo: string;
  defaultOwner: string;
}

export type Platform = "base44" | "rocket" | "floot" | "zite";

export interface PushRecord {
  id: string;
  appName: string;
  platform?: Platform;
  repo: string;
  branch: string;
  commitMessage: string;
  commitHash: string;
  filesCount: number;
  stagedCount?: number;
  newCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
  status: "success" | "failed";
  error?: string;
  timestamp: number;
  aiPrompt?: string;
}

export interface FileSnapshot {
  files: { path: string; hash: string; content: string; truncated?: boolean }[];
  timestamp: number;
}

export type DiffStatus = "new" | "modified" | "unchanged" | "deleted";

const CREDS_KEY      = "push44_credentials";
const HISTORY_KEY    = "push44_history";
const SNAPSHOTS_KEY  = "push44_snapshots";
const ONBOARDING_KEY = "push44_onboarded";
const PUSH_PREFS_KEY = "push44_push_prefs";

if (typeof localStorage !== "undefined") {
  const oldCreds   = localStorage.getItem("b44push_credentials");
  const oldHistory = localStorage.getItem("b44push_history");
  if (oldCreds   && !localStorage.getItem(CREDS_KEY))   { localStorage.setItem(CREDS_KEY, oldCreds);     localStorage.removeItem("b44push_credentials"); }
  if (oldHistory && !localStorage.getItem(HISTORY_KEY)) { localStorage.setItem(HISTORY_KEY, oldHistory); localStorage.removeItem("b44push_history"); }
}

function simpleHash(str: string): string {
  // FNV-1a inspired dual-hash — far lower collision rate than djb2
  let h1 = 0x811c9dc5;
  let h2 = 0xc4ceb9fe;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca77);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
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

// ── Push page preferences (platform, last repo, branch, etc.) ─────────────────

export interface PushPrefs {
  platform?: "base44" | "rocket" | "floot" | "zite";
  lastRepo?: { full_name: string; default_branch: string; html_url: string } | null;
  branch?: string;
  isPrivate?: boolean;
  repushAppName?: string | null;
}

export function getPushPrefs(): PushPrefs {
  try { const raw = localStorage.getItem(PUSH_PREFS_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

export function savePushPrefs(prefs: Partial<PushPrefs>): void {
  try {
    const existing = getPushPrefs();
    localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch {}
}

export function clearPushPrefs(): void {
  try { localStorage.removeItem(PUSH_PREFS_KEY); } catch {}
}

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

function getSnapshotKey(appId: string): string {
  return `${SNAPSHOTS_KEY}_${appId}`;
}

const MAX_CONTENT_BYTES = 100_000;

export function saveAppSnapshot(appId: string, files: { path: string; content: string }[]): void {
  try {
    const snapshot: FileSnapshot = {
      files: files.map(f => {
        const truncated = f.content.length > MAX_CONTENT_BYTES;
        return {
          path: f.path,
          hash: simpleHash(f.content),
          content: truncated ? f.content.slice(0, MAX_CONTENT_BYTES) : f.content,
          ...(truncated ? { truncated: true } : {}),
        };
      }),
      timestamp: Date.now(),
    };
    localStorage.setItem(getSnapshotKey(appId), JSON.stringify(snapshot));
  } catch (e) {
    console.error("[Push44] Failed to save snapshot", e);
  }
}

export function getAppSnapshot(appId: string): FileSnapshot | null {
  try {
    const raw = localStorage.getItem(getSnapshotKey(appId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deleteAppSnapshot(appId: string): void {
  try {
    localStorage.removeItem(getSnapshotKey(appId));
  } catch {}
}

export function getSnapshotFileContent(appId: string, path: string): string | null {
  const snapshot = getAppSnapshot(appId);
  if (!snapshot) return null;
  return snapshot.files.find(f => f.path === path)?.content ?? null;
}

export function getDeletedPaths(
  currentFiles: { path: string }[],
  snapshot: FileSnapshot | null
): string[] {
  if (!snapshot) return [];
  const currentPaths = new Set(currentFiles.map(f => f.path));
  return snapshot.files.filter(f => !currentPaths.has(f.path)).map(f => f.path);
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
  const currentPaths = new Set(files.map(f => f.path));

  for (const f of files) {
    const hash = simpleHash(f.content);
    if (!snapshotMap.has(f.path)) result.set(f.path, "new");
    else if (snapshotMap.get(f.path) !== hash) result.set(f.path, "modified");
    else result.set(f.path, "unchanged");
  }

  for (const [path] of snapshotMap) {
    if (!currentPaths.has(path)) result.set(path, "deleted");
  }

  return result;
}

function toUtcDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

export function getPushStreak(): number {
  const history = getHistory().filter(h => h.status === "success");
  if (!history.length) return 0;
  const days = new Set(history.map(h => toUtcDay(h.timestamp)));
  const today = toUtcDay(Date.now());
  const yesterday = toUtcDay(Date.now() - 86400000);
  if (!days.has(today) && !days.has(yesterday)) return 0;
  let streak = 0;
  let cursor = days.has(today) ? Date.now() : Date.now() - 86400000;
  while (days.has(toUtcDay(cursor))) {
    streak++;
    cursor -= 86400000;
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
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
