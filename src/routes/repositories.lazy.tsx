import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Search, Star, Loader2, Lock, Globe,
  ExternalLink, RefreshCw, UploadCloud, Archive, X,
  GitCommit, Users, AlertCircle, Calendar, HardDrive,
  GitFork, Eye, Tag, Zap, ChevronRight, Plus, Trash2,
  Copy, Check, ChevronDown, FileCode2, FileMinus, FilePlus,
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import {
  listGitHubRepos, getRepoDetails, getRepoLanguages,
  getRepoCommits, getRepoContributors, listRepoBranches,
  createRepoBranch, deleteRepoBranch, getCommitFiles,
} from "@/lib/github-api";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/repositories")({  component: ReposPage,
});

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f0b429", Python: "#3776ab",
  CSS: "#264de4", HTML: "#e34c26", Rust: "#dea584", Go: "#00ADD8",
  Java: "#b07219", "C++": "#f34b7d", Ruby: "#701516", Kotlin: "#7f52ff",
  Swift: "#f05138", Dart: "#00b4ab", Shell: "#89e051", Vue: "#41b883",
  PHP: "#4f5d95", Scala: "#dc322f", Haskell: "#5d4f85", R: "#276dc2",
};
function langColor(n: string) { return LANG_COLORS[n] ?? "#c8b8a2"; }

