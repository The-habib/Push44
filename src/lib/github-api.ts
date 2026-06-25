const GH = "https://api.github.com";

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function ghFetch(token: string, path: string, opts?: RequestInit) {
  const res = await fetch(`${GH}${path}`, {
    ...opts,
    headers: { ...ghHeaders(token), ...(opts?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    if (res.status === 401) {
      throw Object.assign(new Error("Your GitHub token is invalid or has expired. Please update it in Settings."), { status: 401 });
    }
    if (res.status === 403) {
      throw Object.assign(new Error("GitHub access denied. Make sure your token includes the 'repo' permission scope."), { status: 403 });
    }
    if (res.status === 404) {
      throw new Error("Not found on GitHub. The repository may have been deleted or you may not have access to it.");
    }
    if (res.status === 409) {
      throw new Error("A conflict occurred while writing to GitHub. The branch may have been updated by another push — please try again.");
    }
    if (res.status === 422) {
      const raw: string = String(err.message ?? "");
      if (raw.toLowerCase().includes("already exists") || raw.toLowerCase().includes("name already")) {
        throw new Error("A repository with that name already exists on GitHub. Please choose a different name.");
      }
      throw new Error("GitHub rejected the request. Check that the repository name is valid and try again.");
    }
    if (res.status >= 500) {
      throw new Error("GitHub is experiencing server issues. Please try again in a moment.");
    }
    throw new Error(String(err.message ?? "An unexpected error occurred with GitHub. Please try again."));
  }
  return res.json();
}

export async function getGitHubUser({ data }: { data: { token: string } }) {
  const user = await ghFetch(data.token, "/user");
  return {
    login: user.login as string,
    name: (user.name as string) || user.login,
    avatar_url: user.avatar_url as string,
    email: user.email as string,
  };
}

export async function listGitHubRepos({ data }: { data: { token: string } }) {
  const repos = await ghFetch(data.token, "/user/repos?sort=updated&per_page=100&type=all");
  return repos
    .filter((r: any) => r?.full_name?.trim())
    .map((r: any) => ({
      id: r.id as number,
      name: r.name as string,
      full_name: r.full_name as string,
      private: r.private as boolean,
      default_branch: (r.default_branch as string) || "main",
      language: (r.language as string | null) ?? null,
      stargazers_count: r.stargazers_count as number,
      updated_at: r.updated_at as string,
      html_url: r.html_url as string,
    }));
}

export async function createGitHubRepo({ data }: { data: { token: string; name: string; isPrivate: boolean; description?: string } }) {
  const repo = await ghFetch(data.token, "/user/repos", {
    method: "POST",
    body: JSON.stringify({ name: data.name, private: data.isPrivate, auto_init: true, description: data.description ?? "" }),
  });
  return {
    full_name: repo.full_name as string,
    default_branch: repo.default_branch as string,
    html_url: repo.html_url as string,
  };
}

export async function getRepoDetails({ data }: { data: { token: string; owner: string; repo: string } }) {
  const r = await ghFetch(data.token, `/repos/${data.owner}/${data.repo}`);
  return {
    id: r.id as number,
    name: r.name as string,
    full_name: r.full_name as string,
    description: (r.description as string | null) ?? null,
    private: r.private as boolean,
    html_url: r.html_url as string,
    clone_url: r.clone_url as string,
    ssh_url: r.ssh_url as string,
    default_branch: r.default_branch as string,
    stargazers_count: r.stargazers_count as number,
    forks_count: r.forks_count as number,
    watchers_count: r.watchers_count as number,
    open_issues_count: r.open_issues_count as number,
    size: r.size as number,
    language: (r.language as string | null) ?? null,
    topics: (r.topics as string[]) ?? [],
    license: (r.license?.spdx_id as string | null) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    pushed_at: r.pushed_at as string,
  };
}

export async function getRepoLanguages({ data }: { data: { token: string; owner: string; repo: string } }) {
  const langs = await ghFetch(data.token, `/repos/${data.owner}/${data.repo}/languages`);
  const total = Object.values(langs as Record<string, number>).reduce((s: number, v) => s + (v as number), 0);
  return Object.entries(langs as Record<string, number>).map(([name, bytes]) => ({
    name,
    bytes: bytes as number,
    pct: total > 0 ? Math.round(((bytes as number) / total) * 1000) / 10 : 0,
  }));
}

export async function getRepoCommits({ data }: { data: { token: string; owner: string; repo: string; per_page?: number; page?: number } }) {
  const commits = await ghFetch(
    data.token,
    `/repos/${data.owner}/${data.repo}/commits?per_page=${data.per_page ?? 10}&page=${data.page ?? 1}`
  );
  return (commits as any[]).map((c) => ({
    sha: c.sha as string,
    message: (c.commit.message as string).split("\n")[0],
    author: (c.commit.author?.name as string) ?? "Unknown",
    date: c.commit.author?.date as string,
    html_url: c.html_url as string,
  }));
}

export async function getRepoContributors({ data }: { data: { token: string; owner: string; repo: string } }) {
  const list = await ghFetch(data.token, `/repos/${data.owner}/${data.repo}/contributors?per_page=5`).catch(() => []);
  return (list as any[]).map((c) => ({
    login: c.login as string,
    avatar_url: c.avatar_url as string,
    contributions: c.contributions as number,
    html_url: c.html_url as string,
  }));
}

export async function listRepoBranches({ data }: { data: { token: string; owner: string; repo: string } }) {
  const branches = await ghFetch(data.token, `/repos/${data.owner}/${data.repo}/branches?per_page=100`).catch(() => []);
  return (branches as any[]).map((b) => ({
    name: b.name as string,
    sha: b.commit?.sha as string ?? "",
    protected: b.protected as boolean ?? false,
  }));
}

export async function createRepoBranch({ data }: { data: { token: string; owner: string; repo: string; branchName: string; fromBranch: string } }) {
  const ref = await ghFetch(data.token, `/repos/${data.owner}/${data.repo}/git/refs/heads/${data.fromBranch}`);
  const sha = ref.object.sha as string;
  await ghFetch(data.token, `/repos/${data.owner}/${data.repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${data.branchName}`, sha }),
  });
  return { name: data.branchName, sha };
}

