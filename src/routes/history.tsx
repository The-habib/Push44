import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, GitCommit, GitBranch, Clock, History as HistoryIcon,
  AlertCircle, Trash2, ExternalLink, TrendingUp, Zap,
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { getHistory, clearHistory, formatRelativeTime, type PushRecord } from "@/lib/storage";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PushRecord[]>([]);

  useEffect(() => { setEvents(getHistory()); }, []);

  const successCount = events.filter((e) => e.status === "success").length;
  const failCount    = events.filter((e) => e.status === "failed").length;
  const successRate  = events.length === 0 ? null : Math.round((successCount / events.length) * 100);
  const totalFiles   = events.filter(e => e.status === "success").reduce((s, e) => s + e.filesCount, 0);

  return (
    <AppShell>
      <AnimatedCorner variant="history" />

      {/* Header */}
      <FadeUp>
        <div className="mb-6">
          <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">Activity</p>
          <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Push History</h1>
          <p className="text-[13px] text-[#9a8880] mt-0.5">Every push from this device.</p>
        </div>
      </FadeUp>

      {/* Stats grid */}
      <StaggerContainer className="grid grid-cols-2 gap-3 mb-5">
        {[
          {
            label: "Total pushes", value: events.length,
            sub: successCount > 0 ? `${successCount} succeeded` : "No pushes yet",
            bg: "#fff4ed", border: "#fed7aa", accent: "#f97316",
            Icon: Zap,
          },
          {
            label: "Success rate", value: successRate !== null ? `${successRate}%` : "—",
            sub: failCount > 0 ? `${failCount} failed` : "All good",
            bg: "#f0fdf4", border: "#bbf7d0", accent: "#22c55e",
            Icon: TrendingUp,
          },
        ].map(({ label, value, sub, bg, border, accent, Icon }) => (
          <StaggerItem key={label}>
            <motion.div
              className="rounded-[20px] p-4 border"
              style={{ background: bg, borderColor: border }}
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
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

      {/* Files pushed banner */}
      {totalFiles > 0 && (
        <FadeUp delay={0.1}>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 mb-4 border border-[#f0ece4]">
            <div className="h-9 w-9 rounded-xl bg-[#fff4ed] flex items-center justify-center shrink-0">
              <GitHubLogo className="h-4 w-4 text-[#f97316]" />
            </div>
            <div>
              <span className="text-[20px] font-black text-[#1a1a1a]">{totalFiles.toLocaleString()}</span>
              <span className="text-[13px] font-medium text-[#9a8880] ml-1.5">total files pushed to GitHub</span>
            </div>
          </div>
        </FadeUp>
      )}

      {/* Timeline */}
      <FadeUp delay={0.14}>
        <div className="bg-white rounded-[24px] border border-[#f0ece4] overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ece4]">
            <h3 className="text-[14px] font-black text-[#1a1a1a]">Activity</h3>
            {events.length > 0 && (
              <MotionButton
                onClick={() => { clearHistory(); setEvents([]); }}
                className="flex items-center gap-1.5 text-[#ef4444] text-[12px] font-semibold bg-[#fef2f2] rounded-full px-3 py-1.5"
              >
                <Trash2 className="h-3 w-3" />Clear all
              </MotionButton>
            )}
          </div>

          <div className="px-5 py-4">
            <AnimatePresence mode="wait">
              {events.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-14 gap-4 text-center"
                >
                  <motion.div
                    className="h-16 w-16 rounded-[22px] flex items-center justify-center"
                    style={{ background: "#faf7f3" }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <HistoryIcon className="h-8 w-8 text-[#c8b8a2]" />
                  </motion.div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">Nothing pushed yet</p>
                    <p className="text-[12px] text-[#9a8880] max-w-[180px]">Your push history will appear here after your first commit.</p>
                  </div>
                  <MotionButton
                    onClick={() => navigate({ to: "/push" })}
                    className="flex items-center gap-2 rounded-2xl px-5 py-3 text-white text-[13px] font-bold"
                    style={{ background: "#f97316" }}
                  >
                    <Zap className="h-4 w-4" strokeWidth={2.5} />Make your first push
                  </MotionButton>
                </motion.div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-3 bottom-3 w-px" style={{ background: "linear-gradient(to bottom, #f97316, rgba(249,115,22,0.1))" }} />

                  <ul className="space-y-3">
                    {events.map((e, i) => {
                      const ok = e.status === "success";
                      return (
                        <motion.li
                          key={e.id}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          {/* Dot */}
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white"
                            style={{
                              background: ok ? "#fff4ed" : "#fef2f2",
                              boxShadow: ok ? "0 0 0 2px rgba(249,115,22,0.2)" : "0 0 0 2px rgba(239,68,68,0.15)",
                            }}
                          >
                            {ok
                              ? <Check className="h-4 w-4 text-[#f97316]" strokeWidth={3} />
                              : <AlertCircle className="h-4 w-4 text-[#ef4444]" strokeWidth={2.5} />}
                          </div>

                          {/* Card */}
                          <motion.div
                            className="flex-1 min-w-0 rounded-2xl p-3.5 border"
                            style={{
                              background: ok ? "#fafafa" : "#fef9f9",
                              borderColor: ok ? "#f0ece4" : "#fecaca",
                            }}
                            whileHover={{ y: -1, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="font-bold text-[13px] text-[#1a1a1a] truncate">{e.appName}</div>
                              <div className="flex items-center gap-1 text-[10px] text-[#9a8880] shrink-0">
                                <Clock className="h-2.5 w-2.5" />
                                {formatRelativeTime(e.timestamp)}
                              </div>
                            </div>

                            <div className="text-[11px] text-[#6b6360] truncate mb-0.5">{e.repo}</div>
                            <div className="text-[11px] text-[#9a8880] italic truncate">"{e.commitMessage}"</div>

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
                              {e.commitHash && (
                                <a
                                  href={`https://github.com/${e.repo}/commit/${e.commitHash}`}
                                  target="_blank" rel="noreferrer"
                                  className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#9a8880] hover:text-[#f97316] transition-colors"
                                >
                                  View <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>

                            {!ok && e.error && (
                              <div className="mt-2 text-[11px] text-[#ef4444] bg-[#fef2f2] rounded-lg px-2.5 py-1.5 font-medium">
                                {e.error}
                              </div>
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
    </AppShell>
  );
}
