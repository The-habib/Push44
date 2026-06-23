---
name: Push44 Version Control Features
description: Patterns used for the 6 version-control features added in the big build session.
---

## Features Built

- **FileDiffViewer** (`src/components/FileDiffViewer.tsx`) — LCS-based unified diff, capped at 300 lines, Uint16Array DP table, collapse/expand, context hide toggle.
- **Deleted-files staging** — `StagingBrowser` receives `deletedPaths: Set<string>` + `onDeletedPathsChange`. Deleted file list derived from `diffMap` where status==="deleted". Each row has its own checkbox toggling the path in/out of `deletedPaths`.
- **Inline diff** — `expandedDiffPath` state in PushPage, toggled per file. Deleted file diffs keyed `__del__${path}`.
- **ZIP export** — JSZip, iterates `stagedFiles`, `DEFLATE` level 6, `URL.createObjectURL`.
- **Test buttons** (settings.tsx) — `TestResult = "idle"|"loading"|"ok"|"fail"`, auto-resets after 4 s with `setTimeout`.
- **Re-push** (history.tsx → push.tsx) — sessionStorage keys: `p44_platform`, `p44_repush_appName`, `p44_repo` (JSON of `{full_name, default_branch, html_url}`). push.tsx reads `p44_repush_appName` on mount, waits for apps to load, finds by name.
- **Quick-push tile** (dashboard.tsx) — same sessionStorage keys as above, placed after last-push card.

## Critical Correctness Fix
`saveAppSnapshot` in `handlePush` must save all `files`, NOT just `stagedFiles`. Saving only staged files corrupts future diffs (unstaged files appear as "new" on the next load).

**Why:** The snapshot represents the full app state after the push. Partial snapshots break the diff baseline.
