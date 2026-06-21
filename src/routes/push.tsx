import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { Cloud, Github, GitBranch, FileText, Plus, Minus, Pencil, Lock, ChevronRight, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/push")({
  head: () => ({
    meta: [
      { title: "Push — Base44" },
      { name: "description", content: "Push your latest changes to GitHub." },
    ],
  }),
  component: PushPage,
});

function PushPage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5" style={{ backgroundColor: "#e9e4f8" }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 280" preserveAspectRatio="none">
          <path d="M30 100 C 120 60, 260 120, 380 80 L 380 280 L 0 280 Z" fill="#d8cef0" opacity="0.6" />
        </svg>
        <div className="relative z-10 max-w-[60%]">
          <h2 className="text-[34px] leading-[1.02] font-extrabold text-black tracking-tight">
            Ready to<br /><span className="text-[#7c3aed]">push?</span>
          </h2>
          <p className="mt-3 text-[13px] text-black/70 leading-snug">
            Review your changes before<br />shipping them to GitHub.
          </p>
        </div>
        <div className="absolute right-4 top-6 h-[120px] w-[120px] rounded-[28px] bg-[#1a1a1a] flex items-center justify-center shadow-xl">
          <Github className="h-16 w-16 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute right-8 bottom-4 h-3 w-3 rounded-full bg-[#dce99a]" />
        <div className="absolute right-24 top-32 h-2 w-2 rounded-full bg-[#f97316]" />
      </section>

      {/* Target repo */}
      <SectionCard title="Target Repository">
        <div className="flex items-center gap-3 border border-[#eee] rounded-xl p-2.5 mb-3">
          <div className="h-10 w-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <Github className="h-5 w-5 text-white" />
          </div>
          <span className="flex-1 text-sm font-semibold text-black truncate">johndoe / my-base44-project</span>
          <ChevronRight className="h-4 w-4 text-black/60" />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-[#ede9fe] text-[#7c3aed] rounded-md px-2 py-1 text-xs font-semibold">
            <GitBranch className="h-3 w-3" /> main
          </span>
          <span className="text-xs text-black/60">5 files changed</span>
        </div>
      </SectionCard>

      {/* Changes breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#dcfce7" }}>
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-[#22c55e]" strokeWidth={2.5} />
          </div>
          <div className="text-[11px] text-black/60 font-medium">Added</div>
          <div className="text-xl font-extrabold text-black">4</div>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#fde2cf" }}>
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
            <Pencil className="h-5 w-5 text-[#f97316]" />
          </div>
          <div className="text-[11px] text-black/60 font-medium">Modified</div>
          <div className="text-xl font-extrabold text-black">1</div>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#fee2e2" }}>
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
            <Minus className="h-5 w-5 text-[#ef4444]" strokeWidth={2.5} />
          </div>
          <div className="text-[11px] text-black/60 font-medium">Deleted</div>
          <div className="text-xl font-extrabold text-black">0</div>
        </div>
      </div>

      {/* Commit message */}
      <SectionCard title="Commit Message">
        <div className="rounded-xl bg-[#f7f6f1] p-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-black/60 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-black">Update hero section and utilities</div>
              <div className="text-xs text-black/60 mt-1">Refined the landing page hero and added helper functions.</div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Files list */}
      <SectionCard title="Files to Push">
        <ul className="space-y-2">
          {[
            { sym: "+", file: "app/page.tsx", color: "#22c55e" },
            { sym: "+", file: "components/Hero.tsx", color: "#22c55e" },
            { sym: "+", file: "lib/utils.ts", color: "#22c55e" },
            { sym: "~", file: "styles/globals.css", color: "#f97316" },
            { sym: "+", file: "README.md", color: "#22c55e" },
          ].map((f) => (
            <li key={f.file} className="flex items-center gap-3 py-1.5">
              <span className="font-mono font-bold text-base w-4" style={{ color: f.color }}>{f.sym}</span>
              <FileText className="h-4 w-4 text-black/50" />
              <span className="font-mono text-[13px] text-black/80">{f.file}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Push button */}
      <button className="w-full bg-gradient-to-b from-[#a78bfa] to-[#8b5cf6] rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg mb-3">
        <Cloud className="h-5 w-5 text-white" />
        <span className="text-white font-bold text-[15px]">Push to GitHub</span>
      </button>
      <div className="flex items-center justify-center gap-2 text-[11px] text-black/60 font-medium">
        <Lock className="h-3 w-3" />
        <span>Secure</span>
        <span className="text-black/40">•</span>
        <span>Private</span>
        <span className="text-black/40">•</span>
        <span>Encrypted</span>
      </div>
    </AppShell>
  );
}