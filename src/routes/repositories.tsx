import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitBranch, Search, Star, Loader2, Lock, Globe, ExternalLink, RefreshCw } from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listGitHubRepos } from "@/lib/github-api";

export const Route = createFileRoute("/repositories")({ component: ReposPage });

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3776ab",
  CSS: "#264de4", HTML: "#e34c26", Rust: "#dea584", Go: "#00ADD8",
  Java: "#b07219", "C++": "#f34b7d", Ruby: "#701516",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function ReposPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [repos, setRepos]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery]   = useState("");

  const isConnected = !!creds.githubToken;

  useEffect(() => {
    if (!isLoaded || !isConnected) return;
    load();
  }, [isLoaded, isConnected]);

  const load = async () => {
    if (!creds.githubToken) return;
    setLoading(true);
    try { setRepos(await listGitHubRepos({ data: { token: creds.githubToken } })); }
    catch {}
    finally { setLoading(false); }
  };

  const filtered = repos.filter(
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.full_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <AnimatedCorner variant="repos" />

      <FadeUp>
        <h1 className="text-[26px] font-extrabold text-black tracking-tight mb-1">Repositories</h1>
        <p className="text-[13px] text-black/45 mb-5">
          {isConnected ? (loading ? "Loading…" : `${repos.length} connected repos`) : "Connect GitHub in Settings."}
        </p>
      </FadeUp>

      {!isConnected ? (
        <FadeUp delay={0.08}>
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[#f3f2ee] flex items-center justify-center">
              <GitHubLogo className="h-7 w-7 text-black/25" />
            </div>
            <p className="text-[13px] text-black/45 max-w-[220px]">Connect your GitHub account in Settings to see repositories.</p>
            <MotionButton onClick={() => navigate({ to: "/settings" })}
              className="bg-[#1a1a1a] text-white font-bold px-5 py-2.5 rounded-2xl text-[13px]">
              Go to Settings
            </MotionButton>
          </div>
        </FadeUp>
      ) : (
        <>
          {/* Search row */}
          <FadeUp delay={0.06}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border border-black/[0.06]">
                <Search className="h-4 w-4 text-black/35 shrink-0" />
                <input
                  placeholder="Search repositories…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-black/30 text-black"
                />
              </div>
              <motion.button onClick={load} disabled={loading}
                className="h-11 w-11 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}>
                <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}>
                  {loading
                    ? <Loader2 className="h-4 w-4 text-[#8b5cf6]" />
                    : <RefreshCw className="h-4 w-4 text-black/50" />}
                </motion.div>
              </motion.button>
            </div>
          </FadeUp>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#8b5cf6]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-black/40">
              {query ? "No results." : "No repositories found."}
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
              {filtered.map((r) => (
                <StaggerItem key={r.id}>
                  <motion.div
                    className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-black/[0.05]"
                    whileHover={{ y: -1, boxShadow: "0 6px 24px rgba(0,0,0,0.08)", x: 1 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      <GitHubLogo className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-black truncate">{r.name}</span>
                        {r.private
                          ? <Lock className="h-3 w-3 text-black/25 shrink-0" />
                          : <Globe className="h-3 w-3 text-black/25 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-black/40 flex-wrap">
                        {r.language && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#bbb" }} />
                            {r.language}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{r.stargazers_count}</span>
                        <span>·</span>
                        <span>{timeAgo(r.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 bg-[#ede9fe] text-[#7c3aed] rounded-lg px-2 py-1 text-[10px] font-semibold">
                        <GitBranch className="h-2.5 w-2.5" />{r.default_branch}
                      </span>
                      <motion.a href={r.html_url} target="_blank" rel="noreferrer"
                        className="h-8 w-8 rounded-xl bg-[#f3f2ee] flex items-center justify-center text-black/35"
                        onClick={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.1, backgroundColor: "#1a1a1a", color: "#fff" }}
                        transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </motion.a>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </>
      )}
    </AppShell>
  );
}