const BYTES_PER_LINE: Record<string, number> = {
  TypeScript: 58, JavaScript: 55, Python: 44, CSS: 38, HTML: 68,
  Java: 65, "C++": 58, Go: 52, Rust: 60, Ruby: 48, Kotlin: 60,
  Swift: 58, Dart: 55, Shell: 42, Vue: 55, PHP: 55, Scala: 62, Haskell: 52, R: 45,
};
function estimateLOC(langs: { name: string; bytes: number }[]) {
  return langs.reduce((s, l) => s + Math.round(l.bytes / (BYTES_PER_LINE[l.name] ?? 55)), 0);
}
function fmtLOC(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
function fmtSize(kb: number) { return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`; }
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return days === 1 ? "yesterday" : `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 mo ago" : `${months} mo ago`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

type SheetTab = "overview" | "branches" | "commits";

interface DetailSheetProps {
  repo: any;
  token: string;
  onClose: () => void;
  onPush: () => void;
}

function RepoDetailSheet({ repo, token, onClose, onPush }: DetailSheetProps) {
  const [tab, setTab]                   = useState<SheetTab>("overview");
  const [details, setDetails]           = useState<any>(null);
  const [languages, setLanguages]       = useState<any[]>([]);
  const [commits, setCommits]           = useState<any[]>([]);
  const [contributors, setContribs]     = useState<any[]>([]);
  const [branches, setBranches]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingBranches, setLB]        = useState(false);
  const [loadingMore, setLM]            = useState(false);
  const [commitPage, setCommitPage]     = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [commitDetail, setCommitDetail] = useState<any>(null);
  const [loadingCommit, setLC]          = useState(false);
  const [copied, setCopied]             = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [showBranchCreate, setShowBranchCreate] = useState(false);

  const [owner, repoName] = repo.full_name.split("/");
  const spring = { type: "spring", stiffness: 320, damping: 28 } as const;
  const totalLOC = estimateLOC(languages);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRepoDetails({ data: { token, owner, repo: repoName } }),
      getRepoLanguages({ data: { token, owner, repo: repoName } }),
      getRepoCommits({ data: { token, owner, repo: repoName, per_page: 10, page: 1 } }),
      getRepoContributors({ data: { token, owner, repo: repoName } }),
    ]).then(([d, l, c, ct]) => {
      setDetails(d); setLanguages(l); setCommits(c); setContribs(ct);
      setHasMore(c.length >= 10);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [repo.full_name]);

  useEffect(() => {
    if (tab === "branches" && branches.length === 0) {
      setLB(true);
      listRepoBranches({ data: { token, owner, repo: repoName } })
        .then(setBranches).catch(() => {}).finally(() => setLB(false));
    }
  }, [tab]);

  const loadMoreCommits = async () => {
    setLM(true);
    try {
      const next = await getRepoCommits({ data: { token, owner, repo: repoName, per_page: 10, page: commitPage + 1 } });
      setCommits(c => [...c, ...next]);
      setCommitPage(p => p + 1);
      setHasMore(next.length >= 10);
    } catch {}
    finally { setLM(false); }
  };

  const handleCommitClick = async (commit: any) => {
    if (selectedCommit?.sha === commit.sha) { setSelectedCommit(null); setCommitDetail(null); return; }
    setSelectedCommit(commit);
    setCommitDetail(null);
    setLC(true);
    try {
      const detail = await getCommitFiles({ data: { token, owner, repo: repoName, sha: commit.sha } });
      setCommitDetail(detail);
    } catch {}
    finally { setLC(false); }
  };

  const handleCreateBranch = async () => {
    const name = newBranchName.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._/-]/g, "");
    if (!name) return;
    setCreatingBranch(true);
    try {
      await createRepoBranch({ data: { token, owner, repo: repoName, branchName: name, fromBranch: details?.default_branch ?? "main" } });
      setBranches(b => [...b, { name, sha: "", protected: false }]);
      setNewBranchName(""); setShowBranchCreate(false);
      toast.success(`Branch "${name}" created`);
    } catch (e: any) {
      toast.error("Failed to create branch: " + e.message);
    }
    finally { setCreatingBranch(false); }
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (branchName === details?.default_branch) { toast.error("Can't delete the default branch"); return; }
    try {
      await deleteRepoBranch({ data: { token, owner, repo: repoName, branchName } });
      setBranches(b => b.filter(x => x.name !== branchName));
      toast.success(`Branch "${branchName}" deleted`);
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const copyCloneUrl = async () => {
    const url = details?.clone_url ?? `https://github.com/${repo.full_name}.git`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error("Couldn't copy to clipboard"); }
  };

  const fileStatusIcon = (s: string) => {
    if (s === "added")   return <FilePlus  className="h-3.5 w-3.5 text-[#22c55e]" />;
    if (s === "removed") return <FileMinus className="h-3.5 w-3.5 text-[#ef4444]" />;
    return <FileCode2 className="h-3.5 w-3.5 text-[#f59e0b]" />;
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

      <motion.div
        className="relative z-10 w-full max-h-[92vh] overflow-hidden flex flex-col rounded-t-[32px] border-t border-[#f0ece4]"
        style={{ background: "#fffcf8" }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={spring}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#e0d8d0]" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-3 pb-4 border-b border-[#f0ece4] shrink-0">
          <div className="h-12 w-12 rounded-[14px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <GitHubLogo className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[17px] font-black text-[#1a1a1a] truncate">{repo.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#faf7f3", color: "#9a8880", border: "1px solid #f0ece4" }}>
                {repo.private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                {repo.private ? "Private" : "Public"}
              </span>
            </div>
            <p className="text-[12px] text-[#6b6360] mt-0.5 truncate">{owner}/{repo.name}</p>
            {details?.description && <p className="text-[12px] text-[#9a8880] mt-1.5 leading-relaxed line-clamp-2">{details.description}</p>}
          </div>
          <motion.button onClick={onClose} className="h-9 w-9 rounded-xl bg-[#faf7f3] border border-[#f0ece4] flex items-center justify-center shrink-0 text-[#9a8880]" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-2.5 border-b border-[#f0ece4] shrink-0">
          {(["overview", "branches", "commits"] as SheetTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-colors"
              style={{ color: tab === t ? "#f97316" : "#9a8880", background: tab === t ? "#fff4ed" : "transparent" }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          {/* Clone URL copy */}
          <button onClick={copyCloneUrl} className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-[#9a8880] bg-[#faf7f3] border border-[#f0ece4] rounded-xl px-3 py-1.5">
            {copied ? <Check className="h-3 w-3 text-[#22c55e]" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Clone"}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
              <p className="text-[13px] text-[#9a8880] font-medium">Loading…</p>
            </div>
          ) : (
            <>
              {/* ─── OVERVIEW TAB ─── */}
              {tab === "overview" && (
                <>
                  {totalLOC > 0 && (
                    <motion.div className="rounded-[22px] p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Est. lines of code</p>
                          <div className="flex items-end gap-2">
                            <span className="text-[38px] font-black text-white leading-none tracking-tight">{fmtLOC(totalLOC)}</span>
                            <span className="text-[13px] font-bold text-white/40 mb-1">lines</span>
                          </div>
                          <p className="text-[10px] text-white/30 mt-1.5">from {languages.length} language{languages.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/8 flex items-center justify-center border border-white/10">
                          <GitHubLogo className="h-7 w-7 text-white/60" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { Icon: Star,        label: "Stars",    value: (details?.stargazers_count ?? 0).toLocaleString(), color: "#f97316", bg: "#fff4ed" },
                      { Icon: GitFork,     label: "Forks",    value: (details?.forks_count ?? 0).toLocaleString(),      color: "#3178c6", bg: "#eff6ff" },
                      { Icon: Eye,         label: "Watchers", value: (details?.watchers_count ?? 0).toLocaleString(),   color: "#22c55e", bg: "#f0fdf4" },
                      { Icon: AlertCircle, label: "Issues",   value: (details?.open_issues_count ?? 0).toLocaleString(), color: "#ef4444", bg: "#fef2f2" },
                      { Icon: HardDrive,   label: "Size",     value: fmtSize(details?.size ?? 0),                       color: "#9a8880", bg: "#faf7f3" },
                      { Icon: GitBranch,   label: "Default",  value: details?.default_branch ?? repo.default_branch,   color: "#f97316", bg: "#fff4ed" },
                    ].map(({ Icon, label, value, color, bg }) => (
                      <motion.div key={label} className="rounded-[16px] p-3 flex flex-col gap-2" style={{ background: bg }} whileHover={{ y: -1 }} transition={spring}>
                        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${color}99` }}>{label}</div>
                          <div className="text-[15px] font-black text-[#1a1a1a] leading-tight truncate">{value}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {languages.length > 0 && (
                    <div className="rounded-[20px] border border-[#f0ece4] p-4" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center"><Tag className="h-3.5 w-3.5 text-[#9a8880]" /></div>
                        <h3 className="text-[13px] font-black text-[#1a1a1a]">Languages</h3>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
                        {languages.map(l => (
                          <motion.div key={l.name} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${l.pct}%`, background: langColor(l.name), minWidth: l.pct > 1 ? 4 : 0 }} initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.1 }} />
                        ))}
                      </div>
                      <div className="space-y-2">
                        {languages.map(l => {
                          const loc = Math.round(l.bytes / (BYTES_PER_LINE[l.name] ?? 55));
                          return (
                            <div key={l.name} className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: langColor(l.name) }} />
                              <span className="text-[12px] font-bold text-[#1a1a1a] w-24 truncate">{l.name}</span>
                              <div className="flex-1 h-1.5 rounded-full bg-[#f0ece4] overflow-hidden">
                                <motion.div className="h-full rounded-full" style={{ background: langColor(l.name) }} initial={{ width: 0 }} animate={{ width: `${l.pct}%` }} transition={{ duration: 0.5, delay: 0.2 }} />
                              </div>
                              <span className="text-[11px] font-semibold text-[#9a8880] w-8 text-right">{l.pct.toFixed(0)}%</span>
                              <span className="text-[11px] font-bold text-[#6b6360] w-16 text-right">~{fmtLOC(loc)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {details?.topics?.length > 0 && (
                    <div className="rounded-[20px] border border-[#f0ece4] p-4" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                      <h3 className="text-[13px] font-black text-[#1a1a1a] mb-3">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {details.topics.map((t: string) => (
                          <span key={t} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#fff4ed] text-[#f97316] border border-[#f97316]/20">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {contributors.length > 0 && (
                    <div className="rounded-[20px] border border-[#f0ece4] p-4" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center"><Users className="h-3.5 w-3.5 text-[#9a8880]" /></div>
                        <h3 className="text-[13px] font-black text-[#1a1a1a]">Contributors</h3>
                      </div>
                      <div className="space-y-2">
                        {contributors.map(c => (
                          <motion.a key={c.login} href={c.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#faf7f3] transition-colors group" whileTap={{ scale: 0.98 }}>
                            <img src={c.avatar_url} alt={c.login} className="h-9 w-9 rounded-full border-2 border-[#f0ece4] shrink-0 object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#f97316] transition-colors">@{c.login}</div>
                              <div className="text-[11px] text-[#9a8880]">{c.contributions.toLocaleString()} commits</div>
                            </div>
                            <div className="h-1.5 w-16 rounded-full bg-[#f0ece4] overflow-hidden">
                              <motion.div className="h-full rounded-full bg-[#f97316]" style={{ width: `${Math.min(100, (c.contributions / (contributors[0]?.contributions || 1)) * 100)}%` }} initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  )}

                  {details && (
                    <div className="rounded-[20px] border border-[#f0ece4] p-4" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center"><Calendar className="h-3.5 w-3.5 text-[#9a8880]" /></div>
                        <h3 className="text-[13px] font-black text-[#1a1a1a]">Timeline</h3>
                        {details.license && <span className="ml-auto text-[11px] font-bold text-[#6b6360] bg-[#faf7f3] border border-[#f0ece4] rounded-full px-2.5 py-0.5">{details.license}</span>}
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { label: "Created",      value: fmtDate(details.created_at) },
                          { label: "Last updated", value: fmtDate(details.updated_at) },
                          { label: "Last push",    value: fmtDate(details.pushed_at)  },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between text-[12px]">
                            <span className="text-[#9a8880] font-medium">{label}</span>
                            <span className="font-semibold text-[#1a1a1a]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ─── BRANCHES TAB ─── */}
              {tab === "branches" && (
                <div className="space-y-3">
                  {/* Create new branch */}
                  <div className="rounded-[20px] border border-[#f0ece4] p-4" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[13px] font-black text-[#1a1a1a]">Branches</h3>
                      <button onClick={() => setShowBranchCreate(s => !s)} className="flex items-center gap-1.5 text-[11px] font-bold text-[#f97316] bg-[#fff4ed] rounded-full px-2.5 py-1.5 border border-[#f97316]/20">
                        <Plus className="h-3 w-3" />New
                      </button>
                    </div>

                    <AnimatePresence>
                      {showBranchCreate && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                          <div className="flex gap-2 pt-1">
                            <input
                              autoFocus
                              value={newBranchName}
                              onChange={e => setNewBranchName(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && handleCreateBranch()}
                              placeholder={`from ${details?.default_branch ?? "main"}`}
                              className="flex-1 text-[12px] rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-3 py-2 outline-none font-semibold placeholder:text-[#c8b8a2]"
                            />
                            <button onClick={handleCreateBranch} disabled={creatingBranch || !newBranchName.trim()} className="text-[11px] font-bold bg-[#f97316] text-white rounded-xl px-3 py-2 disabled:opacity-50">
                              {creatingBranch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {loadingBranches ? (
                      <div className="flex items-center gap-2 py-4 text-[#9a8880]"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-[12px]">Loading branches…</span></div>
                    ) : (
                      <div className="space-y-1.5">
                        {branches.map(b => (
                          <div key={b.name} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-[#faf7f3] border border-[#f0ece4] group">
                            <GitBranch className="h-3.5 w-3.5 text-[#9a8880] shrink-0" />
                            <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1 truncate">{b.name}</span>
                            {b.name === details?.default_branch && (
                              <span className="text-[9px] font-bold text-[#22c55e] bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-2 py-0.5">default</span>
                            )}
                            {b.protected && <Lock className="h-3 w-3 text-[#c8b8a2]" />}
                            {b.name !== details?.default_branch && !b.protected && (
                              <button onClick={() => handleDeleteBranch(b.name)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ef4444] hover:bg-[#fef2f2] rounded-lg p-1">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {branches.length === 0 && !loadingBranches && (
                          <p className="text-[12px] text-[#c8b8a2] text-center py-4">No branches found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── COMMITS TAB ─── */}
              {tab === "commits" && (
                <div className="rounded-[20px] border border-[#f0ece4] overflow-hidden" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                  <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#f7f4f0]">
                    <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center"><GitCommit className="h-3.5 w-3.5 text-[#9a8880]" /></div>
                    <h3 className="text-[13px] font-black text-[#1a1a1a]">Commit History</h3>
                    <span className="ml-auto text-[11px] font-bold text-[#9a8880] bg-[#faf7f3] rounded-full px-2 py-0.5">{commits.length}</span>
                  </div>
                  <div className="divide-y divide-[#f7f4f0]">
                    {commits.map((c, i) => (
                      <div key={c.sha}>
                        <motion.button
                          onClick={() => handleCommitClick(c)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#faf7f3] transition-colors text-left group"
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        >
                          <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#fff4ed]">
                            <span className="text-[9px] font-black font-mono text-[#9a8880]">{c.sha.slice(0, 4)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#f97316] transition-colors">{c.message}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9a8880]">
                              <span className="font-medium">{c.author}</span>
                              <span>·</span>
                              <span>{timeAgo(c.date)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 mt-1">
                            <ChevronDown className={`h-3.5 w-3.5 text-[#c8b8a2] transition-transform ${selectedCommit?.sha === c.sha ? "rotate-180" : ""}`} />
                            <a href={c.html_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                              <ExternalLink className="h-3 w-3 text-[#c8b8a2] hover:text-[#f97316] transition-colors" />
                            </a>
                          </div>
                        </motion.button>

                        {/* Commit detail panel */}
                        <AnimatePresence>
                          {selectedCommit?.sha === c.sha && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              {loadingCommit ? (
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#faf7f3]"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#9a8880]" /><span className="text-[11px] text-[#9a8880]">Loading…</span></div>
                              ) : commitDetail ? (
                                <div className="px-4 py-3 bg-[#faf7f3] border-b border-[#f7f4f0]">
                                  <div className="flex items-center gap-3 mb-2.5">
                                    <span className="text-[10px] font-bold text-[#22c55e] bg-[#f0fdf4] rounded-full px-2 py-0.5">+{commitDetail.stats.additions}</span>
                                    <span className="text-[10px] font-bold text-[#ef4444] bg-[#fef2f2] rounded-full px-2 py-0.5">-{commitDetail.stats.deletions}</span>
                                    <span className="text-[10px] font-bold text-[#9a8880]">{commitDetail.files.length} file{commitDetail.files.length !== 1 ? "s" : ""} changed</span>
                                  </div>
                                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {commitDetail.files.map((f: any) => (
                                      <div key={f.filename} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-white border border-[#f0ece4]">
                                        {fileStatusIcon(f.status)}
                                        <span className="text-[11px] font-medium text-[#1a1a1a] truncate flex-1">{f.filename}</span>
                                        <div className="flex items-center gap-1.5 shrink-0 text-[9px] font-bold">
                                          {f.additions > 0 && <span className="text-[#22c55e]">+{f.additions}</span>}
                                          {f.deletions > 0 && <span className="text-[#ef4444]">-{f.deletions}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="px-4 py-3 border-t border-[#f7f4f0]">
                      <button
                        onClick={loadMoreCommits}
                        disabled={loadingMore}
                        className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-[#9a8880] hover:text-[#f97316] py-2 transition-colors"
                      >
                        {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><ChevronDown className="h-3.5 w-3.5" />Load more commits</>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="h-2" />
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-5 pt-3 pb-6 border-t border-[#f0ece4] bg-[#fffcf8] flex gap-3">
          <motion.button onClick={onPush} className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-[14px] text-white" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }} transition={spring}>
            <UploadCloud className="h-4 w-4" strokeWidth={2.5} />Push to this repo
          </motion.button>
          <motion.a href={repo.html_url} target="_blank" rel="noreferrer" className="h-12 w-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} transition={spring}>
            <ExternalLink className="h-4 w-4 text-white" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReposPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter]     = useState<"all" | "public" | "private">("all");

  const isConnected = !!creds.githubToken;

  const { data: repos = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["github-repos", creds.githubToken],
    queryFn: () => listGitHubRepos({ data: { token: creds.githubToken! } }),
    enabled: !!creds.githubToken && !!isLoaded && isConnected,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const load = useCallback(() => { refetch(); }, [refetch]);

  const filtered = repos.filter(r => {
    if (filter === "public" && r.private) return false;
    if (filter === "private" && !r.private) return false;
    return r.name.toLowerCase().includes(query.toLowerCase()) || r.full_name.toLowerCase().includes(query.toLowerCase());
  });

  if (!isLoaded) return null;

  if (!isConnected) {
    return (
      <>
        <AnimatedCorner variant="repos" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <div className="h-20 w-20 rounded-[28px] bg-[#f5f5f5] flex items-center justify-center">
            <GitHubLogo className="h-10 w-10 text-[#9a8880]" />
          </div>
          <div>
            <h2 className="text-[20px] font-black text-[#1a1a1a] mb-1.5">GitHub not connected</h2>
            <p className="text-[13px] text-[#6b6360] max-w-[220px]">Connect your GitHub account in Settings.</p>
          </div>
          <MotionButton onClick={() => navigate({ to: "/settings" })} className="bg-[#f97316] text-white font-bold px-6 py-3.5 rounded-2xl text-[13px]">
            Go to Settings →
          </MotionButton>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedCorner variant="repos" />
      <AnimatePresence>
        {selected && (
          <RepoDetailSheet
            key="sheet"
            repo={selected}
            token={creds.githubToken!}
            onClose={() => setSelected(null)}
            onPush={() => { setSelected(null); navigate({ to: "/push" }); }}
          />
        )}
      </AnimatePresence>

      <FadeUp>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">Your repos</p>
            <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Repositories</h1>
          </div>
          <MotionButton onClick={load} className="h-9 w-9 rounded-xl bg-white border border-[#f0ece4] flex items-center justify-center text-[#9a8880]">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </MotionButton>
        </div>
      </FadeUp>

      {/* Search + filter */}
      <FadeUp delay={0.05}>
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border border-[#f0ece4] bg-white px-4 py-3">
            <Search className="h-4 w-4 text-[#c8b8a2] shrink-0" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search repositories…"
              className="flex-1 text-[13px] font-medium bg-transparent outline-none placeholder:text-[#c8b8a2]"
            />
            {query && <button onClick={() => setQuery("")}><X className="h-4 w-4 text-[#c8b8a2]" /></button>}
          </div>
          <div className="flex gap-1.5">
            {(["all", "public", "private"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors"
                style={{ background: filter === f ? "#f97316" : "#faf7f3", color: filter === f ? "#fff" : "#9a8880", border: `1px solid ${filter === f ? "#f97316" : "#f0ece4"}` }}>
                {f === "all" ? "All" : f === "public" ? "🌐 Public" : "🔒 Private"}
              </button>
            ))}
            {repos.length > 0 && <span className="ml-auto text-[10px] font-bold text-[#9a8880] self-center">{filtered.length} repos</span>}
          </div>
        </div>
      </FadeUp>

      {loading && (
        <FadeUp delay={0.1}>
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[72px] rounded-2xl bg-[#f0ece4] animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        </FadeUp>
      )}

      {!loading && (
        <StaggerContainer className="space-y-2">
          {filtered.map(repo => (
            <StaggerItem key={repo.id}>
              <motion.div
                onClick={() => setSelected(repo)}
                className="flex items-center gap-3.5 rounded-[20px] px-4 py-3.5 border border-[#f0ece4] cursor-pointer"
              style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
                whileHover={{ y: -2, boxShadow: "0 6px 24px rgba(0,0,0,0.07)" }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <div className="h-10 w-10 rounded-[12px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <GitHubLogo className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[13px] font-bold text-[#1a1a1a] truncate">{repo.name}</span>
                    <span>{repo.private ? <Lock className="h-2.5 w-2.5 text-[#c8b8a2]" /> : <Globe className="h-2.5 w-2.5 text-[#c8b8a2]" />}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#9a8880]">
                    {repo.language && (
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: langColor(repo.language) }} />{repo.language}</span>
                    )}
                    {repo.stargazers_count > 0 && <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{repo.stargazers_count}</span>}
                    <span className="flex items-center gap-1"><GitBranch className="h-2.5 w-2.5" />{repo.default_branch}</span>
                    <span>{timeAgo(repo.updated_at)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#c8b8a2] shrink-0" />
              </motion.div>
            </StaggerItem>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-16">
              <Archive className="h-12 w-12 text-[#d4ccc4] mx-auto mb-3" />
              <p className="text-[14px] font-bold text-[#1a1a1a]">No repositories found</p>
              <p className="text-[12px] text-[#9a8880] mt-1">{query ? "Try a different search" : "Create one on GitHub to get started."}</p>
            </div>
          )}
        </StaggerContainer>
      )}
    </>
  );
}
