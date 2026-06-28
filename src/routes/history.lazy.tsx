import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, GitCommit, GitBranch, Clock, History as HistoryIcon,
  AlertCircle, Trash2, ExternalLink, TrendingUp, Zap, Search,
  Download, X, Flame, RefreshCw,
} from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo, FlootLogo, ZiteLogo } from "@/components/BrandLogos";
import { getHistory, clearHistory, formatRelativeTime, getPushStreak, savePushPrefs, type PushRecord } from "@/lib/storage";

export const Route = createLazyFileRoute("/history")({  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const [allEvents, setAllEvents]   = useState<PushRecord[]>([]);
  const [query, setQuery]           = useState("");
  const [statusFilter, setStatus]   = useState<"all" | "success" | "failed">("all");
  const [appFilter, setAppFilter]   = useState("all");
  const [streak, setStreak]         = useState(0);

  useEffect(() => {
    setAllEvents(getHistory());
    setStreak(getPushStreak());
  }, []);

  const uniqueApps = useMemo(() => {
    const names = [...new Set(allEvents.map(e => e.appName))].sort();
    return names;
  }, [allEvents]);

  const events = useMemo(() => {
    return allEvents.filter(e => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (appFilter !== "all" && e.appName !== appFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return e.appName.toLowerCase().includes(q) ||
               e.repo.toLowerCase().includes(q) ||
               e.commitMessage.toLowerCase().includes(q) ||
               e.branch.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allEvents, statusFilter, appFilter, query]);

  const successCount = allEvents.filter(e => e.status === "success").length;
  const failCount    = allEvents.filter(e => e.status === "failed").length;
  const successRate  = allEvents.length === 0 ? null : Math.round((successCount / allEvents.length) * 100);
  const totalFiles   = allEvents.filter(e => e.status === "success").reduce((s, e) => s + e.filesCount, 0);
  const avgFiles     = successCount > 0 ? Math.round(totalFiles / successCount) : 0;

  const mostPushedApp = useMemo(() => {
    if (!allEvents.length) return null;
    const counts: Record<string, number> = {};
    allEvents.filter(e => e.status === "success").forEach(e => { counts[e.appName] = (counts[e.appName] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? { name: top[0], count: top[1] } : null;
  }, [allEvents]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(allEvents, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `push44-history-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleRepush = (e: PushRecord) => {
    savePushPrefs({
      platform: e.platform ?? "base44",
      repushAppName: e.appName,
      lastRepo: e.repo ? { full_name: e.repo, default_branch: e.branch, html_url: `https://github.com/${e.repo}` } : null,
    });
    navigate({ to: "/push" });
  };

  const platformIcon = (platform?: string) => {
    if (platform === "rocket") return <RocketLogo size={12} />;
    if (platform === "floot")  return <FlootLogo  size={12} />;
    if (platform === "zite")   return <ZiteLogo   size={12} />;
    if (platform === "base44") return <Base44Logo size={12} />;
    return null;
  };

  return (
    <>
      <AnimatedCorner variant="history" />

      <FadeUp>
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">Activity</p>
          <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Push History</h1>
          <p className="text-[13px] text-[#9a8880] mt-0.5">Every push from this device.</p>
        </div>
      </FadeUp>

      {/* Stats grid */}
      <StaggerContainer className="grid grid-cols-2 gap-3 mb-3">
        {[
          { label: "Total pushes", value: allEvents.length, sub: successCount > 0 ? `${successCount} succeeded` : "No pushes yet", bg: "#fff4ed", border: "#fed7aa", accent: "#f97316", Icon: Zap },
          { label: "Success rate", value: successRate !== null ? `${successRate}%` : "—", sub: failCount > 0 ? `${failCount} failed` : "All good", bg: "#f0fdf4", border: "#bbf7d0", accent: "#22c55e", Icon: TrendingUp },
        ].map(({ label, value, sub, bg, border, accent, Icon }) => (
          <StaggerItem key={label}>
            <motion.div className="rounded-[20px] p-4 border" style={{ background: bg, borderColor: border }} whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }} transition={{ type: "spring", stiffness: 380, damping: 28 }}>
              <div className="h-9 w-9 rounded-[12px] flex items-center justify-center mb-3" style={{ background: `${accent}20` }}>
                <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: `${accent}99` }}>{label}</div>
              <div className="text-[24px] font-black text-[#1a1a1a] leading-none mb-1">{value}</div>
              <div className="text-[11px] font-semibold" style={{ color: accent }}>{sub}</div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Extra stats row */}
      {allEvents.length > 0 && (
        <FadeUp delay={0.08}>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-2xl px-3 py-3 border border-[#f0ece4] text-center" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <div className="text-[18px] font-black text-[#1a1a1a] leading-none">{totalFiles.toLocaleString()}</div>
              <div className="text-[9px] font-bold text-[#9a8880] uppercase tracking-wide mt-1">Total files</div>
            </div>
            <div className="rounded-2xl px-3 py-3 border border-[#f0ece4] text-center" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <div className="text-[18px] font-black text-[#1a1a1a] leading-none">{avgFiles}</div>
              <div className="text-[9px] font-bold text-[#9a8880] uppercase tracking-wide mt-1">Avg / push</div>
            </div>
            <div className="rounded-2xl px-3 py-3 border text-center" style={{ background: streak > 0 ? "rgba(255,244,237,0.9)" : "rgba(255,255,255,0.85)", borderColor: streak > 0 ? "#fed7aa" : "#f0ece4", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-center gap-1">
                {streak > 0 && <Flame className="h-3.5 w-3.5 text-[#f97316]" />}
                <div className="text-[18px] font-black leading-none" style={{ color: streak > 0 ? "#f97316" : "#1a1a1a" }}>{streak}</div>
              </div>
              <div className="text-[9px] font-bold text-[#9a8880] uppercase tracking-wide mt-1">Day streak</div>
            </div>
          </div>
        </FadeUp>
      )}

      {/* Empty state — no pushes yet */}
      {allEvents.length === 0 && (
        <FadeUp delay={0.12}>
          <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
            <motion.div
              className="h-20 w-20 rounded-[28px] flex items-center justify-center"
              style={{ background: "#fff4ed", boxShadow: "0 4px 24px rgba(249,115,22,0.12)" }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <HistoryIcon className="h-9 w-9 text-[#f97316]" />
            </motion.div>
            <div>
              <h2 className="text-[20px] font-black text-[#1a1a1a] mb-1.5">No pushes yet</h2>
              <p className="text-[13px] text-[#9a8880] max-w-[220px] leading-relaxed">
                Every time you push code to GitHub it will appear here — with full details.
              </p>
            </div>
            <MotionButton
              onClick={() => navigate({ to: "/push" })}
              className="flex items-center gap-2 rounded-2xl px-6 py-3 text-white text-[13px] font-bold"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}
            >
              <Zap className="h-4 w-4" strokeWidth={2.5} />Make your first push
            </MotionButton>
          </div>
        </FadeUp>
      )}

      {/* Most pushed app */}
      {mostPushedApp && (
        <FadeUp delay={0.1}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 border border-[#f0ece4]"
            style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="h-9 w-9 rounded-xl bg-[#fff4ed] flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-[#f97316]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[#9a8880] uppercase tracking-wide">Most pushed app</div>
              <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{mostPushedApp.name}</div>
            </div>
            <div className="text-[20px] font-black text-[#f97316]">{mostPushedApp.count}×</div>
          </div>
        </FadeUp>
      )}

      {/* Search + filters */}
      {allEvents.length > 0 && (
        <FadeUp delay={0.12}>
          <div className="rounded-[24px] border border-[#f0ece4] overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3 border-b border-[#f7f4f0]">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-3 py-2 mb-2.5">
                <Search className="h-3.5 w-3.5 text-[#c8b8a2] shrink-0" />
                <input
                  value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search apps, repos, commits…"
                  className="flex-1 text-[12px] font-medium bg-transparent outline-none placeholder:text-[#c8b8a2]"
                />
                {query && <button onClick={() => setQuery("")}><X className="h-3.5 w-3.5 text-[#c8b8a2]" /></button>}
              </div>

              {/* Status filter */}
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "success", "failed"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors"
                    style={{
                      background: statusFilter === s ? (s === "failed" ? "#fef2f2" : s === "success" ? "#f0fdf4" : "#f97316") : "#faf7f3",
                      color: statusFilter === s ? (s === "failed" ? "#ef4444" : s === "success" ? "#22c55e" : "#fff") : "#9a8880",
                      border: `1px solid ${statusFilter === s ? (s === "failed" ? "#fecaca" : s === "success" ? "#bbf7d0" : "#f97316") : "#f0ece4"}`,
                    }}
                  >
                    {s === "all" ? "All" : s === "success" ? "✓ Success" : "✗ Failed"}
                  </button>
                ))}

                {/* App filter */}
                {uniqueApps.length > 1 && (
                  <select
                    value={appFilter}
                    onChange={e => setAppFilter(e.target.value)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#faf7f3] border border-[#f0ece4] text-[#9a8880] outline-none"
                  >
                    <option value="all">All apps</option>
                    {uniqueApps.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ece4]">
              <h3 className="text-[13px] font-black text-[#1a1a1a]">
                {events.length} {events.length === allEvents.length ? "" : `of ${allEvents.length} `}records
              </h3>
              <div className="flex gap-2">
                <MotionButton onClick={handleExport} className="flex items-center gap-1.5 text-[#9a8880] text-[11px] font-bold bg-[#faf7f3] rounded-full px-3 py-1.5 border border-[#f0ece4]">
                  <Download className="h-3 w-3" />Export
                </MotionButton>
                <MotionButton onClick={() => {
                  if (window.confirm(`Clear all ${allEvents.length} push records? This cannot be undone.`)) {
                    clearHistory();
                    setAllEvents([]);
                  }
                }} className="flex items-center gap-1.5 text-[#ef4444] text-[11px] font-bold bg-[#fef2f2] rounded-full px-3 py-1.5">
                  <Trash2 className="h-3 w-3" />Clear
                </MotionButton>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-4 py-4">
              <AnimatePresence mode="wait">
                {events.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <motion.div className="h-14 w-14 rounded-[20px] flex items-center justify-center bg-[#faf7f3]" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                      <HistoryIcon className="h-7 w-7 text-[#c8b8a2]" />
                    </motion.div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">{allEvents.length > 0 ? "No results" : "Nothing pushed yet"}</p>
                    <p className="text-[11px] text-[#9a8880]">{allEvents.length > 0 ? "Try clearing the filters." : "Your push history will appear here."}</p>
                    {allEvents.length === 0 && (
                      <MotionButton onClick={() => navigate({ to: "/push" })} className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-white text-[12px] font-bold" style={{ background: "#f97316" }}>
                        <Zap className="h-3.5 w-3.5" />Make your first push
                      </MotionButton>
                    )}
                  </motion.div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[17px] top-3 bottom-3 w-px" style={{ background: "linear-gradient(to bottom, #f97316, rgba(249,115,22,0.1))" }} />
                    <ul className="space-y-3">
                      {events.map((e, i) => {
                        const ok = e.status === "success";
                        return (
                          <motion.li key={e.id} className="flex items-start gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}>
                            <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white"
                              style={{ background: ok ? "#fff4ed" : "#fef2f2", boxShadow: ok ? "0 0 0 2px rgba(249,115,22,0.2)" : "0 0 0 2px rgba(239,68,68,0.15)" }}>
                              {ok ? <Check className="h-4 w-4 text-[#f97316]" strokeWidth={3} /> : <AlertCircle className="h-4 w-4 text-[#ef4444]" strokeWidth={2.5} />}
                            </div>
                            <motion.div
                              className="flex-1 min-w-0 rounded-2xl p-3.5 border"
                              style={{ background: ok ? "#fafafa" : "#fef9f9", borderColor: ok ? "#f0ece4" : "#fecaca" }}
                              whileHover={{ y: -1, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                              transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {platformIcon(e.platform)}
                                  <div className="font-bold text-[13px] text-[#1a1a1a] truncate">{e.appName}</div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-[#9a8880] shrink-0">
                                  <Clock className="h-2.5 w-2.5" />{formatRelativeTime(e.timestamp)}
                                </div>
                              </div>
                              <div className="text-[11px] text-[#6b6360] truncate mb-0.5">{e.repo}</div>
                              <div className="text-[11px] text-[#9a8880] italic truncate mb-1">"{e.commitMessage}"</div>

                              {e.aiPrompt && (
                                <div className="mt-2 p-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#d97706] uppercase tracking-wider mb-1">
                                    <Zap className="h-2.5 w-2.5" /> AI Context
                                  </div>
                                  <div className="text-[10px] text-[#92400e] line-clamp-3 leading-relaxed">
                                    {e.aiPrompt}
                                  </div>
                                </div>
                              )}

                              {/* Diff pills */}
                              {ok && (e.newCount !== undefined || e.modifiedCount !== undefined || e.deletedCount !== undefined) && (
                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                  {(e.newCount ?? 0) > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#22c55e] border border-[#bbf7d0]">+{e.newCount}</span>}
                                  {(e.modifiedCount ?? 0) > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">~{e.modifiedCount}</span>}
                                  {(e.deletedCount ?? 0) > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#fef2f2] text-[#ef4444] border border-[#fecaca]">−{e.deletedCount}</span>}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                {e.commitHash && (
                                  <span className="flex items-center gap-1 bg-[#f5f2ee] rounded-lg px-2 py-0.5 text-[10px] font-mono text-[#6b6360]">
                                    <GitCommit className="h-2.5 w-2.5" />{e.commitHash.slice(0, 7)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 bg-[#f5f2ee] rounded-lg px-2 py-0.5 text-[10px] text-[#6b6360]">
                                  <GitBranch className="h-2.5 w-2.5" />{e.branch}
                                </span>
                                <span className="text-[10px] font-semibold text-[#9a8880] bg-[#f5f2ee] rounded-lg px-2 py-0.5">
                                  {e.filesCount} files
                                </span>

                                {/* Action buttons */}
                                <div className="ml-auto flex items-center gap-1.5">
                                  {ok && (
                                    <motion.button
                                      onClick={() => handleRepush(e)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-[#f97316] bg-[#fff4ed] rounded-lg px-2 py-0.5 border border-[#fde0c8]"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <RefreshCw className="h-2.5 w-2.5" />Re-push
                                    </motion.button>
                                  )}
                                  {e.commitHash && (
                                    <a href={`https://github.com/${e.repo}/commit/${e.commitHash}`} target="_blank" rel="noreferrer"
                                      className="flex items-center gap-1 text-[10px] font-semibold text-[#9a8880] hover:text-[#f97316] transition-colors">
                                      View <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                              {!ok && e.error && (
                                <div className="mt-2 text-[11px] text-[#ef4444] bg-[#fef2f2] rounded-lg px-2.5 py-1.5 font-medium">{e.error}</div>
                              )}
                            </motion.div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeUp>
      )}

      {/* Empty state (no history at all) */}
      {allEvents.length === 0 && (
        <FadeUp delay={0.1}>
          <div className="rounded-[24px] border border-[#f0ece4] p-8 flex flex-col items-center text-center gap-4"
            style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <motion.div className="h-16 w-16 rounded-[22px] flex items-center justify-center bg-[#faf7f3]" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <HistoryIcon className="h-8 w-8 text-[#c8b8a2]" />
            </motion.div>
            <div>
              <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">Nothing pushed yet</p>
              <p className="text-[12px] text-[#9a8880] max-w-[180px]">Your push history will appear here after your first commit.</p>
            </div>
            <MotionButton onClick={() => navigate({ to: "/push" })} className="flex items-center gap-2 rounded-2xl px-5 py-3 text-white text-[13px] font-bold" style={{ background: "#f97316" }}>
              <Zap className="h-4 w-4" strokeWidth={2.5} />Make your first push
            </MotionButton>
          </div>
        </FadeUp>
      )}
    </>
  );
}