export async function deleteRepoBranch({ data }: { data: { token: string; owner: string; repo: string; branchName: string } }) {
  const res = await fetch(`${GH}/repos/${data.owner}/${data.repo}/git/refs/heads/${data.branchName}`, {
    method: "DELETE",
    headers: ghHeaders(data.token),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Your GitHub token is invalid or has expired. Please update it in Settings.");
    if (res.status === 403) throw new Error("You don't have permission to delete this branch.");
    if (res.status === 404) throw new Error("Branch not found — it may have already been deleted.");
    if (res.status === 422) throw new Error("This branch is protected and cannot be deleted.");
    throw new Error("Could not delete the branch. Please try again.");
  }
}

export async function getCommitFiles({ data }: { data: { token: string; owner: string; repo: string; sha: string } }) {
  const commit = await ghFetch(data.token, `/repos/${data.owner}/${data.repo}/commits/${data.sha}`);
  return {
    sha: commit.sha as string,
    message: commit.commit.message as string,
    author: commit.commit.author?.name as string ?? "Unknown",
    date: commit.commit.author?.date as string,
    html_url: commit.html_url as string,
    stats: {
      additions: (commit.stats?.additions as number) ?? 0,
      deletions: (commit.stats?.deletions as number) ?? 0,
      total: (commit.stats?.total as number) ?? 0,
    },
    files: ((commit.files as any[]) ?? []).map((f: any) => ({
      filename: f.filename as string,
      status: f.status as "added" | "modified" | "removed" | "renamed",
      additions: f.additions as number,
      deletions: f.deletions as number,
      changes: f.changes as number,
    })),
  };
}

export interface FileEntry {
  path: string;
  content: string;
}

export async function pushFilesToGitHub({ data }: {
  data: {
    token: string;
    owner: string;
    repo: string;
    branch: string;
    files: FileEntry[];
    filesToDelete?: string[];
    commitMessage: string;
    onProgress?: (done: number, total: number) => void;
  }
}) {
  const { token, owner, repo, branch, files, filesToDelete = [], commitMessage, onProgress } = data;
  const repoPath = `/repos/${owner}/${repo}`;
  let baseTreeSha: string | null = null;
  let parentCommitSha: string | null = null;

  try {
    const refData = await ghFetch(token, `${repoPath}/git/refs/heads/${branch}`);
    parentCommitSha = refData.object.sha as string;
    const commitData = await ghFetch(token, `${repoPath}/git/commits/${parentCommitSha}`);
    baseTreeSha = commitData.tree.sha as string;
  } catch {
    // Branch or repo may be empty — will create fresh
  }

  const BATCH = 10;
  const treeItems: any[] = [];
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const blobs = await Promise.all(
      batch.map(async (f) => {
        const blob = await ghFetch(token, `${repoPath}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
        });
        return { path: f.path, mode: "100644", type: "blob", sha: blob.sha as string };
      })
    );
    treeItems.push(...blobs);
    onProgress?.(Math.min(i + BATCH, files.length), files.length);
  }

  // Deletions: null sha removes the file from the tree
  for (const path of filesToDelete) {
    treeItems.push({ path, mode: "100644", type: "blob", sha: null });
  }

  const treeBody: any = { tree: treeItems };
  if (baseTreeSha) treeBody.base_tree = baseTreeSha;
  const tree = await ghFetch(token, `${repoPath}/git/trees`, {
    method: "POST",
    body: JSON.stringify(treeBody),
  });

  const commitBody: any = { message: commitMessage, tree: tree.sha };
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
