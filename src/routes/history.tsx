import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect } from "react";
import {
  Check,
  GitCommit,
  GitBranch,
  Clock,
  History as HistoryIcon,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { getHistory, clearHistory, formatRelativeTime, type PushRecord } from "@/lib/storage";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Push History — Push44" },
      { name: "description", content: "A full log of every Base44-to-GitHub push you've made. See commit hashes, file counts, branches, and status for each push." },
      { property: "og:title", content: "Push History — Push44" },
      { property: "og:description", content: "A complete log of every Base44-to-GitHub push — commit hashes, file counts, and more." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { creds } = useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useState<PushRecord[]>([]);

  useEffect(() => {
    setEvents(getHistory());
  }, []);

  const successCount = events.filter((e) => e.status === "success").length;
  const failCount = events.filter((e) => e.status === "failed").length;
  const successRate =
    events.length === 0
      ? 100
      : Math.round((successCount / events.length) * 1000) / 10;

  const totalFiles = events
    .filter((e) => e.status === "success")
    .reduce((sum, e) => sum + e.filesCount, 0);

  function handleClear() {
    clearHistory();
    setEvents([]);
  }

  return (
    <AppShell>
      {/* Hero */}
      <section
        className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5"
        style={{ backgroundColor: "#fde2cf" }}
      >
        <div className="relative z-10 max-w-[60%]">
          <h2 className="text-[32px] leading-[1.02] font-extrabold text-black tracking-tight">
            Your push
            <br />
            <span className="text-[#f97316]">history</span>
          </h2>
          <p className="mt-3 text-[13px] text-black/70 leading-snug">
            Track every commit and
            <br />
            push from one timeline.
          </p>
        </div>
        <div className="absolute right-6 top-8 h-[100px] w-[100px] rounded-[28px] bg-[#1a1a1a] flex items-center justify-center shadow-xl rotate-[8deg]">
          <HistoryIcon className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute right-4 bottom-4 h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-3xl p-4 bg-white">
          <div className="h-9 w-9 rounded-2xl bg-[#f0ebff] flex items-center justify-center mb-3">
            <GitCommit className="h-4 w-4 text-[#8b5cf6]" strokeWidth={2} />
          </div>
          <div className="text-[11px] font-semibold text-black/40 uppercase tracking-wider mb-0.5">
            Total Pushes
          </div>
          <div className="text-2xl font-extrabold text-black leading-none">
            {events.length}
          </div>
          {successCount > 0 && (
            <div className="text-[10px] text-[#22c55e] font-semibold mt-1.5">
              {successCount} successful
            </div>
          )}
        </div>
        <div className="rounded-3xl p-4 bg-white">
          <div className="h-9 w-9 rounded-2xl bg-[#f0fdf4] flex items-center justify-center mb-3">
            <Check className="h-4 w-4 text-[#22c55e]" strokeWidth={2.5} />
          </div>
          <div className="text-[11px] font-semibold text-black/40 uppercase tracking-wider mb-0.5">
            Success Rate
          </div>
          <div className="text-2xl font-extrabold text-black leading-none">
            {events.length === 0 ? "—" : `${successRate}%`}
          </div>
          {failCount > 0 && (
            <div className="text-[10px] text-[#ef4444] font-semibold mt-1.5">
              {failCount} {failCount === 1 ? "failure" : "failures"}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <SectionCard
        title="Activity"
        action={
          events.length > 0 ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-[#ef4444] text-xs font-semibold"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          ) : undefined
        }
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="h-12 w-12 rounded-2xl bg-[#f3f2ee] flex items-center justify-center">
              <HistoryIcon className="h-6 w-6 text-black/30" />
            </div>
            <p className="text-sm text-black/50">No push history yet.</p>
            <button
              onClick={() => navigate({ to: "/push" })}
              className="text-sm font-bold text-[#8b5cf6]"
            >
              Make your first push →
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-[#eee]" />
            <ul className="space-y-4">
              {events.map((e) => {
                const ok = e.status === "success";
                return (
                  <li key={e.id} className="flex items-start gap-3 relative">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 ${ok ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}`}
                    >
                      {ok ? (
                        <Check
                          className="h-4 w-4 text-[#22c55e]"
                          strokeWidth={3}
                        />
                      ) : (
                        <AlertCircle
                          className="h-4 w-4 text-[#ef4444]"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 bg-[#fafaf7] rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-black truncate">
                          {e.appName}
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-black/50 shrink-0">
                          <Clock className="h-2.5 w-2.5" />{" "}
                          {formatRelativeTime(e.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-black/60 mt-0.5 truncate">
                        {e.repo}
                      </div>
                      <div className="text-xs text-black/50 italic mt-0.5 truncate">
                        "{e.commitMessage}"
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {e.commitHash && (
                          <span className="flex items-center gap-1 bg-white rounded-md px-2 py-0.5 text-[10px] font-mono text-black/70 border border-[#eee]">
                            <GitCommit className="h-2.5 w-2.5" />{" "}
                            {e.commitHash}
                          </span>
                        )}
                        <span className="flex items-center gap-1 bg-white rounded-md px-2 py-0.5 text-[10px] text-black/70 border border-[#eee]">
                          <GitBranch className="h-2.5 w-2.5" /> {e.branch}
                        </span>
                        <span className="text-[10px] text-black/50">
                          {e.filesCount} files
                        </span>
                        {e.commitHash && (
                          <a
                            href={`https://github.com/${e.repo}/commit/${e.commitHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto"
                          >
                            <ExternalLink className="h-3 w-3 text-black/30" />
                          </a>
                        )}
                      </div>
                      {!ok && e.error && (
                        <div className="mt-2 text-[11px] text-[#ef4444] bg-[#fee2e2] rounded-lg px-2 py-1 truncate">
                          {e.error}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
