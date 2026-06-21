---
name: GitHub Trees API Push
description: Bulk multi-file commit pattern using GitHub's Trees API; handles both existing and empty/new repos
---

## Why Trees API
GitHub's Trees API creates a single commit for any number of files in one round trip, instead of making a separate API call per file. For 87 files this is critical for performance.

## The 7-Step Flow (existing repo/branch)
```
1. GET  /repos/{owner}/{repo}/git/refs/heads/{branch}    → parentCommitSha
2. GET  /repos/{owner}/{repo}/git/commits/{parentSha}    → baseTreeSha
3. POST /repos/{owner}/{repo}/git/blobs  (×N, parallel)  → blob SHAs
4. POST /repos/{owner}/{repo}/git/trees                  → newTreeSha
5. POST /repos/{owner}/{repo}/git/commits                → newCommitSha
6. PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}   → update ref
```

## Empty / New Repo Handling
Steps 1-2 will throw (no HEAD yet). Catch the error, set `parentCommitSha = null` and `baseTreeSha = null`.
- In step 4: omit `base_tree` field from tree body
- In step 6: use `POST /git/refs` with `{ ref: "refs/heads/{branch}", sha: commit.sha }` instead of PATCH

## How to Apply
See `src/lib/github-api.ts` → `pushFilesToGitHub` server function for the full implementation. Any changes to how files are pushed should follow this pattern. The parallel blob creation (`Promise.all`) is important for speed with large file sets.

## Required GitHub PAT Scopes
`repo` scope is required (gives access to create commits, blobs, trees, and refs on both public and private repos). Fine-grained tokens need "Contents: Read and Write".
