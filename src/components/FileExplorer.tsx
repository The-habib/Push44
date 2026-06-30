import { useState, useMemo, useCallback } from "react";
import {
  X, Search, ChevronRight, ChevronDown, Copy, Check,
  FileText, FileCode, FileJson, FileImage, Folder, FolderOpen,
  Download, File,
} from "lucide-react";

interface FileEntry { path: string; content: string }

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children: TreeNode[];
  fileEntry?: FileEntry;
}

// ── Build tree from flat paths ──────────────────────────────────────────────
function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", type: "dir", children: [] };
  for (const f of files) {
    const parts = f.path.replace(/^\//, "").split("/");
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const isLast = i === parts.length - 1;
      const name = parts[i];
      let child = node.children.find((c) => c.name === name);
      if (!child) {
        child = {
          name,
          path: parts.slice(0, i + 1).join("/"),
          type: isLast ? "file" : "dir",
          children: [],
          fileEntry: isLast ? f : undefined,
        };
        node.children.push(child);
      }
      node = child;
    }
  }
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => sort(n.children));
  };
  sort(root.children);
  return root.children;
}

// ── File extension → icon & colour ─────────────────────────────────────────
function getFileIcon(name: string): { icon: React.ReactNode; color: string } {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext))
    return { icon: <FileCode size={13} />, color: "#3b82f6" };
  if (["json", "jsonc"].includes(ext))
    return { icon: <FileJson size={13} />, color: "#f59e0b" };
  if (["css", "scss", "sass", "less"].includes(ext))
    return { icon: <FileCode size={13} />, color: "#ec4899" };
  if (["md", "mdx", "txt", "rst"].includes(ext))
    return { icon: <FileText size={13} />, color: "#6b7280" };
  if (["html", "htm", "svg", "xml"].includes(ext))
    return { icon: <FileCode size={13} />, color: "#f97316" };
  if (["png", "jpg", "jpeg", "gif", "webp", "ico"].includes(ext))
    return { icon: <FileImage size={13} />, color: "#8b5cf6" };
  if (["py", "rb", "go", "rs", "java", "dart", "kt", "swift", "c", "cpp", "h"].includes(ext))
    return { icon: <FileCode size={13} />, color: "#10b981" };
  if (["sh", "bash", "zsh", "fish"].includes(ext))
    return { icon: <FileCode size={13} />, color: "#64748b" };
  if (["env", "lock", "toml", "yaml", "yml", "ini", "cfg"].includes(ext))
    return { icon: <File size={13} />, color: "#94a3b8" };
  return { icon: <FileText size={13} />, color: "#94a3b8" };
}

function getFolderColor(name: string): string {
  const map: Record<string, string> = {
    src: "#3b82f6", lib: "#10b981", components: "#f97316", pages: "#8b5cf6",
    routes: "#8b5cf6", hooks: "#ec4899", utils: "#f59e0b", styles: "#ec4899",
    api: "#10b981", public: "#6b7280", assets: "#8b5cf6", types: "#3b82f6",
    tests: "#f43f5e", __tests__: "#f43f5e", node_modules: "#94a3b8",
  };
  return map[name] ?? "#f97316";
}

// ── Size helper ─────────────────────────────────────────────────────────────
function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ── Language detection (basic) ──────────────────────────────────────────────
function getLang(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript (React)", js: "JavaScript", jsx: "JavaScript (React)",
    py: "Python", rb: "Ruby", go: "Go", rs: "Rust", java: "Java", dart: "Dart",
    kt: "Kotlin", swift: "Swift", c: "C", cpp: "C++", h: "C Header",
    json: "JSON", yaml: "YAML", yml: "YAML", html: "HTML", css: "CSS", scss: "SCSS",
    md: "Markdown", sh: "Shell", bash: "Bash", toml: "TOML", xml: "XML", svg: "SVG",
  };
  return map[ext] ?? (ext.toUpperCase() || "Plain text");
}

