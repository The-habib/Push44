import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, Search, Star, Loader2, Lock, Globe,
  ExternalLink, RefreshCw, UploadCloud, Archive,
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listGitHubRepos } from "@/lib/github-api";

export const Route = createFileRoute("/repositories")({ component: ReposPage });

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f0b429", Python: "#3776ab",
  CSS: "#264de4", HTML: "#e34c26", Rust: "#dea584", Go: "#00ADD8",
  Java: "#b07219", "C++": "#f34b7d", Ruby: "#701516",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function ReposPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [repos, setRepos]     = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery]     = useState("");

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
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) ||
           r.full_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <AnimatedCorner variant="repos" />

      {/* Header */}
      <FadeUp>
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">GitHub</p>
          <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Repositories</h1>
          <p className="text-[13px] text-[#9a8880] mt-0.5">
            {isConnected
              ? loading ? "Loading your repos…" : `${repos.length} connected repos`
              : "Connect GitHub in Settings to see your repos."}
          </p>
        </div>
      </FadeUp>

      {!isConnected ? (
        <FadeUp delay={0.08}>
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <motion.div
              className="h-20 w-20 rounded-[24px] bg-[#1a1a1a] flex items-center justify-center shadow-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GitHubLogo className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <p className="text-[15px] font-black text-[#1a1a1a] mb-1.5">GitHub not connected</p>
              <p className="text-[12px] text-[#9a8880] max-w-[200px] leading-relaxed">
                Add your GitHub token in Settings to browse and push to repositories.
              </p>
            </div>
            <MotionButton
              onClick={() => navigate({ to: "/settings" })}
              className="flex items-center gap-2 bg-[#1a1a1a] text-white font-bold px-6 py-3 rounded-2xl text-[13px]"
            >
              <GitHubLogo className="h-4 w-4" />Go to Settings
            </MotionButton>
          </div>
        </FadeUp>
      ) : (
        <>
          {/* Search + Refresh */}
          <FadeUp delay={0.06}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-[#f0ece4] shadow-sm">
                <Search className="h-4 w-4 text-[#c8b8a2] shrink-0" />
                <input
                  placeholder="Search repositories…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#c8b8a2] text-[#1a1a1a]"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[#c8b8a2] hover:text-[#9a8880] text-[11px] font-medium">✕</button>
                )}
              </div>
              <motion.button
                onClick={load}
                disabled={loading}
                className="h-11 w-11 rounded-2xl bg-white border border-[#f0ece4] flex items-center justify-center shrink-0 shadow-sm"
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.9, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 text-[#f97316]" />
                    : <RefreshCw className="h-4 w-4 text-[#9a8880]" />}
                </motion.div>
              </motion.button>
            </div>
          </FadeUp>

          {/* Count pill */}
          {!loading && filtered.length > 0 && (
            <FadeUp delay={0.08}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#9a8880] uppercase tracking-wider">
                  {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `${repos.length} repositories`}
                </span>
              </div>
            </FadeUp>
          )}

          {/* List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <Loader2 className="h-7 w-7 animate-spin text-[#f97316]" />
              </div>
              <p className="text-[12px] text-[#9a8880] font-medium">Fetching repositories…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#faf7f3] flex items-center justify-center">
                <Archive className="h-7 w-7 text-[#c8b8a2]" />
              </div>
              <p className="text-[13px] font-bold text-[#1a1a1a]">{query ? "No matching repos" : "No repositories found"}</p>
              {query && <button onClick={() => setQuery("")} className="text-[12px] font-semibold text-[#f97316]">Clear search</button>}
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
              {filtered.map((r) => (
                <StaggerItem key={r.id}>
                  <motion.div
                    className="bg-white rounded-[20px] p-4 border border-[#f0ece4] shadow-sm"
                    whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.08)", borderColor: "rgba(249,115,22,0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0 mt-0.5">
                        <GitHubLogo className="h-5 w-5 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[14px] font-bold text-[#1a1a1a] truncate">{r.name}</span>
                          <span className="shrink-0">
                            {r.private
                              ? <Lock className="h-3 w-3 text-[#c8b8a2]" />
                              : <Globe className="h-3 w-3 text-[#c8b8a2]" />}
                          </span>
                        </div>

                        {r.description && (
                          <p className="text-[11px] text-[#9a8880] leading-snug mb-2 line-clamp-1">{r.description}</p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {r.language && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#6b6360] font-medium">
                              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: LANG_COLORS[r.language] ?? "#c8b8a2" }} />
                              {r.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-[#9a8880]">
                            <Star className="h-3 w-3" />{r.stargazers_count}
                          </span>
                          <span className="text-[11px] text-[#9a8880]">{timeAgo(r.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f7f4f0]">
                      <span className="flex items-center gap-1.5 bg-[#fff4ed] text-[#f97316] rounded-lg px-2.5 py-1 text-[11px] font-bold">
                        <GitBranch className="h-3 w-3" />{r.default_branch}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <motion.button
                          onClick={() => navigate({ to: "/push" })}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#f97316] bg-[#fff4ed]"
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                          transition={{ type: "spring", stiffness: 400, damping: 26 }}
                        >
                          <UploadCloud className="h-3.5 w-3.5" />Push
                        </motion.button>
                        <motion.a
                          href={r.html_url} target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 rounded-xl bg-[#faf7f3] border border-[#f0ece4] flex items-center justify-center text-[#9a8880]"
                          whileHover={{ scale: 1.1, backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                          transition={{ type: "spring", stiffness: 380, damping: 22 }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </motion.a>
                      </div>
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
