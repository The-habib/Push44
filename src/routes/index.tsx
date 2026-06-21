import { createFileRoute } from "@tanstack/react-router";
import thumbsUp from "@/assets/thumbs-up.png";
import { AppShell, SectionCard } from "@/components/AppShell";
import {
  Lock,
  ChevronRight,
  ArrowRight,
  Cloud,
  FileText,
  Code2,
  Clock,
  GitBranch,
  Github,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Base44 Push — Ship to GitHub in one click" },
      { name: "description", content: "Push your Base44 projects to GitHub securely, privately, and encrypted in one click." },
      { property: "og:title", content: "Base44 Push" },
      { property: "og:description", content: "Push your Base44 projects to GitHub in one secure click." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
        <section className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5" style={{ backgroundColor: "#dfeaa0" }}>
          {/* painted brush background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 480" preserveAspectRatio="none">
            <path d="M 180 60 C 260 40, 340 90, 360 200 C 380 310, 320 400, 220 420 C 140 435, 90 380, 110 290 C 125 220, 130 90, 180 60 Z"
              fill="#c8d97a" opacity="0.55" />
            <path d="M 200 120 C 270 110, 330 180, 320 270 C 312 350, 240 380, 180 350 C 130 325, 145 200, 200 120 Z"
              fill="#b8cc5e" opacity="0.35" />
          </svg>

          {/* Title spanning full width */}
          <div className="relative z-20">
            <h2 className="text-[40px] leading-[0.98] font-extrabold text-black tracking-tight">
              Push your<br />code to <span className="text-[#7d9b2c]">GitHub</span>
            </h2>
          </div>

          {/* Right side illustration cluster */}
          <div className="absolute right-3 top-4 w-[170px] h-[280px] z-10 pointer-events-none">
            {/* Purple B square */}
            <div className="absolute left-2 top-6 h-[68px] w-[68px] rounded-[20px] bg-[#8b5cf6] flex items-center justify-center rotate-[-10deg] shadow-[0_8px_20px_rgba(139,92,246,0.35)]">
              <span className="text-white font-extrabold text-[34px] italic leading-none">B</span>
            </div>
            {/* Purple sparkle */}
            <svg className="absolute left-[88px] top-2 w-5 h-5" viewBox="0 0 20 20" fill="#8b5cf6">
              <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
            </svg>
            {/* Green asterisk */}
            <div className="absolute right-1 top-8 text-[#a3c043] text-[28px] font-light leading-none">✳</div>
            {/* Dashed curved arrow B -> github */}
            <svg className="absolute left-12 top-16 w-[110px] h-[80px]" viewBox="0 0 110 80" fill="none">
              <path d="M5 5 C 50 -5, 95 25, 75 70" stroke="#1a1a1a" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" />
              <path d="M67 62 L75 70 L78 60" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            {/* GitHub black circle */}
            <div className="absolute right-0 top-[100px] h-[120px] w-[120px] rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-xl">
              <Github className="h-[72px] w-[72px] text-white" strokeWidth={1.5} />
            </div>
            {/* Dots */}
            <div className="absolute left-[-20px] top-[150px] h-2.5 w-2.5 rounded-full bg-white" />
            <div className="absolute left-[-8px] top-[200px] h-3 w-3 rounded-full bg-[#f97316]" />
            <div className="absolute left-2 top-[260px] h-2 w-2 rounded-full bg-[#8b5cf6]" />
            <div className="absolute right-2 top-[250px] h-1.5 w-1.5 rounded-full bg-[#a3c043]" />
          </div>

          {/* Subtitle + CTA below */}
          <div className="relative z-20 mt-32 max-w-[55%]">
            <p className="text-[14px] text-black/75 leading-snug font-medium">
              Ship your Base44 projects<br />in one secure click.
            </p>
            <button className="mt-5 flex items-center gap-3 bg-[#0a0a0a] rounded-full pl-5 pr-1.5 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
              <Cloud className="h-[18px] w-[18px] text-white" strokeWidth={2} />
              <span className="text-white font-semibold text-[15px]">Push Now</span>
              <span className="h-10 w-10 rounded-full bg-[#c5e352] flex items-center justify-center ml-1">
                <ArrowRight className="h-[18px] w-[18px] text-black" strokeWidth={2.5} />
              </span>
            </button>
            <div className="mt-6 flex items-center gap-2 text-[12px] text-black/75 font-medium">
              <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>Secure</span>
              <span className="text-black/40">•</span>
              <span>Private</span>
              <span className="text-black/40">•</span>
              <span>Encrypted</span>
            </div>
          </div>
        </section>

        {/* Recent Repository */}
        <SectionCard title="Recent Repository" action={
          <button className="flex items-center gap-1 bg-[#f3f2ee] rounded-full px-3 py-1.5 text-xs font-semibold text-black">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        }>
          <div className="flex items-center gap-3 border border-[#eee] rounded-xl p-2.5">
            <div className="h-10 w-10 rounded-lg border border-[#eee] flex items-center justify-center">
              <Github className="h-5 w-5 text-black" />
            </div>
            <span className="flex-1 text-sm font-semibold text-black truncate">johndoe / my-base44-project</span>
            <span className="flex items-center gap-1 bg-[#ede9fe] text-[#7c3aed] rounded-md px-2 py-1 text-xs font-semibold">
              <GitBranch className="h-3 w-3" /> main
            </span>
            <ChevronRight className="h-4 w-4 text-black/60" />
          </div>
        </SectionCard>

        {/* Stat cards */}
        <section className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-2xl p-3" style={{ backgroundColor: "#e9e4f8" }}>
            <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div className="text-[11px] text-black/60 font-medium">Files</div>
            <div className="text-xl font-extrabold text-black">342</div>
          </div>
          <div className="rounded-2xl p-3" style={{ backgroundColor: "#dce99a" }}>
            <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
              <Code2 className="h-5 w-5 text-black" />
            </div>
            <div className="text-[11px] text-black/60 font-medium">Lines of Code</div>
            <div className="text-xl font-extrabold text-black">12,842</div>
          </div>
          <div className="rounded-2xl p-3" style={{ backgroundColor: "#fde2cf" }}>
            <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-[#f97316]" />
            </div>
            <div className="text-[11px] text-black/60 font-medium">Last Edited</div>
            <div className="text-xl font-extrabold text-black">2 min ago</div>
          </div>
        </section>

        {/* Recent Changes */}
        <SectionCard title="Recent Changes" action={
          <button className="flex items-center gap-1 text-[#7c3aed] text-xs font-semibold">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        }>
          <div className="relative rounded-xl bg-[#f7f6f1] p-4 overflow-hidden">
            <ul className="font-mono text-[13px] space-y-2 relative z-10">
              {[
                ["+", "app/page.tsx"],
                ["+", "components/Hero.tsx"],
                ["+", "lib/utils.ts"],
                ["~", "styles/globals.css"],
                ["+", "README.md"],
              ].map(([sym, file]) => (
                <li key={file} className="flex gap-4">
                  <span className={sym === "+" ? "text-[#22c55e] font-bold" : "text-[#f97316] font-bold"}>{sym}</span>
                  <span className="text-black/80">{file}</span>
                </li>
              ))}
            </ul>
            <div className="absolute right-0 bottom-0 w-32 h-32">
              <div className="absolute right-2 bottom-2 h-24 w-24 rounded-full" style={{ backgroundColor: "#c5d97a" }} />
              <img src={thumbsUp} alt="" className="absolute right-0 bottom-0 h-28 w-28 object-contain mix-blend-multiply" width={112} height={112} loading="lazy" />
              <div className="absolute right-1 top-1 text-black text-sm">✦</div>
              <div className="absolute right-10 top-4 h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
              <div className="absolute right-4 top-12 h-1.5 w-1.5 rounded-full bg-[#a3c043]" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-[#dce99a] flex items-center justify-center">
              <Check className="h-3 w-3 text-black" strokeWidth={3} />
            </span>
            <span className="text-xs text-black/70 font-medium">All changes are ready to be pushed.</span>
          </div>
        </SectionCard>

        {/* Ready to ship CTA */}
        <section className="rounded-2xl p-5 flex items-center gap-3 mb-5 overflow-hidden relative" style={{ backgroundColor: "#e9e4f8" }}>
          <div className="flex-1">
            <h3 className="font-extrabold text-black text-[17px]">
              Ready to <span className="text-[#7c3aed]">ship?</span>
            </h3>
            <p className="text-[11px] text-black/70 mt-1 leading-tight">
              Push your code to GitHub<br />in one secure click.
            </p>
          </div>
          <button className="bg-gradient-to-b from-[#a78bfa] to-[#8b5cf6] rounded-full px-5 py-3 flex items-center gap-2 shadow-lg">
            <Cloud className="h-4 w-4 text-white" />
            <span className="text-white font-semibold text-sm whitespace-nowrap">Push to GitHub</span>
          </button>
        </section>
    </AppShell>
  );
}
