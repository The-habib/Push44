import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check, GitCommit, GitBranch, Clock, History as HistoryIcon,
  AlertCircle, Trash2, ExternalLink,
} from "lucide-react";
import { getHistory, clearHistory, formatRelativeTime, type PushRecord } from "@/lib/storage";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PushRecord[]>([]);

  useEffect(() => { setEvents(getHistory()); }, []);

  const successCount = events.filter((e) => e.status === "success").length;
  const failCount    = events.filter((e) => e.status === "failed").length;
  const successRate  = events.length === 0 ? null : Math.round((successCount / events.length) * 100);

  return (
    <AppShell>
      <AnimatedCorner variant="history" />

      <FadeUp>
        <h1 className="text-[26px] font-extrabold text-black tracking-tight mb-1">Push History</h1>
        <p className="text-[13px] text-black/45 mb-5">Every push you've made from this device.</p>
      </FadeUp>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Total pushes",  value: events.length,                             bg: "#f0ebff", accent: "#8b5cf6", note: successCount > 0 ? `${successCount} successful` : null },
          { label: "Success rate",  value: successRate !== null ? `${successRate}%` : "—", bg: "#f0fdf4", accent: "#22c55e", note: failCount > 0 ? `${failCount} ${failCount === 1 ? "failure" : "failures"}` : null },
        ].map(({ label, value, bg, accent, note }) => (
          <StaggerItem key={label}>
            <motion.div className="rounded-3xl p-4 bg-white"
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accent}18` }}>
                <Check className="h-4 w-4" style={{ color: accent }} strokeWidth={2.5} />
              </div>
              <div className="text-[10px] font-semibold text-black/35 uppercase tracking-wider mb-0.5">{label}</div>
              <div className="text-[22px] font-extrabold text-black leading-none">{value}</div>
              {note && <div className="text-[10px] font-semibold mt-1.5" style={{ color: accent }}>{note}</div>}
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Timeline */}
      <FadeUp delay={0.12}>
        <SectionCard
          title="Activity"
          action={events.length > 0 ? (
            <MotionButton onClick={() => { clearHistory(); setEvents([]); }}
              className="flex items-center gap-1 text-[#ef4444] text-[12px] font-semibold">
              <Trash2 className="h-3 w-3" />Clear
            </MotionButton>
          ) : undefined}
        >
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#f3f2ee] flex items-center justify-center">
                <HistoryIcon className="h-6 w-6 text-black/25" />
              </div>
              <p className="text-[13px] text-black/45">No push history yet.</p>
              <button onClick={() => navigate({ to: "/push" })} className="text-[13px] font-bold text-[#8b5cf6]">Make your first push →</button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-black/[0.06]" />
              <ul className="space-y-4">
                {events.map((e, i) => {
                  const ok = e.status === "success";
                  return (
                    <motion.li key={e.id} className="flex items-start gap-3 relative"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 ${ok ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}`}>
                        {ok
                          ? <Check className="h-4 w-4 text-[#22c55e]" strokeWidth={3} />
                          : <AlertCircle className="h-4 w-4 text-[#ef4444]" strokeWidth={2.5} />}
                      </div>
                      <motion.div className="flex-1 min-w-0 bg-white rounded-2xl p-3.5 border border-black/[0.05]"
                        whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="text-[13px] font-bold text-black truncate">{e.appName}</div>
                          <span className="flex items-center gap-1 text-[10px] text-black/35 shrink-0">
                            <Clock className="h-2.5 w-2.5" />{formatRelativeTime(e.timestamp)}
                          </span>
                        </div>
                        <div className="text-[11px] text-black/50 truncate">{e.repo}</div>
                        <div className="text-[11px] text-black/35 italic truncate mt-0.5">"{e.commitMessage}"</div>
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          {e.commitHash && (
                            <span className="flex items-center gap-1 bg-[#f7f6f1] rounded px-2 py-0.5 text-[10px] font-mono text-black/50">
                              <GitCommit className="h-2.5 w-2.5" />{e.commitHash}
                            </span>
                          )}
                          <span className="flex items-center gap-1 bg-[#f7f6f1] rounded px-2 py-0.5 text-[10px] text-black/50">
                            <GitBranch className="h-2.5 w-2.5" />{e.branch}
                          </span>
                          <span className="text-[10px] text-black/35">{e.filesCount} files</span>
                          {e.commitHash && (
                            <a href={`https://github.com/${e.repo}/commit/${e.commitHash}`} target="_blank" rel="noreferrer" className="ml-auto">
                              <ExternalLink className="h-3 w-3 text-black/25 hover:text-black/50 transition-colors" />
                            </a>
                          )}
                        </div>
                        {!ok && e.error && (
                          <div className="mt-2 text-[11px] text-[#ef4444] bg-[#fef2f2] rounded-lg px-2 py-1 truncate">{e.error}</div>
                        )}
                      </motion.div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}
        </SectionCard>
      </FadeUp>
    </AppShell>
  );
}
