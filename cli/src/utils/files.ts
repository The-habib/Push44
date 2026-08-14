import { promises as fs } from "node:fs";
import * as path from "node:path";
import JSZip from "jszip";
import type { ProjectFile } from "../types.js";

/**
 * Sanitize and normalize relative file paths to prevent directory traversal.
 */
export function sanitizeRelativePath(filePath: string): string {
  const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return normalized.replace(/^[/\\]+/, "").replace(/\\/g, "/");
}

/**
 * Write a list of project files to a local target directory.
 */
export async function writeProjectFiles(
  targetDir: string,
  files: ProjectFile[],
  options: { cleanExisting?: boolean } = {}
): Promise<{ written: number; totalBytes: number }> {
  await fs.mkdir(targetDir, { recursive: true });

  let totalBytes = 0;
  let written = 0;

  for (const file of files) {
    const safePath = sanitizeRelativePath(file.path);
    if (!safePath) continue;

    const fullPath = path.join(targetDir, safePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });

    if (file.binary) {
      const buffer = Buffer.from(file.content, "base64");
      await fs.writeFile(fullPath, buffer);
      totalBytes += buffer.length;
    } else {
      const content = typeof file.content === "string" ? file.content : JSON.stringify(file.content, null, 2);
      await fs.writeFile(fullPath, content, "utf-8");
      totalBytes += Buffer.byteLength(content, "utf-8");
    }
    written++;
  }

  return { written, totalBytes };
}

/**
 * Read all files recursively in a directory, skipping node_modules and .git.
 */
export async function readDirectoryFiles(
  baseDir: string,
  currentSubDir = ""
): Promise<ProjectFile[]> {
  const fullCurrentDir = path.join(baseDir, currentSubDir);
  const entries = await fs.readdir(fullCurrentDir, { withFileTypes: true }).catch(() => []);
  const files: ProjectFile[] = [];

  for (const entry of entries) {
    const relName = currentSubDir ? path.join(currentSubDir, entry.name) : entry.name;

    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".push44-cache") {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await readDirectoryFiles(baseDir, relName);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const filePath = path.join(baseDir, relName);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        files.push({
          path: relName.replace(/\\/g, "/"),
          content,
          sizeBytes: Buffer.byteLength(content, "utf-8"),
        });
      } catch {
        // Binary or unreadable file
        const buf = await fs.readFile(filePath);
        files.push({
          path: relName.replace(/\\/g, "/"),
          content: buf.toString("base64"),
          binary: true,
          sizeBytes: buf.length,
        });
      }
    }
  }

  return files;
}

/**
 * Pack project files into a standalone ZIP buffer.
 */
export async function createZipArchive(files: ProjectFile[]): Promise<Buffer> {
  const zip = new JSZip();

  for (const file of files) {
    const safePath = sanitizeRelativePath(file.path);
    if (!safePath) continue;

    if (file.binary) {
      zip.file(safePath, Buffer.from(file.content, "base64"));
    } else {
      zip.file(safePath, file.content);
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return zipBuffer;
}

/**
 * Format bytes into human-readable size.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
