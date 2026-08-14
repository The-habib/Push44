import { simpleHash } from "../utils/crypto.js";
import type { ProjectFile, FileDiffItem, DiffStatus } from "../types.js";

export interface FileSnapshotEntry {
  path: string;
  hash: string;
}

export function computeFilesSnapshot(files: ProjectFile[]): FileSnapshotEntry[] {
  return files.map((f) => ({
    path: f.path,
    hash: simpleHash(f.content),
  }));
}

export function computeDiff(
  currentFiles: ProjectFile[],
  previousSnapshot?: FileSnapshotEntry[]
): FileDiffItem[] {
  const result: FileDiffItem[] = [];

  if (!previousSnapshot || previousSnapshot.length === 0) {
    for (const f of currentFiles) {
      result.push({
        path: f.path,
        status: "new",
        newContent: f.content,
        newSize: f.sizeBytes ?? f.content.length,
      });
    }
    return result;
  }

  const prevMap = new Map<string, string>(previousSnapshot.map((p) => [p.path, p.hash]));
  const currentMap = new Map<string, ProjectFile>(currentFiles.map((f) => [f.path, f]));

  // Check current files vs previous
  for (const f of currentFiles) {
    const prevHash = prevMap.get(f.path);
    const currHash = simpleHash(f.content);

    if (!prevHash) {
      result.push({
        path: f.path,
        status: "new",
        newContent: f.content,
        newSize: f.sizeBytes ?? f.content.length,
      });
    } else if (prevHash !== currHash) {
      result.push({
        path: f.path,
        status: "modified",
        newContent: f.content,
        newSize: f.sizeBytes ?? f.content.length,
      });
    } else {
      result.push({
        path: f.path,
        status: "unchanged",
        newContent: f.content,
        newSize: f.sizeBytes ?? f.content.length,
      });
    }
  }

  // Check for deleted files
  for (const prev of previousSnapshot) {
    if (!currentMap.has(prev.path)) {
      result.push({
        path: prev.path,
        status: "deleted",
      });
    }
  }

  return result.sort((a, b) => a.path.localeCompare(b.path));
}
