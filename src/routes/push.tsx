import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, GitBranch, FileText, Lock, MessageSquare, Loader2,
  Plus, Check, AlertCircle, ExternalLink, ChevronDown,
  File, FileCode2, FileJson, Image, Braces, AlertTriangle,
  Minus, UploadCloud, RefreshCw, Archive, Smartphone, Download,
} from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo } from "@/components/BrandLogos";
import { RocketModal } from "@/components/RocketModal";
import { FileDiffViewer } from "@/components/FileDiffViewer";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps, fetchBase44AppFiles } from "@/lib/base44-api";
import {
  listRocketApps, fetchRocketAppFiles,
  checkRocketApkBuildStatus, triggerRocketApkBuild, downloadRocketApk,
  APK_STATUS, type ApkBuildState,
} from "@/lib/rocket-api";
import {
  listGitHubRepos, createGitHubRepo, pushFilesToGitHub,
  listRepoBranches, createRepoBranch,
} from "@/lib/github-api";
import {
  addHistory, getAppSnapshot, saveAppSnapshot, computeFileDiff,
  getDeletedPaths, getSnapshotFileContent,
  type DiffStatus,
} from "@/lib/storage";
import { Toaster, toast } from "sonner";
import JSZip from "jszip";

export const Route = createFileRoute("/push")({
  head: () => ({
    meta: [
      { title: "Push to GitHub · Push44" },
      { name: "description", content: "Select a Base44 or Rocket.new app, pick a GitHub repo and push all source files in one atomic commit." },
    ],
  }),
  component: PushPage,
});

type Platform = "base44" | "rocket";
interface App  { id: string; applicationId?: string; name: string; updated_at: string; icon?: string }
interface Repo { full_name: string; default_branch: string; html_url: string }
interface Branch { name: string; sha: string; protected: boolean }
interface FileEntry { path: string; content: string }
type PushStatus = "idle" | "pushing" | "done" | "error";

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <motion.div
      className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
      animate={{ background: done ? "#22c55e" : active ? "#f97316" : "#f0ece4", color: done || active ? "#fff" : "#9a8880" }}
      transition={{ duration: 0.2 }}
    >
      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
    </motion.div>
  );
}

