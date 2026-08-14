import { describe, expect, it } from "bun:test";
import { computeFilesSnapshot, computeDiff } from "../src/storage/snapshot.js";
import type { ProjectFile } from "../src/types.js";

describe("Snapshot & Diff Calculator", () => {
  it("computes snapshots and detects new, modified, deleted, and unchanged files", () => {
    const originalFiles: ProjectFile[] = [
      { path: "src/App.tsx", content: "console.log('v1')" },
      { path: "package.json", content: "{\"name\":\"app\"}" },
      { path: "docs/old.md", content: "Old docs" },
    ];

    const snapshot = computeFilesSnapshot(originalFiles);
    expect(snapshot.length).toBe(3);

    // Modified state: App.tsx modified, old.md removed, README.md added, package.json unchanged
    const newFiles: ProjectFile[] = [
      { path: "src/App.tsx", content: "console.log('v2')" },
      { path: "package.json", content: "{\"name\":\"app\"}" },
      { path: "README.md", content: "# Hello" },
    ];

    const diffs = computeDiff(newFiles, snapshot);

    const appDiff = diffs.find((d) => d.path === "src/App.tsx");
    const pkgDiff = diffs.find((d) => d.path === "package.json");
    const readmeDiff = diffs.find((d) => d.path === "README.md");
    const oldDiff = diffs.find((d) => d.path === "docs/old.md");

    expect(appDiff?.status).toBe("modified");
    expect(pkgDiff?.status).toBe("unchanged");
    expect(readmeDiff?.status).toBe("new");
    expect(oldDiff?.status).toBe("deleted");
  });
});
