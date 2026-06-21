import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { Github, GitBranch, Search, Star, ChevronRight, Filter, Archive } from "lucide-react";

export const Route = createFileRoute("/repositories")({
  head: () => ({
    meta: [
      { title: "Repositories — Base44" },
      { name: "description", content: "All your connected GitHub repositories." },
    ],
  }),
  component: ReposPage,
});

const repos = [
  { name: "my-base44-project", branch: "main", lang: "TypeScript", color: "#3178c6", stars: 24, updated: "2 min ago", accent: "#e9e4f8" },
  { name: "portfolio-site", branch: "develop", lang: "JavaScript", color: "#f7df1e", stars: 12, updated: "1 hr ago", accent: "#dce99a" },
  { name: "ecom-dashboard", branch: "main", lang: "TypeScript", color: "#3178c6", stars: 47, updated: "3 hr ago", accent: "#fde2cf" },
  { name: "blog-engine", branch: "main", lang: "Python", color: "#3776ab", stars: 8, updated: "yesterday", accent: "#dcfce7" },
  { name: "design-system", branch: "feat/tokens", lang: "CSS", color: "#264de4", stars: 31, updated: "2 days ago", accent: "#fee2e2" },
];

function ReposPage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5" style={{ backgroundColor: "#dfeaa0" }}>
        <div className="relative z-10 max-w-[60%]">
          <h2 className="text-[32px] leading-[1.02] font-extrabold text-black tracking-tight">
            All your<br /><span className="text-[#7d9b2c]">repos</span>
          </h2>
          <p className="mt-3 text-[13px] text-black/70 leading-snug">
            5 repositories connected<br />to your account.
          </p>
        </div>
        <div className="absolute right-6 top-8 h-[100px] w-[100px] rounded-[28px] bg-[#1a1a1a] flex items-center justify-center shadow-xl rotate-[-8deg]">
          <Archive className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute right-3 bottom-6 text-[#8b5cf6] text-xl">✦</div>
      </section>

      {/* Search */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 text-black/50" />
          <input placeholder="Search repositories..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-black/40" />
        </div>
        <button className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <Filter className="h-4 w-4 text-black" />
        </button>
      </div>

      {/* Repo list */}
      <SectionCard title="Your Repositories" action={<span className="text-xs text-black/60 font-medium">{repos.length} total</span>}>
        <ul className="space-y-3">
          {repos.map((r) => (
            <li key={r.name} className="flex items-center gap-3 p-3 rounded-xl border border-[#eee] hover:bg-[#fafaf7] transition-colors">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: r.accent }}>
                <Github className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-black truncate">{r.name}</div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-black/60">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.lang}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {r.stars}
                  </span>
                  <span>•</span>
                  <span>{r.updated}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 bg-[#ede9fe] text-[#7c3aed] rounded-md px-2 py-1 text-[10px] font-semibold shrink-0">
                <GitBranch className="h-2.5 w-2.5" /> {r.branch}
              </span>
              <ChevronRight className="h-4 w-4 text-black/40 shrink-0" />
            </li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  );
}