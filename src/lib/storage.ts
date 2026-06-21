export interface Credentials {
  githubToken: string;
  githubUsername: string;
  base44Token: string;
  base44Email: string;
  defaultBranch: string;
  defaultRepo: string;
  defaultOwner: string;
}

export interface PushRecord {
  id: string;
  appName: string;
  repo: string;
  branch: string;
  commitMessage: string;
  commitHash: string;
  filesCount: number;
  status: "success" | "failed";
  error?: string;
  timestamp: number;
}

const CREDS_KEY = "b44push_credentials";
const HISTORY_KEY = "b44push_history";

export function getCredentials(): Partial<Credentials> {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCredentials(creds: Partial<Credentials>): void {
  const existing = getCredentials();
  localStorage.setItem(CREDS_KEY, JSON.stringify({ ...existing, ...creds }));
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDS_KEY);
}

export function getHistory(): PushRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(record: PushRecord): void {
  const history = getHistory();
  history.unshift(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
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
