import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Search, Star, Loader2, Lock, Globe,
  ExternalLink, RefreshCw, UploadCloud, Archive, X,
  GitCommit, Users, AlertCircle, Calendar, HardDrive,
  GitFork, Eye, Tag, Zap, ChevronRight,
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import {
  listGitHubRepos, getRepoDetails, getRepoLanguages,
  getRepoCommits, getRepoContributors,
} from "@/lib/github-api";

export const Route = createFileRoute("/repositories")({ component: ReposPage });

/* ─── Language colour palette ─── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f0b429", Python: "#3776ab",
  CSS: "#264de4", HTML: "#e34c26", Rust: "#dea584", Go: "#00ADD8",
  Java: "#b07219", "C++": "#f34b7d", Ruby: "#701516", Kotlin: "#7f52ff",
  Swift: "#f05138", Dart: "#00b4ab", Shell: "#89e051", Vue: "#41b883",
  PHP: "#4f5d95", Scala: "#dc322f", Haskell: "#5d4f85", R: "#276dc2",
};
function langColor(name: string) { return LANG_COLORS[name] ?? "#c8b8a2"; }

/* ─── Helpers ─── */
function fmtSize(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
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

/* ─── Repo Detail Sheet ─── */
interface DetailSheetProps {
  repo: any;
  token: string;
  onClose: () => void;
  onPush: () => void;
}

function RepoDetailSheet({ repo, token, onClose, onPush }: DetailSheetProps) {
  const [details, setDetails]         = useState<any>(null);
  const [languages, setLanguages]     = useState<any[]>([]);
  const [commits, setCommits]         = useState<any[]>([]);
  const [contributors, setContribs]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  const [owner, repoName] = repo.full_name.split("/");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getRepoDetails({ data: { token, owner, repo: repoName } }),
      getRepoLanguages({ data: { token, owner, repo: repoName } }),
      getRepoCommits({ data: { token, owner, repo: repoName, per_page: 8 } }),
      getRepoContributors({ data: { token, owner, repo: repoName } }),
    ]).then(([d, l, c, ct]) => {
      if (!cancelled) { setDetails(d); setLanguages(l); setCommits(c); setContribs(ct); }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [repo.full_name]);

  const spring = { type: "spring", stiffness: 320, damping: 28 } as const;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative z-10 w-full max-h-[92vh] overflow-hidden flex flex-col rounded-t-[32px] border-t border-[#f0ece4]"
        style={{ background: "#fffcf8" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={spring}
      >
        {/* Drag handle */}
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
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#faf7f3", color: "#9a8880", border: "1px solid #f0ece4" }}>
                {repo.private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                {repo.private ? "Private" : "Public"}
              </span>
            </div>
            <p className="text-[12px] text-[#6b6360] mt-0.5 truncate">{owner}/{repo.name}</p>
            {details?.description && (
              <p className="text-[12px] text-[#9a8880] mt-1.5 leading-relaxed line-clamp-2">{details.description}</p>
            )}
          </div>
          <motion.button onClick={onClose}
            className="h-9 w-9 rounded-xl bg-[#faf7f3] border border-[#f0ece4] flex items-center justify-center shrink-0 text-[#9a8880]"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
              <p className="text-[13px] text-[#9a8880] font-medium">Loading repository data…</p>
            </div>
          ) : (
            <>
              {/* ── Stats grid ── */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { Icon: Star,        label: "Stars",   value: (details?.stargazers_count ?? repo.stargazers_count ?? 0).toLocaleString(), color: "#f97316", bg: "#fff4ed" },
                  { Icon: GitFork,     label: "Forks",   value: (details?.forks_count ?? 0).toLocaleString(),                              color: "#3178c6", bg: "#eff6ff" },
                  { Icon: Eye,         label: "Watchers",value: (details?.watchers_count ?? 0).toLocaleString(),                           color: "#22c55e", bg: "#f0fdf4" },
                  { Icon: AlertCircle, label: "Issues",  value: (details?.open_issues_count ?? 0).toLocaleString(),                        color: "#ef4444", bg: "#fef2f2" },
                  { Icon: HardDrive,   label: "Size",    value: fmtSize(details?.size ?? 0),                                               color: "#9a8880", bg: "#faf7f3" },
                  { Icon: GitBranch,   label: "Branch",  value: details?.default_branch ?? repo.default_branch,                           color: "#f97316", bg: "#fff4ed" },
                ].map(({ Icon, label, value, color, bg }) => (
                  <motion.div key={label}
                    className="rounded-[16px] p-3 flex flex-col gap-2"
                    style={{ background: bg }}
                    whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                    transition={spring}
                  >
                    <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${color}99` }}>{label}</div>
                      <div className="text-[15px] font-black text-[#1a1a1a] leading-tight truncate">{value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Language breakdown ── */}
              {languages.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#f0ece4] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center">
                      <Tag className="h-3.5 w-3.5 text-[#9a8880]" />
                    </div>
                    <h3 className="text-[13px] font-black text-[#1a1a1a]">Languages</h3>
                  </div>

                  {/* Bar */}
                  <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
                    {languages.map((l) => (
                      <motion.div
                        key={l.name}
                        className="h-full first:rounded-l-full last:rounded-r-full"
                        style={{ width: `${l.pct}%`, background: langColor(l.name), minWidth: l.pct > 1 ? 4 : 0 }}
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {languages.map((l) => (
                      <div key={l.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: langColor(l.name) }} />
                        <span className="text-[12px] font-semibold text-[#1a1a1a]">{l.name}</span>
                        <span className="text-[11px] text-[#9a8880]">{l.pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Topics ── */}
              {details?.topics?.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#f0ece4] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center">
                      <Tag className="h-3.5 w-3.5 text-[#9a8880]" />
                    </div>
                    <h3 className="text-[13px] font-black text-[#1a1a1a]">Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.topics.map((t: string) => (
                      <span key={t}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#fff4ed] text-[#f97316] border border-[#f97316]/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Recent commits ── */}
              {commits.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#f0ece4] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#f7f4f0]">
                    <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center">
                      <GitCommit className="h-3.5 w-3.5 text-[#9a8880]" />
                    </div>
                    <h3 className="text-[13px] font-black text-[#1a1a1a]">Recent Commits</h3>
                    <span className="ml-auto text-[11px] font-bold text-[#9a8880] bg-[#faf7f3] rounded-full px-2 py-0.5">{commits.length}</span>
                  </div>
                  <div className="divide-y divide-[#f7f4f0]">
                    {commits.map((c, i) => (
                      <motion.a
                        key={c.sha}
                        href={c.html_url} target="_blank" rel="noreferrer"
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#faf7f3] transition-colors group"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                      >
                        {/* Hash dot */}
                        <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-black font-mono text-[#9a8880]">{c.sha.slice(0, 4)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#f97316] transition-colors">
                            {c.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9a8880]">
                            <span className="font-medium">{c.author}</span>
                            <span>·</span>
                            <span>{timeAgo(c.date)}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-[#c8b8a2] shrink-0 mt-1 group-hover:text-[#f97316] transition-colors" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Contributors ── */}
              {contributors.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#f0ece4] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-[#9a8880]" />
                    </div>
                    <h3 className="text-[13px] font-black text-[#1a1a1a]">Contributors</h3>
                  </div>
                  <div className="space-y-2">
                    {contributors.map((c) => (
                      <motion.a
                        key={c.login}
                        href={c.html_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#faf7f3] transition-colors group"
                        whileTap={{ scale: 0.98 }}
                      >
                        <img src={c.avatar_url} alt={c.login}
                          className="h-9 w-9 rounded-full border-2 border-[#f0ece4] shrink-0 object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#f97316] transition-colors">@{c.login}</div>
                          <div className="text-[11px] text-[#9a8880]">{c.contributions.toLocaleString()} commits</div>
                        </div>
                        {/* Mini bar */}
                        <div className="h-1.5 w-16 rounded-full bg-[#f0ece4] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#f97316]"
                            style={{ width: `${Math.min(100, (c.contributions / (contributors[0]?.contributions || 1)) * 100)}%` }}
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-[#c8b8a2] shrink-0 group-hover:text-[#f97316] transition-colors" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Dates ── */}
              {details && (
                <div className="bg-white rounded-[20px] border border-[#f0ece4] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#faf7f3] flex items-center justify-center">
                      <Calendar className="h-3.5 w-3.5 text-[#9a8880]" />
                    </div>
                    <h3 className="text-[13px] font-black text-[#1a1a1a]">Timeline</h3>
                    {details.license && (
                      <span className="ml-auto text-[11px] font-bold text-[#6b6360] bg-[#faf7f3] border border-[#f0ece4] rounded-full px-2.5 py-0.5">
                        {details.license}
                      </span>
                    )}
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

              {/* Bottom spacer */}
              <div className="h-2" />
            </>
          )}
        </div>

        {/* Sticky footer CTA */}
        <div className="shrink-0 px-5 pt-3 pb-6 border-t border-[#f0ece4] bg-[#fffcf8] flex gap-3">
          <motion.button
            onClick={onPush}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-[14px] text-white"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            <UploadCloud className="h-4.5 w-4.5" strokeWidth={2.5} />
            Push to this repo
          </motion.button>
          <motion.a
            href={repo.html_url} target="_blank" rel="noreferrer"
            className="h-12 w-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0"
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            <ExternalLink className="h-4 w-4 text-white" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main page ─── */
function ReposPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [repos, setRepos]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [query, setQuery]         = useState("");
  const [selected, setSelected]   = useState<any>(null);

  const isConnected = !!creds.githubToken;

  useEffect(() => {
    if (!isLoaded || !isConnected) return;
    load();
  }, [isLoaded, isConnected]);

  const load = useCallback(async () => {
    if (!creds.githubToken) return;
    setLoading(true);
    try { setRepos(await listGitHubRepos({ data: { token: creds.githubToken } })); }
    catch {}
    finally { setLoading(false); }
  }, [creds.githubToken]);

  const filtered = repos.filter(
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) ||
           r.full_name.toLowerCase().includes(query.toLowerCase())
  );

  function handlePush(repo: any) {
    setSelected(null);
    navigate({ to: "/push" });
  }

  return (
    <AppShell>
      <AnimatedCorner variant="repos" />

      {/* Detail sheet */}
      <AnimatePresence>
        {selected && (
          <RepoDetailSheet
            repo={selected}
            token={creds.githubToken!}
            onClose={() => setSelected(null)}
            onPush={() => handlePush(selected)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <FadeUp>
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">GitHub</p>
          <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Repositories</h1>
          <p className="text-[13px] text-[#9a8880] mt-0.5">
            {isConnected
              ? loading ? "Loading your repos…" : `${repos.length} connected repos`
              : "Connect GitHub in Settings."}
          </p>
        </div>
      </FadeUp>

      {!isConnected ? (
        <FadeUp delay={0.08}>
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <motion.div
              className="h-20 w-20 rounded-[24px] bg-[#1a1a1a] flex items-center justify-center shadow-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GitHubLogo className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <p className="text-[15px] font-black text-[#1a1a1a] mb-1.5">GitHub not connected</p>
              <p className="text-[12px] text-[#9a8880] max-w-[200px] leading-relaxed">
                Add your GitHub token in Settings to browse repositories.
              </p>
            </div>
            <MotionButton
              onClick={() => navigate({ to: "/settings" })}
              className="flex items-center gap-2 bg-[#1a1a1a] text-white font-bold px-6 py-3 rounded-2xl text-[13px]"
            >
              <GitHubLogo className="h-4 w-4" />Go to Settings
            </MotionButton>
          </div>
        </FadeUp>
      ) : (
        <>
          {/* Search + Refresh */}
          <FadeUp delay={0.06}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-[#f0ece4] shadow-sm">
                <Search className="h-4 w-4 text-[#c8b8a2] shrink-0" />
                <input
                  placeholder="Search repositories…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#c8b8a2] text-[#1a1a1a]"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[#c8b8a2] hover:text-[#9a8880] text-[11px] font-medium">✕</button>
                )}
              </div>
              <motion.button
                onClick={load}
                disabled={loading}
                className="h-11 w-11 rounded-2xl bg-white border border-[#f0ece4] flex items-center justify-center shrink-0 shadow-sm"
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.9, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 text-[#f97316]" />
                    : <RefreshCw className="h-4 w-4 text-[#9a8880]" />}
                </motion.div>
              </motion.button>
            </div>
          </FadeUp>

          {!loading && filtered.length > 0 && (
            <FadeUp delay={0.08}>
              <p className="text-[11px] font-bold text-[#9a8880] uppercase tracking-wider mb-3">
                {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `${repos.length} repositories`}
              </p>
            </FadeUp>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#f97316]" />
              <p className="text-[12px] text-[#9a8880] font-medium">Fetching repositories…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#faf7f3] flex items-center justify-center">
                <Archive className="h-7 w-7 text-[#c8b8a2]" />
              </div>
              <p className="text-[13px] font-bold text-[#1a1a1a]">{query ? "No matching repos" : "No repositories found"}</p>
              {query && <button onClick={() => setQuery("")} className="text-[12px] font-semibold text-[#f97316]">Clear search</button>}
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
              {filtered.map((r) => (
                <StaggerItem key={r.id}>
                  <motion.div
                    className="bg-white rounded-[20px] border border-[#f0ece4] shadow-sm overflow-hidden cursor-pointer"
                    whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.09)", borderColor: "rgba(249,115,22,0.22)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    onClick={() => setSelected(r)}
                  >
                    {/* Top row */}
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                      <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0 mt-0.5">
                        <GitHubLogo className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[14px] font-bold text-[#1a1a1a]">{r.name}</span>
                          {r.private
                            ? <Lock className="h-3 w-3 text-[#c8b8a2] shrink-0" />
                            : <Globe className="h-3 w-3 text-[#c8b8a2] shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {r.language && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#6b6360] font-medium">
                              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: langColor(r.language) }} />
                              {r.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-[#9a8880]">
                            <Star className="h-3 w-3" />{r.stargazers_count}
                          </span>
                          <span className="text-[11px] text-[#9a8880]">{timeAgo(r.updated_at)}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#c8b8a2] shrink-0 mt-1" />
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center gap-2 px-4 pb-3 pt-2 border-t border-[#f7f4f0]"
                      onClick={(e) => e.stopPropagation()}>
                      <span className="flex items-center gap-1.5 bg-[#fff4ed] text-[#f97316] rounded-lg px-2.5 py-1 text-[11px] font-bold">
                        <GitBranch className="h-3 w-3" />{r.default_branch}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <motion.button
                          onClick={() => { setSelected(r); }}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#9a8880] bg-[#faf7f3] border border-[#f0ece4]"
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                        >
                          <Zap className="h-3 w-3" />Details
                        </motion.button>
                        <motion.button
                          onClick={() => { navigate({ to: "/push" }); }}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#f97316] bg-[#fff4ed]"
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                          transition={{ type: "spring", stiffness: 400, damping: 26 }}
                        >
                          <UploadCloud className="h-3.5 w-3.5" />Push
                        </motion.button>
                        <motion.a
                          href={r.html_url} target="_blank" rel="noreferrer"
                          className="h-8 w-8 rounded-xl bg-[#faf7f3] border border-[#f0ece4] flex items-center justify-center text-[#9a8880]"
                          whileHover={{ scale: 1.1, backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                          transition={{ type: "spring", stiffness: 380, damping: 22 }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </>
      )}
    </AppShell>
  );
}
