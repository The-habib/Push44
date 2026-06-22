import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, Search, Star, Archive, Loader2, Lock, Globe, ExternalLink, RefreshCw,
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listGitHubRepos } from "@/lib/github-api";

export const Route = createFileRoute("/repositories")({
  component: ReposPage,
});

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3776ab",
  CSS: "#264de4", HTML: "#e34c26", Rust: "#dea584", Go: "#00ADD8",
  Java: "#b07219", "C++": "#f34b7d", Ruby: "#701516",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

const ACCENTS = ["#e9e4f8", "#dce99a", "#fde2cf", "#dcfce7", "#fee2e2", "#dfeaa0"];

function ReposPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const isConnected = !!creds.githubToken;

  useEffect(() => {
    if (!isLoaded || !isConnected) return;
    loadRepos();
  }, [isLoaded, isConnected]);

  async function loadRepos() {
    if (!creds.githubToken) return;
    setLoading(true);
    try {
      const data = await listGitHubRepos({ data: { token: creds.githubToken } });
      setRepos(data);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = repos.filter(
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.full_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <AnimatedCorner variant="repos" />

      <div className="relative z-10">
        {/* Hero */}
        <FadeUp delay={0.05}>
          <section className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5" style={{ backgroundColor: "#dfeaa0" }}>
            <motion.div
              className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #22c55e22 0%, transparent 60%)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 max-w-[60%]">
              <h2 className="text-[32px] leading-[1.02] font-extrabold text-black tracking-tight">
                All your<br /><span className="text-[#7d9b2c]">repos</span>
              </h2>
              <p className="mt-3 text-[13px] text-black/70 leading-snug">
                {isConnected
                  ? loading ? "Loading repositories…" : `${repos.length} repositories connected.`
                  : "Connect GitHub in Settings."}
              </p>
            </div>
            <motion.div
              className="absolute right-6 top-8 h-[100px] w-[100px] rounded-[28px] bg-[#1a1a1a] flex items-center justify-center shadow-xl"
              animate={{ rotate: [-8, -4, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ rotate: 0, scale: 1.08 }}
            >
              <Archive className="h-12 w-12 text-white" strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute right-3 bottom-6 text-[#8b5cf6] text-xl"
              animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              ✦
            </motion.div>
          </section>
        </FadeUp>

        {!isConnected ? (
          <FadeUp delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <motion.div
                className="h-14 w-14 rounded-2xl bg-[#f3f2ee] flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <GitHubLogo className="h-7 w-7 text-black/40" />
              </motion.div>
              <p className="text-sm text-black/50 max-w-xs">Connect your GitHub account in Settings to see your repositories.</p>
              <MotionButton onClick={() => navigate({ to: "/settings" })} className="bg-[#1a1a1a] text-white font-bold px-5 py-2.5 rounded-2xl text-sm">
                Go to Settings
              </MotionButton>
            </div>
          </FadeUp>
        ) : (
          <>
            {/* Search + Refresh */}
            <FadeUp delay={0.1}>
              <div className="flex items-center gap-2 mb-5">
                <motion.div
                  className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm"
                  whileFocus={{ boxShadow: "0 0 0 2px #8b5cf640" }}
                >
                  <Search className="h-4 w-4 text-black/50" />
                  <input
                    placeholder="Search repositories…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-black/40"
                  />
                </motion.div>
                <motion.button
                  onClick={loadRepos}
                  disabled={loading}
                  className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center"
                  whileHover={{ scale: 1.08, backgroundColor: "#f3f2ee" }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                >
                  <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}>
                    {loading ? <Loader2 className="h-4 w-4 text-[#8b5cf6]" /> : <RefreshCw className="h-4 w-4 text-black" />}
                  </motion.div>
                </motion.button>
              </div>
            </FadeUp>

            {/* Repo list */}
            <FadeUp delay={0.16}>
              <SectionCard
                title="Your Repositories"
                action={<span className="text-xs text-black/60 font-medium">{filtered.length} total</span>}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#8b5cf6]" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-8 text-sm text-black/50">
                    {query ? "No repositories match your search." : "No repositories found."}
                  </div>
                ) : (
                  <StaggerContainer className="space-y-3">
                    {filtered.map((r, i) => (
                      <StaggerItem key={r.id}>
                        <motion.li
                          className="flex items-center gap-3 p-3 rounded-xl border border-[#eee] list-none"
                          whileHover={{ backgroundColor: "#fafaf7", x: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                          whileTap={{ scale: 0.99 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        >
                          <motion.div
                            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: ACCENTS[i % ACCENTS.length] }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            <GitHubLogo className="h-5 w-5 text-black" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <div className="text-sm font-bold text-black truncate">{r.name}</div>
                              {r.private
                                ? <Lock className="h-3 w-3 text-black/30 shrink-0" />
                                : <Globe className="h-3 w-3 text-black/30 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-black/60">
                              {r.language && (
                                <span className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LANG_COLORS[r.language] ?? "#999" }} />
                                  {r.language}
                                </span>
                              )}
                              <span className="flex items-center gap-1"><Star className="h-3 w-3" />{r.stargazers_count}</span>
                              <span>•</span>
                              <span>{timeAgo(r.updated_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 bg-[#ede9fe] text-[#7c3aed] rounded-md px-2 py-1 text-[10px] font-semibold shrink-0">
                              <GitBranch className="h-2.5 w-2.5" />{r.default_branch}
                            </span>
                            <motion.a
                              href={r.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="h-7 w-7 rounded-lg bg-[#f3f2ee] flex items-center justify-center"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ backgroundColor: "#1a1a1a", scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-black/50" />
                            </motion.a>
                          </div>
                        </motion.li>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </SectionCard>
            </FadeUp>
          </>
        )}
      </div>
    </AppShell>
  );
}
