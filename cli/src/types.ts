export type SupportedPlatform =
  | "base44"
  | "rocket"
  | "floot"
  | "zite"
  | "bolt"
  | "lovable";

export interface StoredCredentials {
  displayName?: string;
  // GitHub
  githubToken?: string;
  githubUsername?: string;
  githubName?: string;
  githubEmail?: string;
  githubId?: number;
  // Base44
  base44Token?: string;
  base44Email?: string;
  // Rocket.new
  rocketToken?: string;
  rocketEmail?: string;
  rocketCompanyId?: string;
  // Floot
  flootToken?: string;
  flootEmail?: string;
  // Zite
  ziteSession?: string;
  ziteCsrf?: string;
  ziteEmail?: string;
  // Bolt.new
  boltToken?: string;
  boltEmail?: string;
  boltProjectId?: string;
  boltSiteUrl?: string;
  // Lovable.dev
  lovableToken?: string;
  lovableRefreshToken?: string;
  lovableEmail?: string;
  // Defaults
  defaultBranch?: string;
  defaultRepo?: string;
  defaultOwner?: string;
}

export interface RemoteApp {
  id: string;
  name: string;
  platform: SupportedPlatform;
  updated_at: string;
  icon?: string;
  applicationId?: string; // Rocket.new / Zite specific
  files_count?: number;
  url?: string;
  description?: string;
}

export interface ProjectFile {
  path: string;
  content: string;
  binary?: boolean;
  sizeBytes?: number;
}

export interface ExportedProject {
  appId: string;
  appName: string;
  platform: SupportedPlatform;
  files: ProjectFile[];
  metadata?: Record<string, any>;
  exportedAt: number;
}

export type DiffStatus = "new" | "modified" | "unchanged" | "deleted";

export interface FileDiffItem {
  path: string;
  status: DiffStatus;
  oldContent?: string;
  newContent?: string;
  oldSize?: number;
  newSize?: number;
}

export interface ProjectConfig {
  version: "1.0";
  appId: string;
  appName: string;
  platform: SupportedPlatform;
  repo?: string;
  branch?: string;
  lastPushedCommit?: string;
  lastSyncedAt?: number;
  createdAt: number;
  filesSnapshot?: { path: string; hash: string }[];
}

export interface PushRecord {
  id: string;
  appName: string;
  platform?: SupportedPlatform;
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

export interface DoctorCheck {
  category: "environment" | "dependencies" | "credentials" | "connectivity" | "git" | "permissions";
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string;
  fixAction?: () => Promise<boolean> | boolean;
  fixDescription?: string;
}
