import { requestWithRetry } from "../utils/network.js";
import { isBinaryPath } from "../utils/files.js";
import { Push44Error } from "../utils/errors.js";
import type { ProjectFile } from "../types.js";

const GH_API = "https://api.github.com";
const GH_VERSION = "2022-11-28";

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GH_VERSION,
    "Content-Type": "application/json",
    "User-Agent": "Push44-CLI",
  };
}

async function ghFetch<T = any>(token: string, path: string, opts?: RequestInit): Promise<T> {
  const res = await requestWithRetry(`${GH_API}${path}`, {
    ...opts,
    headers: { ...ghHeaders(token), ...((opts?.headers ?? {}) as Record<string, string>) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    if (res.status === 401) {
      throw new Push44Error({
        code: "GH_INVALID_TOKEN",
        message: "GitHub Personal Access Token is invalid or expired.",
        suggestion: "Run `push44 github login` to update your token.",
      });
    }
    if (res.status === 403) {
      throw new Push44Error({
        code: "GH_FORBIDDEN",
        message: "GitHub access denied. Ensure token has `repo` and `user` scopes.",
      });
    }
    if (res.status === 404) {
      throw new Push44Error(`GitHub repository or resource not found: ${path}`);
    }
    throw new Push44Error(`GitHub API error (${res.status}): ${err.message || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubRepoSummary {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  stargazers_count: number;
  updated_at: string;
}

export async function getGitHubUser(token: string): Promise<GitHubUser> {
  const u = await ghFetch(token, "/user");
  const login = u.login as string;
  const id = u.id as number;
  const email = (u.email as string) || `${id}+${login}@users.noreply.github.com`;
  return {
    id,
    login,
    name: (u.name as string) || login,
    email,
    avatar_url: u.avatar_url as string,
  };
}

export async function listGitHubRepos(token: string): Promise<GitHubRepoSummary[]> {
  const all: any[] = [];
  let page = 1;
  while (page <= 5) {
    const batch = await ghFetch(token, `/user/repos?sort=updated&per_page=100&type=all&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  return all.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    default_branch: r.default_branch || "main",
    html_url: r.html_url,
    clone_url: r.clone_url,
    ssh_url: r.ssh_url,
    stargazers_count: r.stargazers_count,
    updated_at: r.updated_at,
  }));
}

export async function createGitHubRepo(
  token: string,
  name: string,
  isPrivate = false,
  description = ""
): Promise<GitHubRepoSummary> {
  const repo = await ghFetch(token, "/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name,
      private: isPrivate,
      auto_init: true,
      description: description || "Exported by Push44 CLI",
    }),
  });

  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    default_branch: repo.default_branch || "main",
    html_url: repo.html_url,
    clone_url: repo.clone_url,
    ssh_url: repo.ssh_url,
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  };
}

export async function getRepoDetails(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubRepoSummary | null> {
  try {
    const r = await ghFetch(token, `/repos/${owner}/${repo}`);
    return {
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      private: r.private,
      default_branch: r.default_branch || "main",
      html_url: r.html_url,
      clone_url: r.clone_url,
      ssh_url: r.ssh_url,
      stargazers_count: r.stargazers_count,
      updated_at: r.updated_at,
    };
  } catch {
    return null;
  }
}

export interface PushOptions {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  files: ProjectFile[];
  filesToDelete?: string[];
  commitMessage: string;
  authorName?: string;
  authorEmail?: string;
  onProgress?: (done: number, total: number) => void;
}

/**
 * Atomic multi-file commit via GitHub Trees API.
 */
export async function pushFilesToGitHub(options: PushOptions): Promise<{ commitSha: string; shortSha: string }> {
  const {
    token,
    owner,
    repo,
    branch,
    files,
    filesToDelete = [],
    commitMessage,
    authorName,
    authorEmail,
    onProgress,
  } = options;

  const repoPath = `/repos/${owner}/${repo}`;
  let baseTreeSha: string | null = null;
  let parentCommitSha: string | null = null;

  try {
    const refData = await ghFetch(token, `${repoPath}/git/refs/heads/${branch}`);
    parentCommitSha = refData.object.sha as string;
    const commitData = await ghFetch(token, `${repoPath}/git/commits/${parentCommitSha}`);
    baseTreeSha = commitData.tree.sha as string;
  } catch {
    // Empty repo or new branch
  }

  const BATCH = 10;
  const treeItems: any[] = [];

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (f) => {
        const isBin = f.binary || isBinaryPath(f.path);
        const encoding = isBin ? "base64" : "utf-8";
        const blob = await ghFetch(token, `${repoPath}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: f.content, encoding }),
        });
        return { path: f.path, mode: "100644", type: "blob", sha: blob.sha as string };
      })
    );

    treeItems.push(...results);
    onProgress?.(Math.min(i + BATCH, files.length), files.length);
  }

  for (const path of filesToDelete) {
    treeItems.push({ path, mode: "100644", type: "blob", sha: null });
  }

  const treeBody: any = { tree: treeItems };
  if (baseTreeSha) treeBody.base_tree = baseTreeSha;

  const tree = await ghFetch(token, `${repoPath}/git/trees`, {
    method: "POST",
    body: JSON.stringify(treeBody),
  });

  const now = new Date().toISOString();
  const authorInfo = authorName && authorEmail ? { name: authorName, email: authorEmail, date: now } : undefined;

  const commitBody: any = {
    message: commitMessage,
    tree: tree.sha,
    ...(authorInfo ? { author: authorInfo, committer: authorInfo } : {}),
  };
  if (parentCommitSha) commitBody.parents = [parentCommitSha];

  const commit = await ghFetch(token, `${repoPath}/git/commits`, {
    method: "POST",
    body: JSON.stringify(commitBody),
  });

  if (parentCommitSha) {
    await ghFetch(token, `${repoPath}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
  } else {
    await ghFetch(token, `${repoPath}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
    });
  }

  return {
    commitSha: commit.sha as string,
    shortSha: (commit.sha as string).slice(0, 7),
  };
}

export async function createReleaseTag(
  token: string,
  owner: string,
  repo: string,
  tag: string,
  name: string,
  body: string
): Promise<{ id: number; html_url: string; tag_name: string }> {
  return ghFetch(token, `/repos/${owner}/${repo}/releases`, {
    method: "POST",
    body: JSON.stringify({
      tag_name: tag,
      name: name || tag,
      body: body || `Automated release ${tag} by Push44 CLI`,
      draft: false,
      prerelease: false,
    }),
  });
}
