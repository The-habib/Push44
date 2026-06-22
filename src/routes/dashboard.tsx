import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionCard, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, GitBranch, Loader2, AlertTriangle, Zap, LayoutGrid, Archive, CheckCircle2, XCircle } from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps } from "@/lib/base44-api";
import { listGitHubRepos } from "@/lib/github-api";
import { getHistory, formatRelativeTime } from "@/lib/storage";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [apps, setApps]           = useState<any[]>([]);
  const [repos, setRepos]         = useState<any[]>([]);
  const [loadingApps, setLA]      = useState(false);
  const [loadingRepos, setLR]     = useState(false);
  const [history, setHistory]     = useState(getHistory());
  const [greeting, setGreeting]   = useState("");
  const isConnected = !!(creds.base44Token && creds.githubToken);
  const lastPush = history[0];
  const firstName = (creds.displayName || "").trim().split(/\s+/)[0] || "";

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setHistory(getHistory());
    if (!isConnected) return;
    setLA(true);
    listBase44Apps({ data: { token: creds.base44Token! } }).then(setApps).catch(() => {}).finally(() => setLA(false));
    setLR(true);
    listGitHubRepos({ data: { token: creds.githubToken! } }).then(setRepos).catch(() => {}).finally(() => setLR(false));
  }, [isLoaded, isConnected]);

  return (
    <AppShell>
      <AnimatedCorner variant="dashboard" />

      {/* Greeting */}
      <FadeUp>
        <p className="text-[11px] font-bold text-black/35 tracking-widest uppercase mb-1">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="text-[26px] font-extrabold text-black tracking-tight mb-5">
          {isConnected ? "What are you shipping?" : "Let's get set up."}
        </h1>
      </FadeUp>

      {/* Hero card */}
      <FadeUp delay={0.06}>
        <div
          className="relative rounded-[28px] overflow-hidden mb-4 px-6 py-7"
          style={{ background: "linear-gradient(145deg,#0d0d1f,#16213e)" }}
        >
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
          {/* glow */}
          <motion.div className="absolute -top-16 -right-16 h-60 w-60 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,#7c3aed55,transparent)" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 border border-white/10 bg-white/[0.07]">
              <motion.span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: isConnected ? "#dce99a" : "rgba(255,255,255,0.3)" }}
                animate={isConnected ? { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/50">
                {isConnected ? "Base44 → GitHub" : "Not connected"}
              </span>
            </div>

            <h2 className="text-[32px] font-extrabold leading-[1.05] tracking-tight text-white mb-2">
              Push your<br />
              code to{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#dce99a)" }}>
                GitHub
              </span>
            </h2>
            <p className="text-[13px] text-white/40 mb-6">
              {isConnected
                ? `${loadingApps ? "…" : apps.length} apps · ${loadingRepos ? "…" : repos.length} repos · ${history.length} pushes`
                : "Connect Base44 and GitHub to start."}
            </p>

            <MotionButton
              onClick={() => navigate({ to: isConnected ? "/push" : "/settings" })}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-sm text-black"
              style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
            >
              <Zap className="h-4 w-4" strokeWidth={2.5} />
              {isConnected ? "Push Now" : "Get Started"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </MotionButton>
          </div>

          {/* faint GitHub mark */}
          <div className="absolute right-5 bottom-5 pointer-events-none opacity-[0.05]">
            <GitHubLogo size={100} className="text-white" />
          </div>
        </div>
      </FadeUp>

      {/* Setup banner */}
      {!isConnected && (
        <FadeUp delay={0.1}>
          <MotionCard
            className="flex items-center gap-3 rounded-2xl p-4 mb-4 cursor-pointer border"
            style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
            onClick={() => navigate({ to: "/settings" })}
          >
            <div className="h-9 w-9 rounded-xl bg-[#f97316]/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-[#f97316]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-[#9a3412]">Setup required</div>
              <div className="text-[11px] text-[#c2410c]/70 mt-0.5">Tap to connect Base44 and GitHub.</div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#f97316] shrink-0" />
          </MotionCard>
        </FadeUp>
      )}

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Apps",   value: apps.length,    loading: loadingApps && isConnected,  bg: "#f0ebff", accent: "#8b5cf6", Icon: LayoutGrid },
          { label: "Repos",  value: repos.length,   loading: loadingRepos && isConnected, bg: "#f0fdf4", accent: "#22c55e", Icon: Archive    },
          { label: "Pushes", value: history.length, loading: false,                       bg: "#fff7ed", accent: "#f97316", Icon: Clock      },
        ].map(({ label, value, loading, bg, accent, Icon }) => (
          <StaggerItem key={label}>
            <motion.div
              className="rounded-[18px] p-4 flex flex-col gap-3 border"
              style={{ background: bg, borderColor: `${accent}22` }}
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div className="h-8 w-8 rounded-[10px] flex items-center justify-center" style={{ background: `${accent}20` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-black/35 uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-[22px] font-extrabold text-black leading-none">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin text-black/25 mt-1" /> : value}
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Last push */}
      {lastPush && (
        <FadeUp delay={0.18}>
          <div className="bg-white rounded-[20px] p-5 mb-4 border border-black/[0.055]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-extrabold text-black">Last Push</span>
              <MotionButton onClick={() => navigate({ to: "/history" })}
                className="text-[11px] font-bold text-[#8b5cf6] bg-[#f0ebff] rounded-full px-3 py-1.5">
                History
              </MotionButton>
            </div>
            <MotionCard
              className="rounded-2xl p-4"
              style={{ background: lastPush.status === "success" ? "#f0fdf4" : "#fef2f2" }}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: lastPush.status === "success" ? "#22c55e18" : "#ef444418" }}>
                  {lastPush.status === "success"
                    ? <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                    : <XCircle className="h-5 w-5 text-[#ef4444]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-black truncate">{lastPush.appName}</div>
                  <div className="text-[11px] text-black/50 truncate mt-0.5">{lastPush.repo}</div>
                  {lastPush.commitHash && (
                    <div className="text-[10px] font-mono text-black/35 mt-1.5 bg-black/5 rounded px-2 py-0.5 inline-block">
                      {lastPush.commitHash.slice(0, 10)}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                    style={{ background: lastPush.status === "success" ? "#22c55e" : "#ef4444" }}>
                    {lastPush.status === "success" ? "✓ Pushed" : "✗ Failed"}
                  </div>
                  <div className="text-[10px] text-black/35 mt-1.5">{formatRelativeTime(lastPush.timestamp)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/5 text-[11px] text-black/45">
                <span><strong>{lastPush.filesCount}</strong> files</span>
                <span className="h-1 w-1 rounded-full bg-black/15" />
                <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{lastPush.branch}</span>
              </div>
            </MotionCard>
          </div>
        </FadeUp>
      )}

      {/* Recent repo */}
      {isConnected && repos.length > 0 && (
        <FadeUp delay={0.22}>
          <div className="bg-white rounded-[20px] p-5 mb-4 border border-black/[0.055]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-extrabold text-black">Recent Repository</span>
              <MotionButton onClick={() => navigate({ to: "/repositories" })}
                className="text-[11px] font-bold text-[#8b5cf6] bg-[#f0ebff] rounded-full px-3 py-1.5">
                View all
              </MotionButton>
            </div>
            <MotionCard className="flex items-center gap-3 bg-[#f9f8f4] rounded-2xl p-3">
              <div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <GitHubLogo className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-black truncate">{repos[0].full_name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <GitBranch className="h-3 w-3 text-black/30" />
                  <span className="text-[11px] text-black/40">{repos[0].default_branch}</span>
                </div>
              </div>
              <MotionButton onClick={() => navigate({ to: "/push" })}
                className="h-9 w-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <ArrowRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </MotionButton>
            </MotionCard>
          </div>
        </FadeUp>
      )}

      {/* Ship-it CTA */}
      {isConnected && (
        <FadeUp delay={0.26}>
          <MotionCard
            className="rounded-3xl p-5 flex items-center justify-between mb-2"
            style={{ background: "linear-gradient(135deg,#1a1a2e,#0f3460)" }}
            onClick={() => navigate({ to: "/push" })}
          >
            <div>
              <div className="text-[15px] font-extrabold text-white mb-0.5">Ready to ship?</div>
              <div className="text-[12px] text-white/35">Push your latest app in seconds.</div>
            </div>
            <MotionButton onClick={() => navigate({ to: "/push" })}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 font-bold text-[13px] text-black"
              style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
              <Zap className="h-4 w-4" strokeWidth={2.5} />Push
            </MotionButton>
          </MotionCard>
        </FadeUp>
      )}
    </AppShell>
  );
}
