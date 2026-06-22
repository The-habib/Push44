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
    throw new Error(err.message ?? `GitHub API error ${res.status}`);
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
  const repos = await ghFetch(
    data.token,
    "/user/repos?sort=updated&per_page=100&type=all"
  );
  return repos.map((r: any) => ({
    id: r.id as number,
    name: r.name as string,
    full_name: r.full_name as string,
    private: r.private as boolean,
    default_branch: r.default_branch as string,
    language: (r.language as string | null) ?? null,
    stargazers_count: r.stargazers_count as number,
    updated_at: r.updated_at as string,
    html_url: r.html_url as string,
  }));
}

export async function createGitHubRepo({ data }: { data: { token: string; name: string; isPrivate: boolean } }) {
  const repo = await ghFetch(data.token, "/user/repos", {
    method: "POST",
    body: JSON.stringify({ name: data.name, private: data.isPrivate, auto_init: true }),
  });
  return {
    full_name: repo.full_name as string,
    default_branch: repo.default_branch as string,
    html_url: repo.html_url as string,
  };
}

export interface FileEntry {
  path: string;
  content: string;
}

export async function pushFilesToGitHub({ data }: { data: { token: string; owner: string; repo: string; branch: string; files: FileEntry[]; commitMessage: string } }) {
  const { token, owner, repo, branch, files, commitMessage } = data;
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

  const treeItems = await Promise.all(
    files.map(async (f) => {
      const blob = await ghFetch(token, `${repoPath}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
      });
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha as string };
    })
  );

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