// ── Tree item ───────────────────────────────────────────────────────────────
function TreeItem({
  node, depth, selected, onSelect, openDirs, toggleDir, filterText,
}: {
  node: TreeNode; depth: number; selected: string | null; onSelect: (f: FileEntry) => void;
  openDirs: Set<string>; toggleDir: (p: string) => void; filterText: string;
}) {
  const isOpen = openDirs.has(node.path);
  const isSelected = node.type === "file" && selected === node.path;

  if (node.type === "dir") {
    const matchInChildren = (n: TreeNode): boolean =>
      n.type === "file"
        ? !filterText || n.path.toLowerCase().includes(filterText)
        : n.children.some(matchInChildren);
    if (filterText && !matchInChildren(node)) return null;
    const color = getFolderColor(node.name);
    return (
      <div>
        <button
          onClick={() => toggleDir(node.path)}
          style={{
            display: "flex", alignItems: "center", gap: 5, width: "100%",
            padding: `4px 8px 4px ${8 + depth * 14}px`,
            border: "none", background: "none", cursor: "pointer", textAlign: "left",
            borderRadius: 4, transition: "background 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <span style={{ color: "#94a3b8", flexShrink: 0, width: 12 }}>
            {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
          <span style={{ color, flexShrink: 0 }}>
            {isOpen ? <FolderOpen size={13} /> : <Folder size={13} />}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.name}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#cbd5e1", flexShrink: 0 }}>
            {node.children.length}
          </span>
        </button>
        {isOpen && (
          <div>
            {node.children.map((c) => (
              <TreeItem key={c.path} node={c} depth={depth + 1} selected={selected}
                onSelect={onSelect} openDirs={openDirs} toggleDir={toggleDir} filterText={filterText} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (filterText && !node.path.toLowerCase().includes(filterText)) return null;
  const { icon, color } = getFileIcon(node.name);
  return (
    <button
      onClick={() => node.fileEntry && onSelect(node.fileEntry)}
      style={{
        display: "flex", alignItems: "center", gap: 5, width: "100%",
        padding: `4px 8px 4px ${8 + depth * 14}px`,
        border: "none", cursor: "pointer", textAlign: "left", borderRadius: 4,
        background: isSelected ? "#fff7ed" : "none",
        transition: "background 0.1s",
        borderLeft: isSelected ? "2px solid #f97316" : "2px solid transparent",
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "none"; }}
    >
      <span style={{ color, flexShrink: 0, marginLeft: 12 }}>{icon}</span>
      <span style={{ fontSize: 12, color: isSelected ? "#c2410c" : "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: isSelected ? 600 : 400 }}>
        {node.name}
      </span>
    </button>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
export function FileExplorer({
  files, appName, onClose,
}: {
  files: FileEntry[]; appName: string; onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FileEntry | null>(files[0] ?? null);
  const [copied, setCopied] = useState(false);
  const [openDirs, setOpenDirs] = useState<Set<string>>(() => {
    const s = new Set<string>();
    files.slice(0, 5).forEach((f) => {
      const parts = f.path.split("/");
      parts.pop();
      let p = "";
      parts.forEach((seg) => { p = p ? `${p}/${seg}` : seg; s.add(p); });
    });
    return s;
  });

  const tree = useMemo(() => buildTree(files), [files]);
  const filterText = search.toLowerCase().trim();

  const toggleDir = useCallback((path: string) => {
    setOpenDirs((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }, []);

  const copy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!selected) return;
    const blob = new Blob([selected.content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = selected.path.split("/").pop() ?? "file.txt";
    a.click();
  };

  const totalSize = useMemo(
    () => files.reduce((s, f) => s + new TextEncoder().encode(f.content).length, 0),
    [files]
  );

  const matchCount = filterText
    ? files.filter((f) => f.path.toLowerCase().includes(filterText)).length
    : files.length;

  const selectedName = selected?.path.split("/").pop() ?? "";
  const { color: fileColor } = selected ? getFileIcon(selectedName) : { color: "#94a3b8" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "stretch", justifyContent: "center",
      padding: "env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0)",
    }}>
      <div style={{
        display: "flex", flexDirection: "column", width: "100%", maxWidth: 1100,
        margin: "0 auto", background: "#fafaf9", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
          background: "#fff", flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {appName}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
              {files.length} files · {humanSize(totalSize)}
              {filterText && matchCount !== files.length && (
                <span style={{ color: "#f97316", fontWeight: 600, marginLeft: 6 }}>{matchCount} matches</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "1px solid #e2e8f0", borderRadius: 7, padding: "5px 7px", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", background: "#fff", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "7px 10px 7px 30px", border: "1px solid #e2e8f0",
                borderRadius: 7, fontSize: 12, background: "#f8fafc", outline: "none",
                boxSizing: "border-box",
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Body: tree + viewer */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

          {/* File tree */}
          <div style={{
            width: 240, flexShrink: 0, overflowY: "auto", borderRight: "1px solid #e5e7eb",
            background: "#fafaf9", padding: "6px 4px",
          }}>
            {tree.map((node) => (
              <TreeItem key={node.path} node={node} depth={0} selected={selected?.path ?? null}
                onSelect={setSelected} openDirs={openDirs} toggleDir={toggleDir}
                filterText={filterText} />
            ))}
            {filterText && matchCount === 0 && (
              <div style={{ padding: "20px 12px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
                No files match "{search}"
              </div>
            )}
          </div>

          {/* Viewer */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            {selected ? (
              <>
                {/* File toolbar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                  borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0,
                  flexWrap: "wrap",
                }}>
                  <span style={{ color: fileColor, flexShrink: 0 }}>{getFileIcon(selectedName).icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                    {selected.path}
                  </span>
                  <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontWeight: 500 }}>
                    {getLang(selectedName)}
                  </span>
                  <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>
                    {humanSize(new TextEncoder().encode(selected.content).length)} · {selected.content.split("\n").length} lines
                  </span>
                  <button
                    onClick={downloadFile}
                    title="Download file"
                    style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b", flexShrink: 0 }}
                  >
                    <Download size={12} />
                  </button>
                  <button
                    onClick={copy}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, border: "1px solid #e2e8f0",
                      borderRadius: 6, padding: "4px 8px", background: copied ? "#f0fdf4" : "#f8fafc",
                      cursor: "pointer", fontSize: 11, color: copied ? "#15803d" : "#64748b",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Code view */}
                <div style={{ flex: 1, overflow: "auto", padding: 0, background: "#1e1e2e" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace", fontSize: 12, lineHeight: 1.6 }}>
                    <tbody>
                      {selected.content.split("\n").map((line, i) => (
                        <tr key={i} style={{ verticalAlign: "top" }}>
                          <td style={{
                            userSelect: "none", textAlign: "right", padding: "0 10px 0 14px",
                            color: "#4b5563", minWidth: 40, fontSize: 11, lineHeight: 1.6,
                            borderRight: "1px solid #2d2d3f", background: "#191929",
                            position: "sticky", left: 0,
                          }}>
                            {i + 1}
                          </td>
                          <td style={{ padding: "0 16px 0 12px", whiteSpace: "pre", color: "#e2e8f0", wordBreak: "keep-all" }}>
                            {line || " "}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
                Select a file to view its content
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
