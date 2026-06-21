import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { Check, GitCommit, GitBranch, Clock, History as HistoryIcon, ChevronRight, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Base44" },
      { name: "description", content: "Your past pushes and commits." },
    ],
  }),
  component: HistoryPage,
});

const events = [
  { type: "success", title: "Pushed to main", repo: "my-base44-project", time: "2 min ago", files: 5, hash: "a3f9c21" },
  { type: "success", title: "Pushed to develop", repo: "portfolio-site", time: "1 hr ago", files: 3, hash: "b7e2d44" },
  { type: "failed", title: "Push failed", repo: "ecom-dashboard", time: "2 hr ago", files: 7, hash: "c5a1f88" },
  { type: "success", title: "Pushed to main", repo: "blog-engine", time: "yesterday", files: 12, hash: "d9b4e02" },
  { type: "success", title: "Pushed to feat/tokens", repo: "design-system", time: "2 days ago", files: 24, hash: "e1c7b39" },
];

function HistoryPage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5" style={{ backgroundColor: "#fde2cf" }}>
        <div className="relative z-10 max-w-[60%]">
          <h2 className="text-[32px] leading-[1.02] font-extrabold text-black tracking-tight">
            Your push<br /><span className="text-[#f97316]">history</span>
          </h2>
          <p className="mt-3 text-[13px] text-black/70 leading-snug">
            Track every commit and<br />push from one timeline.
          </p>
        </div>
        <div className="absolute right-6 top-8 h-[100px] w-[100px] rounded-[28px] bg-[#1a1a1a] flex items-center justify-center shadow-xl rotate-[8deg]">
          <HistoryIcon className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute right-4 bottom-4 h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl p-4 bg-white">
          <div className="text-[11px] text-black/60 font-medium">Total Pushes</div>
          <div className="text-2xl font-extrabold text-black mt-1">128</div>
          <div className="text-[10px] text-[#22c55e] font-semibold mt-1">+12 this week</div>
        </div>
        <div className="rounded-2xl p-4 bg-white">
          <div className="text-[11px] text-black/60 font-medium">Success Rate</div>
          <div className="text-2xl font-extrabold text-black mt-1">98.4%</div>
          <div className="text-[10px] text-[#22c55e] font-semibold mt-1">2 failures</div>
        </div>
      </div>

      {/* Timeline */}
      <SectionCard title="Recent Activity">
        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-[#eee]" />
          <ul className="space-y-4">
            {events.map((e) => {
              const ok = e.type === "success";
              return (
                <li key={e.hash} className="flex items-start gap-3 relative">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 ${ok ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}`}>
                    {ok ? (
                      <Check className="h-4 w-4 text-[#22c55e]" strokeWidth={3} />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#ef4444]" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 bg-[#fafaf7] rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-black truncate">{e.title}</div>
                      <span className="flex items-center gap-1 text-[10px] text-black/50 shrink-0">
                        <Clock className="h-2.5 w-2.5" /> {e.time}
                      </span>
                    </div>
                    <div className="text-xs text-black/60 mt-0.5 truncate">{e.repo}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 bg-white rounded-md px-2 py-0.5 text-[10px] font-mono text-black/70 border border-[#eee]">
                        <GitCommit className="h-2.5 w-2.5" /> {e.hash}
                      </span>
                      <span className="text-[10px] text-black/50">{e.files} files</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </SectionCard>
    </AppShell>
  );
}