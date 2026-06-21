import { createFileRoute } from "@tanstack/react-router";
import thumbsUp from "@/assets/thumbs-up.png";
import avatar from "@/assets/avatar.png";
import {
  Menu,
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
  Home,
  UploadCloud,
  Archive,
  History,
  Settings,
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
    <div className="min-h-screen w-full flex justify-center" style={{ backgroundColor: "#f3f2ee" }}>
      <div className="w-full max-w-[430px] px-5 pt-4 pb-28 relative">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-5">
          <button className="h-11 w-11 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Menu className="h-5 w-5 text-black" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-[#a78bfa] font-extrabold text-xl italic">B</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-black tracking-tight">
              Base44 <span className="text-[#8b5cf6]">Push</span>
            </h1>
          </div>
          <div className="relative h-11 w-11">
            <img src={avatar} alt="Profile" className="h-11 w-11 rounded-full object-cover" width={44} height={44} loading="lazy" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
          </div>
        </header>

        {/* Hero card */}
        <section className="relative rounded-[28px] p-6 overflow-hidden mb-5" style={{ backgroundColor: "#dce99a" }}>
          {/* decorative brush */}
          <div className="absolute right-4 top-20 h-44 w-44 rounded-full opacity-60" style={{ background: "radial-gradient(circle, #c5d97a 0%, transparent 70%)" }} />
          <div className="relative z-10 max-w-[60%]">
            <h2 className="text-[34px] leading-[1.05] font-extrabold text-black tracking-tight">
              Push your<br />code to <span className="text-[#7a9b2e]">GitHub</span>
            </h2>
            <p className="mt-3 text-[14px] text-black/70 leading-snug">
              Ship your Base44 projects<br />in one secure click.
            </p>
            <button className="mt-5 group flex items-center gap-2 bg-black rounded-full pl-4 pr-1.5 py-1.5 shadow-lg">
              <Cloud className="h-4 w-4 text-white" />
              <span className="text-white font-semibold text-sm pr-3">Push Now</span>
              <span className="h-9 w-9 rounded-full bg-[#c5e352] flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-black" strokeWidth={2.5} />
              </span>
            </button>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-black/70 font-medium">
              <Lock className="h-3.5 w-3.5" />
              <span>Secure</span>
              <span className="text-black/40">•</span>
              <span>Private</span>
              <span className="text-black/40">•</span>
              <span>Encrypted</span>
            </div>
          </div>

          {/* Right side illustration */}
          <div className="absolute right-4 top-5 w-[150px] h-[260px]">
            <div className="absolute right-16 top-2 h-14 w-14 rounded-2xl bg-[#8b5cf6] flex items-center justify-center rotate-[-8deg] shadow-md">
              <span className="text-white font-extrabold text-2xl italic">B</span>
            </div>
            <svg className="absolute right-4 top-14 w-16 h-12" viewBox="0 0 60 50" fill="none">
              <path d="M5 5 Q 30 0 50 25 T 55 45" stroke="black" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              <path d="M50 40 L55 45 L48 47" stroke="black" strokeWidth="1.5" fill="none" />
            </svg>
            <div className="absolute right-1 top-3 text-[#8b5cf6] text-xl">✦</div>
            <div className="absolute right-[-4px] top-12 text-[#a3c043] text-2xl">✳</div>
            <div className="absolute right-20 top-32 h-[100px] w-[100px] rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <Github className="h-14 w-14 text-white" />
            </div>
            <div className="absolute right-6 top-44 h-3 w-3 rounded-full bg-[#f97316]" />
            <div className="absolute right-28 top-36 h-2 w-2 rounded-full bg-white" />
            <div className="absolute right-16 top-56 h-2 w-2 rounded-full bg-[#8b5cf6]" />
          </div>
        </section>

        {/* Recent Repository */}
        <section className="bg-white rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-black text-base">Recent Repository</h3>
            <button className="flex items-center gap-1 bg-[#f3f2ee] rounded-full px-3 py-1.5 text-xs font-semibold text-black">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
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
        </section>

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
        <section className="bg-white rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-black text-base">Recent Changes</h3>
            <button className="flex items-center gap-1 text-[#7c3aed] text-xs font-semibold">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
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
        </section>

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

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 pt-3 pb-6">
          <div className="flex items-center justify-between">
            {[
              { icon: Home, label: "Dashboard", active: true },
              { icon: UploadCloud, label: "Push" },
              { icon: Archive, label: "Repositories" },
              { icon: History, label: "History" },
              { icon: Settings, label: "Settings" },
            ].map(({ icon: Icon, label, active }) => (
              <button key={label} className="flex flex-col items-center gap-1 flex-1">
                <span className={`h-9 w-12 rounded-full flex items-center justify-center ${active ? "bg-[#dce99a]" : ""}`}>
                  <Icon className={`h-5 w-5 ${active ? "text-black" : "text-black/70"}`} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className={`text-[10px] ${active ? "font-bold text-black" : "text-black/60 font-medium"}`}>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
