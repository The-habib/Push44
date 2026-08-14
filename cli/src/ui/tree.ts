import pc from "picocolors";
import * as path from "node:path";
import type { ProjectFile } from "../types.js";

function getFileIcon(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();

  if (base === "package.json") return pc.magenta("📦");
  if (base === "tsconfig.json") return pc.blue("⚙️");
  if (base === "readme.md") return pc.yellow("📝");
  if (base === ".gitignore") return pc.dim("🙈");
  if (base === ".push44.json") return pc.cyan("✦");
  if (ext === ".tsx" || ext === ".jsx") return pc.cyan("⚛");
  if (ext === ".ts" || ext === ".js" || ext === ".mjs") return pc.blue("λ");
  if (ext === ".css" || ext === ".scss") return pc.magenta("🎨");
  if (ext === ".html") return pc.red("🌐");
  if (ext === ".json") return pc.yellow("{ }");
  if (ext === ".dart") return pc.cyan("🎯");
  if (ext === ".md") return pc.yellow("📄");
  if (ext === ".png" || ext === ".jpg" || ext === ".webp" || ext === ".svg") return pc.green("🖼️");
  return pc.dim("📄");
}

interface TreeNode {
  name: string;
  isDir: boolean;
  children: Map<string, TreeNode>;
}

export function renderFileTree(files: ProjectFile[], maxDepth = 4, maxItems = 40): string {
  const root: TreeNode = { name: "root", isDir: true, children: new Map() };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          isDir: !isLast,
          children: new Map(),
        });
      }
      current = current.children.get(part)!;
    }
  }

  const lines: string[] = [];
  let count = 0;

  function traverse(node: TreeNode, prefix = "", depth = 0) {
    if (depth > maxDepth || count >= maxItems) return;

    const entries = Array.from(node.children.values()).sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < entries.length; i++) {
      if (count >= maxItems) {
        lines.push(`${prefix}└── ${pc.dim(`... (${files.length - count} more files)`)}`);
        break;
      }

      const child = entries[i];
      const isLast = i === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      if (child.isDir) {
        lines.push(`${prefix}${connector}${pc.bold(pc.blue(`📁 ${child.name}/`))}`);
        traverse(child, childPrefix, depth + 1);
      } else {
        const icon = getFileIcon(child.name);
        lines.push(`${prefix}${connector}${icon} ${pc.white(child.name)}`);
        count++;
      }
    }
  }

  traverse(root, "", 0);
  return lines.join("\n");
}