function SectionShell({ step, label, active, done, children }: { step: number; label: string; active: boolean; done: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      className="bg-white rounded-[24px] border mb-3 overflow-hidden"
      animate={{ borderColor: active ? "rgba(249,115,22,0.3)" : "#f0ece4" }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f7f4f0]">
        <StepBadge n={step} active={active} done={done} />
        <span className="text-[14px] font-black text-[#1a1a1a]">{label}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

function fileIcon(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (["tsx", "jsx"].includes(ext)) return { Icon: FileCode2, color: "#06b6d4" };
  if (["ts", "js", "mjs"].includes(ext)) return { Icon: FileCode2, color: "#f59e0b" };
  if (ext === "json") return { Icon: FileJson, color: "#10b981" };
  if (["css", "scss", "sass"].includes(ext)) return { Icon: Braces, color: "#a855f7" };
  if (["md", "mdx", "txt"].includes(ext)) return { Icon: FileText, color: "#6b7280" };
  if (["png", "jpg", "jpeg", "svg", "webp", "gif", "ico"].includes(ext)) return { Icon: Image, color: "#f97316" };
  return { Icon: File, color: "#9a8880" };
}

function DiffDot({ status }: { status: DiffStatus | undefined }) {
  if (status === "new")     return <span className="h-2 w-2 rounded-full bg-[#22c55e] shrink-0" title="New file" />;
  if (status === "modified") return <span className="h-2 w-2 rounded-full bg-[#f59e0b] shrink-0" title="Modified" />;
  if (status === "deleted")  return <span className="h-2 w-2 rounded-full bg-[#ef4444] shrink-0" title="Deleted" />;
  return                           <span className="h-2 w-2 rounded-full bg-[#d4ccc4] shrink-0" title="Unchanged" />;
}

function StagingBrowser({
  files, diffMap, stagedPaths, onChange, hasSnapshot,
  deletedPaths, onDeletedPathsChange, appId,
  expandedDiffPath, onToggleDiff,
}: {
  files: FileEntry[];
  diffMap: Map<string, DiffStatus>;
  stagedPaths: Set<string>;
  onChange: (paths: Set<string>) => void;
  hasSnapshot: boolean;
  deletedPaths: Set<string>;
  onDeletedPathsChange: (paths: Set<string>) => void;
  appId: string | null;
  expandedDiffPath: string | null;
  onToggleDiff: (path: string) => void;
}) {
  const newCount       = files.filter(f => diffMap.get(f.path) === "new").length;
  const modifiedCount  = files.filter(f => diffMap.get(f.path) === "modified").length;
  const unchangedCount = files.filter(f => diffMap.get(f.path) === "unchanged").length;
  const deletedCount   = deletedPaths.size;
  const stagedCount    = stagedPaths.size;
  const stagedDeletions = deletedCount; // all deletedPaths are staged

  const toggleFile = (path: string) => {
    const next = new Set(stagedPaths);
    if (next.has(path)) next.delete(path); else next.add(path);
    onChange(next);
  };

  const toggleDeletion = (path: string) => {
    const next = new Set(deletedPaths);
    if (next.has(path)) next.delete(path); else next.add(path);
    onDeletedPathsChange(next);
  };

  const sorted = [...files].sort((a, b) => {
    const order: Record<DiffStatus, number> = { new: 0, modified: 1, unchanged: 2, deleted: 3 };
    const da = diffMap.get(a.path) ?? "unchanged";
    const db = diffMap.get(b.path) ?? "unchanged";
    return (order[da] - order[db]) || a.path.localeCompare(b.path);
  });

  // Deleted file paths as virtual file entries
  const deletedFileList = [...diffMap.entries()]
    .filter(([, s]) => s === "deleted")
    .map(([p]) => p)
    .sort();

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
      <div className="bg-white rounded-[22px] border border-[#f0ece4] overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>

        {/* Header */}
        <div className="px-4 py-3 border-b border-[#f5f2ee]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-[13px] font-black text-[#1a1a1a]">
                {stagedCount} / {files.length} staged
                {stagedDeletions > 0 && <span className="text-[#ef4444]"> · {stagedDeletions} deleted</span>}
              </span>
            </div>
            <span className="text-[11px] text-[#9a8880] font-medium">
              {files.reduce((a, f) => a + f.content.split("\n").length, 0).toLocaleString()} lines
            </span>
          </div>

          {/* Diff summary pills */}
          {hasSnapshot && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {newCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#22c55e] border border-[#bbf7d0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />{newCount} new
                </span>
              )}
              {modifiedCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />{modifiedCount} modified
                </span>
              )}
              {unchangedCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faf7f3] text-[#9a8880] border border-[#f0ece4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4ccc4]" />{unchangedCount} unchanged
                </span>
              )}
              {deletedCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#ef4444] border border-[#fecaca]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />{deletedCount} deleted
                </span>
              )}
            </div>
          )}

          {/* Quick-stage buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onChange(new Set(files.map(f => f.path)))}
              className="text-[10px] font-bold text-[#f97316] bg-[#fff4ed] rounded-full px-2.5 py-1 border border-[#f97316]/20"
            >
              Stage all
            </button>
            {hasSnapshot && (newCount + modifiedCount) > 0 && (
              <button
                onClick={() => onChange(new Set(files.filter(f => diffMap.get(f.path) !== "unchanged").map(f => f.path)))}
                className="text-[10px] font-bold text-[#d97706] bg-[#fffbeb] rounded-full px-2.5 py-1 border border-[#fde68a]"
              >
                Changes only
              </button>
            )}
            <button
              onClick={() => onChange(new Set())}
              className="text-[10px] font-bold text-[#9a8880] bg-[#faf7f3] rounded-full px-2.5 py-1 border border-[#f0ece4]"
            >
              Deselect all
            </button>
          </div>
        </div>

        {/* File list */}
        <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
          {/* Regular files */}
          {sorted.map((file, i) => {
            const { Icon, color } = fileIcon(file.path);
            const parts = file.path.split("/");
            const name  = parts.pop() ?? file.path;
            const dir   = parts.join("/");
            const staged = stagedPaths.has(file.path);
            const status = diffMap.get(file.path);
            const isExpanded = expandedDiffPath === file.path;
            const oldContent = (status === "modified" || status === "unchanged") && appId
              ? getSnapshotFileContent(appId, file.path)
              : null;
            const showDiff = (status === "new" || status === "modified") && isExpanded;

            return (
              <div key={file.path}>
                <motion.div
                  onClick={() => {
                    toggleFile(file.path);
                  }}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.008, 0.25), duration: 0.18 }}
                  className="flex items-center gap-2.5 px-4 py-2 border-b border-[#f9f7f5] last:border-0 cursor-pointer select-none"
                  style={{ opacity: staged ? 1 : 0.4 }}
                >
                  {/* Checkbox */}
                  <div
                    className="h-4 w-4 rounded-[4px] border-2 flex items-center justify-center shrink-0"
                    style={{ background: staged ? "#f97316" : "transparent", borderColor: staged ? "#f97316" : "#d4ccc4" }}
                  >
                    {staged && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                  </div>
                  <DiffDot status={status} />
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#1a1a1a] truncate">{name}</div>
                    {dir && <div className="text-[10px] text-[#9a8880] truncate">{dir}/</div>}
                  </div>
                  <span className="text-[10px] text-[#b5afa8] shrink-0 font-mono">{file.content.split("\n").length}L</span>
                  {/* Diff toggle (new or modified files only) */}
                  {hasSnapshot && (status === "new" || status === "modified") && (
                    <button
                      onClick={e => { e.stopPropagation(); onToggleDiff(file.path); }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ml-1"
                      style={{
                        background: isExpanded ? "#fff4ed" : "#faf7f3",
                        borderColor: isExpanded ? "#f97316" : "#e8e3db",
                        color: isExpanded ? "#f97316" : "#9a8880",
                      }}
                    >
                      diff
                    </button>
                  )}
                </motion.div>
                {/* Inline diff */}
                {showDiff && (
                  <motion.div
                    className="px-4 pb-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <FileDiffViewer
                      filename={file.path}
                      oldContent={oldContent}
                      newContent={file.content}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Deleted files */}
          {deletedFileList.map((path, i) => {
            const { Icon, color } = fileIcon(path);
            const parts = path.split("/");
            const name  = parts.pop() ?? path;
            const dir   = parts.join("/");
            const isStaged = deletedPaths.has(path);
            const isExpanded = expandedDiffPath === `__del__${path}`;
            const oldContent = appId ? getSnapshotFileContent(appId, path) : null;

            return (
              <div key={`del-${path}`}>
                <motion.div
                  onClick={() => toggleDeletion(path)}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min((sorted.length + i) * 0.008, 0.3), duration: 0.18 }}
                  className="flex items-center gap-2.5 px-4 py-2 border-b border-[#f9f7f5] last:border-0 cursor-pointer select-none"
                  style={{
                    background: isStaged ? "rgba(239,68,68,0.03)" : undefined,
                    opacity: isStaged ? 1 : 0.4,
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className="h-4 w-4 rounded-[4px] border-2 flex items-center justify-center shrink-0"
                    style={{ background: isStaged ? "#ef4444" : "transparent", borderColor: isStaged ? "#ef4444" : "#d4ccc4" }}
                  >
                    {isStaged && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                  </div>
                  <DiffDot status="deleted" />
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-50" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#ef4444] truncate line-through">{name}</div>
                    {dir && <div className="text-[10px] text-[#9a8880] truncate">{dir}/</div>}
                  </div>
                  <span className="text-[9px] font-bold text-[#ef4444] bg-[#fef2f2] rounded-md px-1.5 py-0.5 border border-[#fecaca] shrink-0">deleted</span>
                  {oldContent && (
                    <button
                      onClick={e => { e.stopPropagation(); onToggleDiff(`__del__${path}`); }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ml-1"
                      style={{
                        background: isExpanded ? "#fef2f2" : "#faf7f3",
                        borderColor: isExpanded ? "#ef4444" : "#e8e3db",
                        color: isExpanded ? "#ef4444" : "#9a8880",
                      }}
                    >
                      diff
                    </button>
                  )}
                </motion.div>
                {/* Deleted file diff */}
                {isExpanded && oldContent && (
                  <motion.div
                    className="px-4 pb-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <FileDiffViewer
                      filename={path}
                      oldContent={oldContent}
                      newContent={null}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function BranchSelector({
  branches, loading, current, onSelect, onCreate, disabled,
}: {
  branches: Branch[];
  loading: boolean;
  current: string;
  onSelect: (name: string) => void;
  onCreate: (name: string, from: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen]         = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");

  const handleCreate = () => {
    const trimmed = newName.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._/-]/g, "");
    if (!trimmed) return;
    onCreate(trimmed, current);
    setNewName(""); setCreating(false); setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        className="flex items-center gap-2 w-full text-left rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-3.5 py-2.5 text-[13px] font-bold text-[#1a1a1a]"
        disabled={disabled}
      >
        <GitBranch className="h-3.5 w-3.5 text-[#9a8880] shrink-0" />
        <span className="flex-1 truncate">{current || "Select branch"}</span>
        {loading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9a8880] shrink-0" />
          : <ChevronDown className="h-3.5 w-3.5 text-[#9a8880] shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 right-0 z-40 mt-1 rounded-2xl border border-[#f0ece4] bg-white overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {branches.map(b => (
                <button
                  key={b.name}
                  onClick={() => { onSelect(b.name); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-[#faf7f3] transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5 text-[#9a8880] shrink-0" />
                  <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1 truncate">{b.name}</span>
                  {b.name === current && <Check className="h-3.5 w-3.5 text-[#f97316] shrink-0" />}
                  {b.protected && <Lock className="h-3 w-3 text-[#c8b8a2] shrink-0" />}
                </button>
              ))}
            </div>

            <div className="border-t border-[#f5f2ee] p-2">
              {creating ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                    placeholder={`from ${current}`}
                    className="flex-1 text-[12px] rounded-lg border border-[#f0ece4] bg-[#faf7f3] px-2.5 py-1.5 outline-none font-semibold placeholder:text-[#c8b8a2]"
                  />
                  <button onClick={handleCreate} className="text-[11px] font-bold bg-[#f97316] text-white rounded-lg px-2.5 py-1.5">Create</button>
                  <button onClick={() => setCreating(false)} className="text-[11px] text-[#9a8880] px-2">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-[12px] font-bold text-[#f97316] hover:bg-[#fff4ed] rounded-xl transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />New branch…
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TokenExpiredBanner({ type, onFix }: { type: "github" | "platform"; onFix: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-3 border border-[#fecaca] bg-[#fef2f2]"
    >
      <AlertTriangle className="h-4 w-4 text-[#ef4444] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#991b1b]">
          {type === "github" ? "GitHub token expired or invalid" : "Platform token expired"}
        </div>
        <div className="text-[11px] text-[#b91c1c]/70 mt-0.5">Please reconnect in Settings.</div>
      </div>
      <button onClick={onFix} className="text-[11px] font-bold text-[#ef4444] bg-white rounded-full px-3 py-1.5 border border-[#fecaca] shrink-0">
        Fix →
      </button>
    </motion.div>
  );
}

const ROCKET_COLOR   = "#7f22fe";
const ROCKET_GRAD    = "linear-gradient(135deg,#9810fa,#7008e7)";
const ROCKET_LIGHT   = "#f5f3ff";
const ROCKET_BORDER  = "#ede9fe";
const ROCKET_TEXT    = "#6e11b0";

function AppIcon({ icon, platform, size = 36 }: { icon?: string; platform: Platform; size?: number }) {
  const isUrl   = typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("data:"));
  const isEmoji = typeof icon === "string" && icon.length > 0 && icon.length <= 4 && !isUrl;

  if (isUrl) {
    return (
      <div className="rounded-xl shrink-0 overflow-hidden border border-black/[0.06] bg-[#f5f2ee]" style={{ width: size, height: size }} aria-hidden="true">
        <img src={icon} alt="" width={size} height={size} className="w-full h-full object-cover" />
      </div>
    );
  }
  if (isEmoji) {
    return (
      <div
        className="rounded-xl shrink-0 flex items-center justify-center border border-black/[0.05]"
        style={{ width: size, height: size, background: platform === "rocket" ? ROCKET_LIGHT : "#fff4ed", fontSize: Math.round(size * 0.52), lineHeight: 1 }}
        aria-hidden="true"
      >
        {icon}
      </div>
    );
  }
  return (
    <div
      className="rounded-xl shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, background: platform === "rocket" ? ROCKET_GRAD : "linear-gradient(135deg,#fb923c,#f97316)" }}
      aria-hidden="true"
    >
      {platform === "rocket"
        ? <RocketLogo size={Math.round(size * 0.44)} white />
        : <Base44Logo size={Math.round(size * 0.44)} white />}
    </div>
  );
}

function PlatformToggle({ platform, onChange, hasBase44, hasRocket }: { platform: Platform; onChange: (p: Platform) => void; hasBase44: boolean; hasRocket: boolean }) {
  return (
    <div className="flex bg-[#f5f2ee] rounded-2xl p-1 mb-4 gap-1" role="tablist">
      {(["base44", "rocket"] as Platform[]).map((value) => {
        const active    = platform === value;
        const connected = value === "base44" ? hasBase44 : hasRocket;
        const label     = value === "base44" ? "Base44" : "Rocket.new";
        const activeGrad = value === "base44" ? "linear-gradient(135deg,#fb923c,#f97316)" : ROCKET_GRAD;
        return (
          <motion.button
            key={value}
            onClick={() => onChange(value)}
            role="tab"
            aria-selected={active}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold relative overflow-hidden"
            whileTap={{ scale: 0.97 }}
          >
            {active && <motion.div layoutId="platform-tab" className="absolute inset-0 rounded-xl shadow-sm" style={{ background: activeGrad }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className="relative z-10 flex items-center gap-1.5">
              {value === "base44" ? <Base44Logo size={14} white={active} /> : <RocketLogo size={15} white={active} />}
              <span className={active ? "text-white" : "text-[#9a8880]"}>{label}</span>
              {connected && <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "rgba(255,255,255,0.8)" : "#22c55e" }} />}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function calcApkProgress(state: ApkBuildState): number {
  if (state.status === APK_STATUS.IN_QUEUE) return 5;
  if (state.status === APK_STATUS.COMPLETED) return 100;
  if (state.status === APK_STATUS.IN_PROCESS && state.updatedAt) {
    const start = new Date(state.updatedAt).getTime();
    const end   = start + 6 * 60 * 1000;
    const now   = Date.now();
    if (now >= end) return 95;
    const elapsed = now - start;
    const total   = end - start;
    return Math.max(5, Math.min(95, Math.round((elapsed / total) * 95)));
  }
  return 0;
}

function ApkBuildPanel({
  threadId, token, companyId, appName,
}: {
  threadId: string;
  token: string;
  companyId?: string;
  appName: string;
}) {
  const [build, setBuild] = useState<ApkBuildState | null>(null);
  const [loading, setLoading]   = useState(false);
  const [downloading, setDL]    = useState(false);
  const [error, setError]       = useState("");
  const [progress, setProgress] = useState(0);

  const isBuilding = build && (build.status === APK_STATUS.IN_QUEUE || build.status === APK_STATUS.IN_PROCESS);
  const isComplete = build?.status === APK_STATUS.COMPLETED;
  const isFailed   = build && (build.status === APK_STATUS.FAILED || build.status === APK_STATUS.QUEUE_BUILD_REJECTED);

  const checkStatus = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const state = await checkRocketApkBuildStatus({ data: { token, threadId, companyId } });
      setBuild(state);
      setProgress(calcApkProgress(state));
    } catch (e: any) {
      if (!silent) setError(e.message ?? "Failed to check build status");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [threadId]);

  useEffect(() => {
    if (!isBuilding) return;
    const tick = () => {
      setProgress(calcApkProgress(build!));
    };
    const progressTimer = setInterval(tick, 1000);
    const pollTimer     = setTimeout(() => checkStatus(true), 5000);
    return () => { clearInterval(progressTimer); clearTimeout(pollTimer); };
  }, [build]);

  const handleBuild = async () => {
    setError("");
    setLoading(true);
    try {
      const state = await triggerRocketApkBuild({ data: { token, threadId, companyId } });
      setBuild(state);
      setProgress(calcApkProgress(state));
    } catch (e: any) {
      setError(e.message ?? "Failed to start build");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setError("");
    setDL(true);
    try {
      const url = await downloadRocketApk({ data: { token, threadId, companyId } });
      window.open(url, "_blank", "noreferrer");
    } catch (e: any) {
      setError(e.message ?? "Failed to get download link");
    } finally {
      setDL(false);
    }
  };

  const statusLabel = () => {
    if (!build || build.status === APK_STATUS.IDLE) return "No build yet";
    if (build.status === APK_STATUS.IN_QUEUE)         return "Queued — building soon…";
    if (build.status === APK_STATUS.IN_PROCESS)       return "Building APK…";
    if (build.status === APK_STATUS.COMPLETED)        return "Build complete — ready to download";
    if (build.status === APK_STATUS.FAILED)           return "Build failed";
    if (build.status === APK_STATUS.QUEUE_BUILD_REJECTED) return "Build rejected — try again";
    return "Unknown";
  };

  const statusColor = () => {
    if (isComplete) return "#22c55e";
    if (isFailed)   return "#ef4444";
    if (isBuilding) return ROCKET_COLOR;
    return "#9a8880";
  };

  return (
    <motion.div
      className="bg-white rounded-[24px] border mb-3 overflow-hidden"
      style={{ borderColor: isBuilding ? `${ROCKET_COLOR}40` : isComplete ? "rgba(34,197,94,0.25)" : isFailed ? "rgba(239,68,68,0.2)" : "#f0ece4" }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f7f4f0]">
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: isComplete ? "#22c55e" : isBuilding ? ROCKET_GRAD : isFailed ? "#ef4444" : "#f0ece4" }}
        >
          {isComplete
            ? <Check className="h-3 w-3 text-white" strokeWidth={3} />
            : isBuilding
              ? <Loader2 className="h-3 w-3 text-white animate-spin" />
              : <Smartphone className="h-3 w-3" style={{ color: isFailed ? "#fff" : "#9a8880" }} />}
        </div>
        <span className="text-[14px] font-black text-[#1a1a1a]">Build APK</span>
        {build && build.status !== APK_STATUS.IDLE && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              color: statusColor(),
              background: isComplete ? "#f0fdf4" : isFailed ? "#fef2f2" : isBuilding ? ROCKET_LIGHT : "#faf7f3",
              borderColor: isComplete ? "#bbf7d0" : isFailed ? "#fecaca" : isBuilding ? ROCKET_BORDER : "#f0ece4",
            }}
          >
            {statusLabel()}
          </span>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Description */}
        <p className="text-[12px] text-[#9a8880] leading-relaxed">
          Build a native Android APK for <strong className="text-[#1a1a1a]">{appName}</strong> directly from Rocket.new.
          The build runs on Rocket.new's servers — no local setup needed.
        </p>

        {/* Progress bar */}
        {isBuilding && (
          <div className="space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-[#f0ece4] overflow-hidden">
              <motion.div
                className="h-1.5 rounded-full"
                style={{ background: ROCKET_GRAD }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#9a8880]">
                {build?.status === APK_STATUS.IN_QUEUE ? "In queue…" : "Compiling…"}
              </span>
              <span className="text-[11px] font-bold" style={{ color: ROCKET_COLOR }}>{progress}%</span>
            </div>
          </div>
        )}

        {/* Complete download */}
        {isComplete && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#22c55e" }}>
              <Download className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-[#166534]">APK ready</div>
              <div className="text-[10px] text-[#166534]/70">Tap to download and install on your Android device</div>
            </div>
            <MotionButton
              onClick={handleDownload}
              disabled={downloading}
              className="text-[11px] font-bold text-white rounded-xl px-3 py-2 shrink-0"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Download APK"}
            </MotionButton>
          </div>
        )}

        {/* Error */}
        {(error || (isFailed && build?.errorMessage)) && (
          <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 bg-[#fef2f2] border border-[#fecaca]">
            <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
            <span className="text-[12px] text-[#ef4444] font-semibold">{error || build?.errorMessage}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Primary: Build / Rebuild */}
          <MotionButton
            onClick={handleBuild}
            disabled={loading || !!isBuilding}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold text-white"
            style={{
              background: isBuilding ? "#c4b5fd" : ROCKET_GRAD,
              boxShadow: isBuilding ? "none" : "0 4px 16px rgba(127,34,254,0.3)",
              cursor: isBuilding ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Starting…</>
              : isBuilding
                ? <><Loader2 className="h-4 w-4 animate-spin" />Building…</>
                : <><Smartphone className="h-4 w-4" />{isFailed ? "Rebuild APK" : isComplete ? "Build new APK" : "Build APK"}</>}
          </MotionButton>

          {/* Secondary: Download (also shown here for easy access) */}
          {isComplete && (
            <MotionButton
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-[13px] font-bold border"
              style={{ color: "#22c55e", borderColor: "#bbf7d0", background: "#f0fdf4" }}
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </MotionButton>
          )}

          {/* Refresh status */}
          {!isBuilding && (
            <MotionButton
              onClick={() => checkStatus()}
              disabled={loading}
              className="flex items-center justify-center px-3.5 py-3 rounded-2xl border border-[#f0ece4] bg-[#faf7f3]"
              title="Refresh build status"
            >
              <RefreshCw className={`h-4 w-4 text-[#9a8880] ${loading ? "animate-spin" : ""}`} />
            </MotionButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PushPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [platform, setPlatform]         = useState<Platform>(() => {
    try { return (sessionStorage.getItem("p44_platform") as Platform) || "base44"; } catch { return "base44"; }
  });
  const [apps, setApps]                 = useState<App[]>([]);
  const [appsError, setAppsError]       = useState("");
  const [repos, setRepos]               = useState<Repo[]>([]);
  const [selectedApp, setSelectedApp]   = useState<App | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(() => {
    try { const s = sessionStorage.getItem("p44_repo"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [newRepoName, setNewRepoName]   = useState("");
  const [newRepoDesc, setNewRepoDesc]   = useState("");
  const [isPrivate, setIsPrivate]       = useState(true);
  const [branch, setBranch]             = useState("main");
  const [commitMsg, setCommitMsg]       = useState("");
  const [files, setFiles]               = useState<FileEntry[]>([]);
  const [diffMap, setDiffMap]           = useState<Map<string, DiffStatus>>(new Map());
  const [stagedPaths, setStagedPaths]   = useState<Set<string>>(new Set());
  const [deletedPaths, setDeletedPaths] = useState<Set<string>>(new Set());
  const [hasSnapshot, setHasSnapshot]   = useState(false);
  const [branches, setBranches]         = useState<Branch[]>([]);
  const [branchLoading, setBL]          = useState(false);
  const [status, setStatus]             = useState<PushStatus>("idle");
  const [commitHash, setCommitHash]     = useState("");
  const [errorMsg, setErrorMsg]         = useState("");
  const [showNewRepo, setShowNewRepo]   = useState(false);
  const [loadingApps, setLA]            = useState(false);
  const [loadingRepos, setLR]           = useState(false);
  const [loadingFiles, setLF]           = useState(false);
  const [wakingSandbox, setWaking]      = useState(false);
  const [showRocketModal, setShowRocketModal] = useState(false);
  const [needsOtpLogin, setNeedsOtpLogin]     = useState(false);
  const [containerDown, setContainerDown]     = useState<{ appId: string; appName: string } | null>(null);
  const [rocketStage, setRocketStage]         = useState<"pinging" | "listing" | "downloading" | "">("");
  const [tokenExpired, setTokenExpired]       = useState<"github" | "platform" | null>(null);
  const [pushStats, setPushStats]             = useState<{ newCount: number; modifiedCount: number; unchangedCount: number; deletedCount: number } | null>(null);
  const [pushProgress, setPushProgress]       = useState<{ done: number; total: number } | null>(null);
  const [expandedDiffPath, setExpandedDiffPath] = useState<string | null>(null);

  const hasBase44   = !!creds.base44Token;
  const hasRocket   = !!creds.rocketToken;
  const isConnected = !!((hasBase44 || hasRocket) && creds.githubToken);
  const step1done   = !!selectedApp && files.length > 0;
  const step2done   = !!selectedRepo;
  const stagedFiles = files.filter(f => stagedPaths.has(f.path));

  // Auto-select app from re-push sessionStorage
  const [repushAppName] = useState<string | null>(() => {
    try { return sessionStorage.getItem("p44_repush_appName"); } catch { return null; }
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.defaultBranch) setBranch(creds.defaultBranch);
    if (hasBase44 && !hasRocket) setPlatform("base44");
    if (!hasBase44 && hasRocket) setPlatform("rocket");
    if (isConnected) loadRepos();
  }, [isLoaded, isConnected]);

  useEffect(() => {
    try { sessionStorage.setItem("p44_platform", platform); } catch {}
  }, [platform]);

  useEffect(() => {
    try { sessionStorage.setItem("p44_repo", JSON.stringify(selectedRepo)); } catch {}
  }, [selectedRepo]);

  useEffect(() => {
    if (!isLoaded || !isConnected) return;
    setApps([]); setSelectedApp(null); setFiles([]); setDiffMap(new Map()); setStagedPaths(new Set()); setDeletedPaths(new Set());
    loadApps();
  }, [platform, isLoaded]);

  // Auto-select app once apps load (for re-push)
  useEffect(() => {
    if (!repushAppName || apps.length === 0) return;
    const target = apps.find(a => a.name === repushAppName);
    if (target && !selectedApp) {
      try { sessionStorage.removeItem("p44_repush_appName"); } catch {}
      handleSelectApp(target);
    }
  }, [apps, repushAppName]);

  const loadApps = async () => {
    if (platform === "base44") {
      if (!creds.base44Token) return;
      setLA(true);
      try { setApps(await listBase44Apps({ data: { token: creds.base44Token } })); }
      catch (e: any) {
        const msg = e.message ?? "";
        if (e.status === 401 || msg.includes("Bad credentials") || msg.includes("Unauthorized")) setTokenExpired("platform");
        else toast.error("Failed to load Base44 apps: " + msg);
      }
      finally { setLA(false); }
    } else {
      if (!creds.rocketToken) return;
      setLA(true); setNeedsOtpLogin(false);
      try {
        setAppsError("");
        setApps(await listRocketApps({ data: { token: creds.rocketToken, companyId: creds.rocketCompanyId } }));
      } catch (e: any) {
        const msg: string = e.message ?? "Unknown error";
        if (msg.startsWith("NEEDS_OTP_LOGIN")) { setNeedsOtpLogin(true); setAppsError("Your API key needs workspace info. Log in with Email OTP to continue."); }
        else { setAppsError(msg); }
      }
      finally { setLA(false); }
    }
  };

  const loadRepos = async () => {
    if (!creds.githubToken) return;
    setLR(true);
    try {
      const data = await listGitHubRepos({ data: { token: creds.githubToken } });
      setRepos(data.map((r: any) => ({ full_name: r.full_name, default_branch: r.default_branch, html_url: r.html_url })));
    } catch (e: any) {
      if (e.status === 401) setTokenExpired("github");
      else toast.error("Failed to load repos: " + e.message);
    }
    finally { setLR(false); }
  };

  const handleSelectApp = async (app: App) => {
    setSelectedApp(app); setFiles([]); setDiffMap(new Map()); setStagedPaths(new Set()); setDeletedPaths(new Set());
    setCommitMsg(`Push ${app.name} to GitHub`);
    setLF(true); setWaking(false); setContainerDown(null); setRocketStage(""); setExpandedDiffPath(null);
    const t = setTimeout(() => setWaking(true), 3000);
    try {
      let loadedFiles: FileEntry[] = [];
      if (platform === "base44") {
        loadedFiles = await fetchBase44AppFiles({ data: { token: creds.base44Token!, appId: app.id } });
      } else {
        setRocketStage("pinging");
        loadedFiles = await fetchRocketAppFiles({ data: { token: creds.rocketToken!, appId: app.id, applicationId: app.applicationId, companyId: creds.rocketCompanyId } });
        setRocketStage("");
      }
      const snapshot = getAppSnapshot(app.id);
      const diff = computeFileDiff(loadedFiles, snapshot);
      const deleted = getDeletedPaths(loadedFiles, snapshot);
      const newCount = loadedFiles.filter(f => diff.get(f.path) === "new").length;
      const modifiedCount = loadedFiles.filter(f => diff.get(f.path) === "modified").length;
      setDiffMap(diff);
      setFiles(loadedFiles);
      setStagedPaths(new Set(loadedFiles.map(f => f.path)));
      setDeletedPaths(new Set(deleted));
      setHasSnapshot(!!snapshot);
      if (snapshot && (newCount + modifiedCount) > 0) {
        const parts: string[] = [];
        if (newCount > 0) parts.push(`${newCount} new`);
        if (modifiedCount > 0) parts.push(`${modifiedCount} modified`);
        if (deleted.length > 0) parts.push(`${deleted.length} deleted`);
        setCommitMsg(`Update ${app.name}: ${parts.join(", ")}`);
      }
    } catch (e: any) {
      const msg: string = e.message ?? "";
      if (platform === "rocket" && msg.startsWith("Your Rocket.new project container is not running")) {
        setContainerDown({ appId: app.id, appName: app.name });
      } else if (e.status === 401 || msg.includes("Unauthorized")) {
        setTokenExpired("platform");
      } else {
        toast.error("Failed to fetch files: " + msg);
      }
    }
    finally { clearTimeout(t); setLF(false); setWaking(false); setRocketStage(""); }
  };

  const handleSelectRepo = async (repo: Repo) => {
    setSelectedRepo(repo);
    setBranch(creds.defaultBranch || repo.default_branch);
    setBranches([]); setBL(true);
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const b = await listRepoBranches({ data: { token: creds.githubToken!, owner, repo: repoName } });
      setBranches(b);
    } catch {}
    finally { setBL(false); }
  };

  const handleCreateBranch = async (name: string, from: string) => {
    if (!selectedRepo) return;
    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      await createRepoBranch({ data: { token: creds.githubToken!, owner, repo, branchName: name, fromBranch: from } });
      setBranches(prev => [...prev, { name, sha: "", protected: false }]);
      setBranch(name);
      toast.success(`Branch "${name}" created`);
    } catch (e: any) { toast.error("Failed to create branch: " + e.message); }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) { toast.error("Enter a repository name"); return; }
    try {
      const r = await createGitHubRepo({ data: { token: creds.githubToken!, name: newRepoName.trim(), isPrivate, description: newRepoDesc.trim() } });
      await handleSelectRepo(r);
      setRepos((p) => [r, ...p]); setShowNewRepo(false); setNewRepoName(""); setNewRepoDesc("");
      toast.success(`Repo "${r.full_name}" created!`);
    } catch (e: any) { toast.error("Create repo failed: " + e.message); }
  };

  const handleDownloadZip = async () => {
    if (stagedFiles.length === 0) return;
    try {
      const zip = new JSZip();
      stagedFiles.forEach(f => zip.file(f.path, f.content));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `${(selectedApp?.name ?? "app").replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`ZIP downloaded (${stagedFiles.length} files)`);
    } catch (e: any) { toast.error("ZIP failed: " + e.message); }
  };

  const handlePush = async () => {
    if (!selectedApp || !selectedRepo || !commitMsg.trim() || stagedFiles.length === 0) return;
    const [owner, repo] = selectedRepo.full_name.split("/");
    setStatus("pushing"); setErrorMsg(""); setPushProgress({ done: 0, total: stagedFiles.length });
    const newCount       = stagedFiles.filter(f => diffMap.get(f.path) === "new").length;
    const modifiedCount  = stagedFiles.filter(f => diffMap.get(f.path) === "modified").length;
    const unchangedCount = stagedFiles.filter(f => diffMap.get(f.path) === "unchanged").length;
    const delCount       = deletedPaths.size;
    try {
      const result = await pushFilesToGitHub({
        data: {
          token: creds.githubToken!, owner, repo, branch,
          files: stagedFiles,
          filesToDelete: [...deletedPaths],
          commitMessage: commitMsg,
          onProgress: (done, total) => setPushProgress({ done, total }),
        },
      });
      // Save ALL files (not just staged) so future diffs reflect the true app state
      saveAppSnapshot(selectedApp.id, files);
      setCommitHash(result.shortSha);
      setStatus("done");
      setPushProgress(null);
      setPushStats({ newCount, modifiedCount, unchangedCount, deletedCount: delCount });
      addHistory({
        id: result.commitSha, appName: selectedApp.name, platform, repo: selectedRepo.full_name,
        branch, commitMessage: commitMsg, commitHash: result.shortSha,
        filesCount: stagedFiles.length, stagedCount: stagedFiles.length,
        newCount, modifiedCount, deletedCount: delCount,
        status: "success", timestamp: Date.now(),
      });
      toast.success(`Pushed ${stagedFiles.length} files to ${selectedRepo.full_name}`);
    } catch (e: any) {
      const msg = e.message ?? "Push failed";
      if (e.status === 401 || msg.includes("Bad credentials")) setTokenExpired("github");
      setErrorMsg(msg); setStatus("error"); setPushProgress(null);
      addHistory({
        id: Date.now().toString(), appName: selectedApp.name, platform, repo: selectedRepo.full_name,
        branch, commitMessage: commitMsg, commitHash: "",
        filesCount: stagedFiles.length, status: "failed", error: msg, timestamp: Date.now(),
      });
      toast.error("Push failed: " + msg);
    }
  };

  if (!isLoaded) return null;

  if (!isConnected) {
    return (
      <>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <motion.div className="h-20 w-20 rounded-[28px] bg-[#fff4ed] flex items-center justify-center" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Lock className="h-9 w-9 text-[#f97316]" />
          </motion.div>
          <div>
            <h2 className="text-[20px] font-black text-[#1a1a1a] mb-1.5">Not connected</h2>
            <p className="text-[13px] text-[#6b6360] max-w-[220px] leading-relaxed">Connect a platform (Base44 or Rocket.new) and GitHub in Settings first.</p>
          </div>
          <MotionButton onClick={() => navigate({ to: "/settings" })} className="flex items-center gap-2 bg-[#f97316] text-white font-bold px-6 py-3.5 rounded-2xl text-[13px]" style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}>
            Go to Settings <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
          </MotionButton>
        </div>
      </>
    );
  }

  if (status === "done") {
    const platformGrad  = platform === "rocket" ? ROCKET_GRAD : "linear-gradient(135deg,#fb923c,#f97316)";
    const platformColor = platform === "rocket" ? ROCKET_COLOR : "#f97316";
    return (
      <>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col min-h-[72vh] pt-4 pb-2">
          <FadeUp>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <motion.div className="h-20 w-20 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.2)" }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} />
                <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 360, damping: 20 }}>
                  <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                  </div>
                </motion.div>
                <motion.div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full" style={{ background: platformColor }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} />
              </div>
              <motion.h2 className="text-[30px] font-black text-[#1a1a1a] tracking-tight leading-none mb-1.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>Shipped!</motion.h2>
              <motion.p className="text-[13px] text-[#9a8880]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Your code is live on GitHub</motion.p>
            </div>
          </FadeUp>

          <FadeUp delay={0.16}>
            <div className="bg-white rounded-[22px] border border-[#f0ece4] overflow-hidden mb-3" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
              <div className="px-5 py-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: platformGrad }}>
                    {platform === "rocket" ? <RocketLogo size={20} white /> : <Base44Logo size={20} white />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#9a8880] font-medium uppercase tracking-wide mb-0.5">{platform === "rocket" ? "Rocket.new project" : "Base44 app"} pushed</div>
                    <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{selectedApp?.name ?? "App"}</div>
                  </div>
                </div>
                <div className="h-px bg-[#f5f2ee]" />
                {/* Diff stats */}
                {pushStats && hasSnapshot && (
                  <div className="flex gap-2 flex-wrap">
                    {pushStats.newCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#22c55e] border border-[#bbf7d0]">+{pushStats.newCount} new</span>}
                    {pushStats.modifiedCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">~{pushStats.modifiedCount} modified</span>}
                    {pushStats.unchangedCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faf7f3] text-[#9a8880] border border-[#f0ece4]">{pushStats.unchangedCount} unchanged</span>}
                    {pushStats.deletedCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#ef4444] border border-[#fecaca]">−{pushStats.deletedCount} deleted</span>}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Files",  value: stagedFiles.length },
                    { label: "Lines",  value: stagedFiles.reduce((a, f) => a + f.content.split("\n").length, 0).toLocaleString() },
                    { label: "Branch", value: branch },
                    { label: "Commit", value: commitHash },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl px-3 py-2.5" style={{ background: "#faf7f3" }}>
                      <div className="text-[15px] font-black text-[#1a1a1a] leading-none truncate">{value}</div>
                      <div className="text-[10px] text-[#9a8880] font-bold uppercase tracking-wide mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[#f5f2ee]" />
                <div className="flex items-center gap-2.5">
                  <GitHubLogo size={16} className="text-[#6b6360] shrink-0" />
                  <div className="text-[12px] font-semibold text-[#1a1a1a] truncate flex-1">{selectedRepo?.full_name}</div>
                  <span className="text-[10px] font-bold text-[#9a8880] bg-[#f5f2ee] px-2 py-0.5 rounded-full shrink-0">{branch}</span>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* APK Build Panel — on success screen for Rocket.new pushes */}
          {platform === "rocket" && selectedApp && creds.rocketToken && (
            <FadeUp delay={0.32}>
              <ApkBuildPanel
                key={selectedApp.id}
                threadId={selectedApp.id}
                token={creds.rocketToken}
                companyId={creds.rocketCompanyId}
                appName={selectedApp.name}
              />
            </FadeUp>
          )}

          <FadeUp delay={0.24}>
            <div className="space-y-2.5">
              {selectedRepo && (
                <a href={`${selectedRepo.html_url}/tree/${branch}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[16px] border border-[#f0ece4] bg-white text-[13px] font-bold text-[#1a1a1a]"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />View on GitHub
                </a>
              )}
              <MotionButton
                onClick={() => { setStatus("idle"); setSelectedApp(null); setFiles([]); setDiffMap(new Map()); setStagedPaths(new Set()); setDeletedPaths(new Set()); setPushStats(null); loadApps(); }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[16px] text-white text-[13px] font-bold"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}
              >
                <RefreshCw className="h-4 w-4" />Push another app
              </MotionButton>
            </div>
          </FadeUp>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <AnimatedCorner variant="push" />
      {showRocketModal && (
        <RocketModal
          onClose={() => setShowRocketModal(false)}
          onSuccess={() => { setShowRocketModal(false); loadApps(); }}
        />
      )}

      <FadeUp>
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">Version Control</p>
          <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Push to GitHub</h1>
        </div>
      </FadeUp>

      {tokenExpired && <TokenExpiredBanner type={tokenExpired} onFix={() => navigate({ to: "/settings" })} />}

      {/* Step 1: Select App + Files */}
      <SectionShell step={1} label="Select app & review files" active={!step1done} done={step1done}>
        <PlatformToggle platform={platform} onChange={p => { setPlatform(p); }} hasBase44={hasBase44} hasRocket={hasRocket} />

        {/* Platform not connected */}
        {((platform === "base44" && !hasBase44) || (platform === "rocket" && !hasRocket)) && (
          <div className="flex items-center gap-3 rounded-2xl p-4 bg-[#fff4ed] border border-[#fed7aa]">
            <AlertTriangle className="h-4 w-4 text-[#f97316] shrink-0" />
            <p className="text-[12px] font-semibold text-[#9a3412] flex-1">{platform === "base44" ? "Base44" : "Rocket.new"} not connected.</p>
            <MotionButton onClick={() => navigate({ to: "/settings" })} className="text-[11px] font-bold text-[#f97316] bg-white border border-[#f97316]/30 rounded-full px-3 py-1.5">Connect →</MotionButton>
          </div>
        )}

        {/* Rocket OTP login prompt */}
        {platform === "rocket" && needsOtpLogin && (
          <div className="mt-3 rounded-2xl p-4 border" style={{ background: ROCKET_LIGHT, borderColor: ROCKET_BORDER }}>
            <p className="text-[12px] font-semibold mb-2" style={{ color: ROCKET_TEXT }}>{appsError}</p>
            <MotionButton onClick={() => setShowRocketModal(true)} className="text-[11px] font-bold text-white rounded-xl px-3 py-2" style={{ background: ROCKET_COLOR }}>Log in with OTP →</MotionButton>
          </div>
        )}

        {/* App list */}
        {loadingApps && (
          <div className="flex items-center gap-2.5 py-4 text-[#9a8880]">
            <Loader2 className="h-4 w-4 animate-spin" /><span className="text-[13px] font-medium">Loading apps…</span>
          </div>
        )}

        {!loadingApps && apps.length > 0 && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {apps.map(app => {
              const isSelected  = selectedApp?.id === app.id;
              const snapshot    = getAppSnapshot(app.id);
              const accentColor = platform === "rocket" ? ROCKET_COLOR : "#f97316";
              const selBg       = platform === "rocket" ? ROCKET_LIGHT : "#fff4ed";
              const selBorder   = platform === "rocket" ? ROCKET_COLOR : "#f97316";
              return (
                <motion.button
                  key={app.id}
                  onClick={() => !loadingFiles && handleSelectApp(app)}
                  disabled={loadingFiles && !isSelected}
                  className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left border transition-colors relative"
                  style={{
                    background: isSelected ? selBg : "#faf7f3",
                    borderColor: isSelected ? selBorder : "#f0ece4",
                    minHeight: 56,
                  }}
                  whileTap={{ scale: loadingFiles && !isSelected ? 1 : 0.98 }}
                >
                  {isSelected && (
                    <motion.div layoutId="app-selection-stripe" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: accentColor }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  )}
                  <AppIcon icon={app.icon} platform={platform} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{app.name}</div>
                    <div className="text-[10px] mt-0.5 font-medium" style={{ color: isSelected ? accentColor : "#9a8880" }}>
                      {snapshot ? `Last pushed ${new Date(snapshot.timestamp).toLocaleDateString()}` : "Never pushed"}
                    </div>
                  </div>
                  <div className="shrink-0 w-5 flex items-center justify-center">
                    {loadingFiles && isSelected
                      ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: accentColor }} />
                      : isSelected
                        ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 28 }}>
                            <Check className="h-4 w-4" style={{ color: accentColor }} strokeWidth={3} />
                          </motion.div>
                        : null}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Loading / waking state */}
        {loadingFiles && !wakingSandbox && (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl px-4 py-3 bg-[#fff4ed] border border-[#fed7aa]">
            <Loader2 className="h-4 w-4 animate-spin text-[#f97316]" />
            <span className="text-[13px] font-semibold text-[#9a3412]">
              {rocketStage === "pinging" ? "Pinging container…" : rocketStage === "listing" ? "Getting file list…" : rocketStage === "downloading" ? "Downloading files…" : "Fetching files…"}
            </span>
          </div>
        )}

        {/* Sandbox waking */}
        {loadingFiles && wakingSandbox && selectedApp && (
          <div className="mt-3 rounded-2xl p-4 bg-[#fff4ed] border border-[#fed7aa]">
            <div className="flex items-center gap-2.5 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#f97316] shrink-0" />
              <span className="text-[13px] font-bold text-[#9a3412]">Waking up sandbox…</span>
            </div>
            <p className="text-[11px] text-[#c2410c]/80 mb-3 leading-relaxed">
              The sandbox for <strong>{selectedApp.name}</strong> is taking longer than usual. Open the app in Base44 to wake it manually.
            </p>
            <a href={`https://app.base44.com/apps/${selectedApp.id}`} target="_blank" rel="noreferrer"
              className="text-[11px] font-bold text-white rounded-xl px-3 py-2 inline-block"
              style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
              Open in Base44 →
            </a>
          </div>
        )}

        {/* Container sleeping */}
        {containerDown && (
          <div className="mt-3 rounded-2xl p-4 border" style={{ background: ROCKET_LIGHT, borderColor: ROCKET_BORDER }}>
            <div className="text-[13px] font-bold mb-1" style={{ color: ROCKET_TEXT }}>Container is sleeping</div>
            <div className="text-[11px] mb-3" style={{ color: `${ROCKET_TEXT}99` }}>The container for <strong>{containerDown.appName}</strong> is offline.</div>
            <div className="flex gap-2 flex-wrap">
              <a href={`https://rocket.new/${containerDown.appId}`} target="_blank" rel="noreferrer"
                className="text-[11px] font-bold text-white rounded-xl px-3 py-2" style={{ background: ROCKET_GRAD }}>
                Open in Rocket.new →
              </a>
              <MotionButton
                onClick={() => { setContainerDown(null); handleSelectApp(selectedApp!); }}
                className="text-[11px] font-bold bg-white rounded-xl px-3 py-2 border"
                style={{ color: ROCKET_TEXT, borderColor: ROCKET_BORDER }}
              >
                Try again
              </MotionButton>
            </div>
          </div>
        )}

        {/* Staging browser + ZIP download */}
        <AnimatePresence>
          {files.length > 0 && !loadingFiles && (
            <div className="mt-3">
              {/* ZIP export button */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#9a8880] uppercase tracking-wider">
                  {files.length} files fetched
                </span>
                <motion.button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#6b6360] bg-[#faf7f3] rounded-full px-2.5 py-1.5 border border-[#f0ece4]"
                  whileHover={{ background: "#f5f2ee", borderColor: "#e8e3db" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Archive className="h-3 w-3" />Download ZIP
                </motion.button>
              </div>
              <StagingBrowser
                files={files}
                diffMap={diffMap}
                stagedPaths={stagedPaths}
                onChange={setStagedPaths}
                hasSnapshot={hasSnapshot}
                deletedPaths={deletedPaths}
                onDeletedPathsChange={setDeletedPaths}
                appId={selectedApp?.id ?? null}
                expandedDiffPath={expandedDiffPath}
                onToggleDiff={path => setExpandedDiffPath(p => p === path ? null : path)}
              />
              {stagedPaths.size === 0 && deletedPaths.size === 0 && (
                <div className="text-[12px] text-[#ef4444] font-semibold text-center py-2">Stage at least 1 file to push.</div>
              )}
            </div>
          )}
        </AnimatePresence>
      </SectionShell>

      {/* APK Build Panel — Rocket.new only, shown after files are fetched */}
      <AnimatePresence>
        {platform === "rocket" && selectedApp && files.length > 0 && !loadingFiles && creds.rocketToken && (
          <ApkBuildPanel
            key={selectedApp.id}
            threadId={selectedApp.id}
            token={creds.rocketToken}
            companyId={creds.rocketCompanyId}
            appName={selectedApp.name}
          />
        )}
      </AnimatePresence>

      {/* Step 2: Select Repo + Branch */}
      <SectionShell step={2} label="Select repository & branch" active={step1done && !step2done} done={step2done}>
        {!step1done ? (
          <p className="text-[12px] text-[#c8b8a2] font-medium">Select an app first</p>
        ) : (
          <>
            <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
              {loadingRepos && <div className="flex items-center gap-2 py-3 text-[#9a8880]"><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="text-[12px]">Loading repos…</span></div>}
              {repos.slice(0, 8).map(r => (
                <motion.button
                  key={r.full_name}
                  onClick={() => handleSelectRepo(r)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left border"
                  style={{ background: selectedRepo?.full_name === r.full_name ? "#fff4ed" : "#faf7f3", borderColor: selectedRepo?.full_name === r.full_name ? "#f97316" : "#f0ece4" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GitHubLogo size={14} className="text-[#6b6360] shrink-0" />
                  <span className="text-[12px] font-bold text-[#1a1a1a] flex-1 truncate">{r.full_name}</span>
                  {selectedRepo?.full_name === r.full_name && <Check className="h-3.5 w-3.5 text-[#f97316] shrink-0" />}
                </motion.button>
              ))}
            </div>

            {/* Create new repo */}
            <div className="mb-3">
              <MotionButton
                onClick={() => setShowNewRepo(o => !o)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#9a8880] bg-[#faf7f3] border border-[#f0ece4] rounded-xl px-3 py-2"
              >
                <Plus className="h-3 w-3" />{showNewRepo ? "Cancel" : "New repository…"}
              </MotionButton>

              <AnimatePresence>
                {showNewRepo && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-2.5 space-y-2">
                      <input value={newRepoName} onChange={e => setNewRepoName(e.target.value)} placeholder="Repository name"
                        className="w-full text-[13px] rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-3.5 py-2.5 outline-none font-semibold placeholder:text-[#c8b8a2] focus:border-[#f97316]/50" />
                      <input value={newRepoDesc} onChange={e => setNewRepoDesc(e.target.value)} placeholder="Description (optional)"
                        className="w-full text-[13px] rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-3.5 py-2.5 outline-none font-medium placeholder:text-[#c8b8a2] focus:border-[#f97316]/50" />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div onClick={() => setIsPrivate(p => !p)} className="h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer" style={{ background: isPrivate ? "#f97316" : "transparent", borderColor: isPrivate ? "#f97316" : "#d4ccc4" }}>
                            {isPrivate && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                          </div>
                          <span className="text-[12px] font-semibold text-[#6b6360]">Private</span>
                        </label>
                        <MotionButton onClick={handleCreateRepo} className="ml-auto text-[12px] font-bold text-white bg-[#f97316] rounded-xl px-4 py-2">Create repo</MotionButton>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Branch selector */}
            {selectedRepo && (
              <div>
                <div className="text-[11px] font-bold text-[#9a8880] uppercase tracking-wide mb-1.5">Target branch</div>
                <BranchSelector
                  branches={branches}
                  loading={branchLoading}
                  current={branch}
                  onSelect={setBranch}
                  onCreate={handleCreateBranch}
                />
              </div>
            )}
          </>
        )}
      </SectionShell>

      {/* Step 3: Commit + Push */}
      <SectionShell step={3} label="Commit message & push" active={step1done && step2done} done={status === "done"}>
        {!step2done ? (
          <p className="text-[12px] text-[#c8b8a2] font-medium">Select a repository first</p>
        ) : (
          <>
            <div className="relative mb-3">
              <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-[#c8b8a2]" />
              <textarea
                value={commitMsg}
                onChange={e => setCommitMsg(e.target.value)}
                placeholder="Describe your changes…"
                rows={2}
                className="w-full text-[13px] rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-9 pr-3.5 py-2.5 outline-none font-semibold placeholder:text-[#c8b8a2] resize-none focus:border-[#f97316]/50"
              />
            </div>

            {/* Summary row */}
            <div className="flex items-center gap-2 mb-3 text-[11px] text-[#9a8880] font-medium flex-wrap">
              <span className="flex items-center gap-1"><UploadCloud className="h-3 w-3" />{stagedFiles.length} files staged</span>
              {deletedPaths.size > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#d4ccc4]" />
                  <span className="flex items-center gap-1 text-[#ef4444]"><Minus className="h-3 w-3" />{deletedPaths.size} deleted</span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-[#d4ccc4]" />
              <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{branch}</span>
              <span className="h-1 w-1 rounded-full bg-[#d4ccc4]" />
              <span className="truncate max-w-[130px]">{selectedRepo?.full_name}</span>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 bg-[#fef2f2] border border-[#fecaca] mb-3 text-[12px] text-[#ef4444] font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />{errorMsg}
              </div>
            )}

            {pushProgress && status === "pushing" && (
              <div className="mb-3 rounded-xl overflow-hidden bg-[#f5f2ee] border border-[#f0ece4]">
                <div
                  className="h-1.5 rounded-xl transition-all duration-300"
                  style={{
                    width: `${pushProgress.total > 0 ? Math.round((pushProgress.done / pushProgress.total) * 100) : 0}%`,
                    background: "linear-gradient(90deg,#fb923c,#f97316)",
                  }}
                />
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-[#9a8880]">
                  <span>Uploading blobs…</span>
                  <span>{pushProgress.done}/{pushProgress.total} files</span>
                </div>
              </div>
            )}

            <MotionButton
              onClick={handlePush}
              disabled={status === "pushing" || (stagedFiles.length === 0 && deletedPaths.size === 0) || !commitMsg.trim()}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 font-bold text-[14px] text-white"
              style={{
                background: (stagedFiles.length === 0 && deletedPaths.size === 0) ? "#e5e0d8" : "linear-gradient(135deg,#f97316,#ea580c)",
                boxShadow: (stagedFiles.length > 0 || deletedPaths.size > 0) ? "0 4px 20px rgba(249,115,22,0.35)" : "none",
                cursor: (stagedFiles.length === 0 && deletedPaths.size === 0) ? "not-allowed" : "pointer",
              }}
            >
              {status === "pushing" ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Pushing {stagedFiles.length} files…</>
              ) : (
                <><Cloud className="h-4 w-4" strokeWidth={2.5} />Push {stagedFiles.length} files to GitHub</>
              )}
            </MotionButton>
          </>
        )}
      </SectionShell>
    </>
  );
}
