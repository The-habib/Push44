import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Push44Error } from "../utils/errors.js";

const execFileAsync = promisify(execFile);

export async function hasUncommittedChanges(cwd = process.cwd()): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync("git", ["status", "--porcelain"], { cwd });
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

export async function stashUncommittedChanges(message = "Push44 auto-stash before pull", cwd = process.cwd()): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", ["stash", "push", "-m", message], { cwd });
    if (stdout.includes("No local changes to save")) return null;
    return message;
  } catch {
    return null;
  }
}

export async function popStash(cwd = process.cwd()): Promise<boolean> {
  try {
    await execFileAsync("git", ["stash", "pop"], { cwd });
    return true;
  } catch {
    return false;
  }
}
