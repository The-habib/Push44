import { getGitStatus, getRemoteUrl } from "./operations.js";
import pc from "picocolors";

export interface GitHealthAudit {
  isRepo: boolean;
  hasRemote: boolean;
  remoteUrl?: string;
  isClean: boolean;
  branch: string;
  hasConflicts: boolean;
  isDetached: boolean;
  issues: string[];
  suggestions: string[];
}

export async function auditGitRepository(cwd = process.cwd()): Promise<GitHealthAudit> {
  const status = await getGitStatus(cwd);
  const remoteUrl = await getRemoteUrl("origin", cwd);

  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!status.isRepo) {
    issues.push("Directory is not a Git repository.");
    suggestions.push("Run `push44 clone <app-id>` or `git init` to initialize.");
    return {
      isRepo: false,
      hasRemote: false,
      isClean: true,
      branch: "",
      hasConflicts: false,
      isDetached: false,
      issues,
      suggestions,
    };
  }

  const isDetached = status.currentBranch === "HEAD" || !status.currentBranch;
  if (isDetached) {
    issues.push("HEAD is detached. Commits will not be linked to any branch.");
    suggestions.push("Run `git checkout -b main` to attach to a valid branch.");
  }

  if (!remoteUrl) {
    issues.push("No remote repository configured (`origin`).");
    suggestions.push("Run `push44 github create` or `git remote add origin <url>`.");
  }

  const hasConflicts = status.modified.some((f) => f.includes("conflict"));
  if (hasConflicts) {
    issues.push("Merge conflicts detected.");
    suggestions.push("Resolve merge conflict markers before running `push44 sync`.");
  }

  if (!status.isClean) {
    issues.push(`Working tree has uncommitted changes (${status.modified.length + status.untracked.length} files).`);
    suggestions.push("Run `push44 sync` to automatically commit and push changes.");
  }

  return {
    isRepo: true,
    hasRemote: Boolean(remoteUrl),
    remoteUrl: remoteUrl || undefined,
    isClean: status.isClean,
    branch: status.currentBranch,
    hasConflicts,
    isDetached,
    issues,
    suggestions,
  };
}
