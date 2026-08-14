import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Push44Error } from "../utils/errors.js";

const execFileAsync = promisify(execFile);

async function runGit(args: string[], cwd = process.cwd(), env?: NodeJS.ProcessEnv): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execFileAsync("git", args, { cwd, env: { ...process.env, ...env } });
  } catch (err: any) {
    const message = err.stderr || err.stdout || err.message;
    const error: any = new Push44Error({
      message: `Git command failed (git ${args.join(" ")}): ${message.trim()}`,
      originalError: err,
    });
    error.exitCode = err.code;
    error.stdout = err.stdout;
    error.stderr = err.stderr;
    throw error;
  }
}

export interface GitStatusResult {
  isRepo: boolean;
  currentBranch: string;
  isClean: boolean;
  staged: string[];
  modified: string[];
  untracked: string[];
  deleted: string[];
  ahead: number;
  behind: number;
}

export async function isGitInstalled(): Promise<boolean> {
  try {
    const { stdout } = await runGit(["--version"]);
    return stdout.includes("git version");
  } catch {
    return false;
  }
}

export async function getGitVersion(): Promise<string> {
  try {
    const { stdout } = await runGit(["--version"]);
    return stdout.trim();
  } catch {
    return "Not installed";
  }
}

export async function initGitRepo(cwd = process.cwd(), defaultBranch = "main"): Promise<void> {
  try {
    await runGit(["init", "-b", defaultBranch], cwd);
  } catch {
    await runGit(["init"], cwd);
    try {
      await runGit(["checkout", "-b", defaultBranch], cwd);
    } catch {}
  }
}

export async function getGitStatus(cwd = process.cwd()): Promise<GitStatusResult> {
  try {
    let currentBranch = "HEAD";
    try {
      const { stdout: branchOut } = await runGit(["branch", "--show-current"], cwd);
      currentBranch = branchOut.trim() || "HEAD";
    } catch {}

    const { stdout: statusOut } = await runGit(["status", "--porcelain=v1"], cwd);
    const lines = statusOut.split("\n").filter((l) => l.trim().length > 0);

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];
    const deleted: string[] = [];

    for (const line of lines) {
      const x = line[0];
      const y = line[1];
      const file = line.slice(3).trim();

      if (x === "A" || x === "M" || x === "D") staged.push(file);
      if (y === "M") modified.push(file);
      if (x === "?" || y === "?") untracked.push(file);
      if (x === "D" || y === "D") deleted.push(file);
    }

    let ahead = 0;
    let behind = 0;
    try {
      const { stdout: countOut } = await runGit(
        ["rev-list", "--left-right", "--count", `${currentBranch}...@{u}`],
        cwd
      );
      const [a, b] = countOut.trim().split(/\s+/).map(Number);
      ahead = a || 0;
      behind = b || 0;
    } catch {}

    return {
      isRepo: true,
      currentBranch,
      isClean: lines.length === 0,
      staged,
      modified,
      untracked,
      deleted,
      ahead,
      behind,
    };
  } catch {
    return {
      isRepo: false,
      currentBranch: "",
      isClean: true,
      staged: [],
      modified: [],
      untracked: [],
      deleted: [],
      ahead: 0,
      behind: 0,
    };
  }
}

export async function stageAllFiles(cwd = process.cwd()): Promise<void> {
  await runGit(["add", "-A"], cwd);
}

export async function commitChanges(
  message: string,
  cwd = process.cwd(),
  author?: { name: string; email: string }
): Promise<string> {
  const env: Record<string, string> = {};
  if (author) {
    env.GIT_AUTHOR_NAME = author.name;
    env.GIT_AUTHOR_EMAIL = author.email;
    env.GIT_COMMITTER_NAME = author.name;
    env.GIT_COMMITTER_EMAIL = author.email;
  }

  await runGit(["commit", "-m", message], cwd, env);
  const { stdout } = await runGit(["rev-parse", "HEAD"], cwd);
  return stdout.trim();
}

export async function getRemoteUrl(name = "origin", cwd = process.cwd()): Promise<string | null> {
  try {
    const { stdout } = await runGit(["remote", "get-url", name], cwd);
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function setRemoteUrl(name = "origin", url: string, cwd = process.cwd()): Promise<void> {
  try {
    await runGit(["remote", "set-url", name, url], cwd);
  } catch {
    await runGit(["remote", "add", name, url], cwd);
  }
}

export async function pushToRemote(
  remote = "origin",
  branch = "main",
  cwd = process.cwd(),
  force = false
): Promise<void> {
  const args = ["push", "-u", remote, branch];
  if (force) args.push("--force");

  await runGit(args, cwd);
}
