import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Clock,
  GitBranch,
  Loader2,
  AlertTriangle,
  Zap,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Settings,
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps } from "@/lib/base44-api";
import { listGitHubRepos } from "@/lib/github-api";
import { getHistory, formatRelativeTime } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Ship to GitHub in one click" },
      {
        name: "description",
        content:
          "Push your Base44 projects to GitHub securely, privately, and encrypted in one click.",
      },
    ],
  }),
  component: Index,
});

function Stat({
  label,
  value,
  loading,
  bg,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  loading?: boolean;
  bg: string;
  accent: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-3xl p-4 flex flex-col gap-3" style={{ background: bg }}>
      <div
        className="h-10 w-10 rounded-2xl flex items-center justify-center"
        style={{ background: accent + "22" }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={2} />
      </div>
      <div>
        <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-2xl font-extrabold text-black leading-none">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-black/30 mt-1" />
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
}

function Index() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [apps, setApps] = useState<{ id: string; name: string; updated_at: string }[]>([]);
  const [repos, setRepos] = useState<{ full_name: string; default_branch: string }[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [history, setHistory] = useState(getHistory());

  const isConnected = !!(creds.base44Token && creds.githubToken);
  const lastPush = history[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (creds.displayName || "").trim().split(/\s+/)[0] || "";

  useEffect(() => {
    if (!isLoaded) return;
    setHistory(getHistory());
    if (!isConnected) return;

    setLoadingApps(true);
    listBase44Apps({ data: { token: creds.base44Token! } })
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoadingApps(false));

    setLoadingRepos(true);
    listGitHubRepos({ data: { token: creds.githubToken! } })
      .then((r) => setRepos(r.map((x) => ({ full_name: x.full_name, default_branch: x.default_branch }))))
      .catch(() => {})
      .finally(() => setLoadingRepos(false));
  }, [isLoaded, isConnected]);

  return (
    <AppShell>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="mb-5 pt-1">
        <p className="text-[12px] text-black/40 font-semibold tracking-widest uppercase">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </p>
        <h2 className="text-[22px] font-extrabold text-black leading-tight mt-1">
          {isConnected ? "What are you shipping?" : "Let's get connected."}
        </h2>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative rounded-[28px] overflow-hidden mb-4"
        style={{ background: "linear-gradient(145deg,#0d0d1f 0%,#16213e 55%,#0a2050 100%)" }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
        <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#f97316,transparent)" }} />

        <div className="relative z-10 px-6 pt-7 pb-7">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-5">
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-[#dce99a] animate-pulse" : "bg-white/30"}`} />
            <span className="text-[11px] font-semibold text-white/70 tracking-widest uppercase">
              {isConnected ? "Base44 → GitHub" : "Not connected"}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-[36px] leading-[1.02] font-extrabold tracking-tight mb-2">
            <span className="text-white">Push your</span>
            <br />
            <span className="text-white">code to </span>
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#dce99a)" }}
            >
              GitHub
            </span>
          </h2>

          <p className="text-[13px] text-white/45 font-medium mb-6 leading-snug">
            {isConnected
              ? `${loadingApps ? "…" : apps.length} apps · ${loadingRepos ? "…" : repos.length} repos · ${history.length} pushes`
              : "Connect Base44 and GitHub to start pushing."}
          </p>

          <button
            onClick={() => navigate({ to: isConnected ? "/push" : "/settings" })}
            className="inline-flex items-center gap-2.5 rounded-2xl px-5 py-3.5 font-bold text-sm text-black shadow-lg active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
          >
            <Zap className="h-4 w-4" strokeWidth={2.5} />
            {isConnected ? "Push Now" : "Get Started"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Decorative GitHub mark — wrapper carries opacity since GitHubLogo has no style prop */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ opacity: 0.08 }}
        >
          <GitHubLogo size={110} className="text-white" />
        </div>
      </section>

      {/* ── Setup banner ─────────────────────────────────────────── */}
      {!isConnected && (
        <button
          onClick={() => navigate({ to: "/settings" })}
          className="w-full flex items-center gap-3 rounded-2xl p-4 mb-4 text-left active:scale-[0.99] transition-transform"
          style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa" }}
        >
          <div className="h-10 w-10 rounded-xl bg-[#f97316]/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-[#f97316]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#9a3412]">Setup required</div>
            <div className="text-[12px] text-[#c2410c]/80 mt-0.5 leading-snug">
              Tap to connect your Base44 account and GitHub token.
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#f97316] shrink-0" />
        </button>
      )}

      {/* ── Stats grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat
          label="Apps"
          value={apps.length}
          loading={loadingApps && isConnected}
          bg="#f0ebff"
          accent="#8b5cf6"
          icon={LayoutGrid}
        />
        <Stat
          label="Repos"
          value={repos.length}
          loading={loadingRepos && isConnected}
          bg="#f0fdf4"
          accent="#22c55e"
          icon={GitHubLogo}
        />
        <Stat
          label="Pushes"
          value={history.length}
          bg="#fff7ed"
          accent="#f97316"
          icon={Clock}
        />
      </div>

      {/* ── Last push ────────────────────────────────────────────── */}
      {lastPush && (
        <div className="bg-white rounded-3xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-extrabold text-black">Last Push</span>
            <button
              onClick={() => navigate({ to: "/history" })}
              className="text-[11px] font-bold text-[#8b5cf6] bg-[#f0ebff] rounded-full px-3 py-1.5"
            >
              History
            </button>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: lastPush.status === "success"
                ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                : "linear-gradient(135deg,#fef2f2,#fee2e2)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: lastPush.status === "success" ? "#22c55e22" : "#ef444422" }}
              >
                {lastPush.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-[#22c55e]" strokeWidth={2} />
                ) : (
                  <XCircle className="h-5 w-5 text-[#ef4444]" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-black truncate">{lastPush.appName}</div>
                <div className="text-[12px] text-black/50 truncate mt-0.5">{lastPush.repo}</div>
                {lastPush.commitHash && (
                  <div className="text-[11px] font-mono text-black/40 mt-1.5 bg-black/5 rounded-lg px-2 py-1 inline-block">
                    {lastPush.commitHash.slice(0, 10)}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: lastPush.status === "success" ? "#22c55e" : "#ef4444",
                    color: "white",
                  }}
                >
                  {lastPush.status === "success" ? "✓ Pushed" : "✗ Failed"}
                </div>
                <div className="text-[10px] text-black/35 mt-1.5 font-medium">
                  {formatRelativeTime(lastPush.timestamp)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/5">
              <div className="text-[11px] text-black/50">
                <span className="font-semibold">{lastPush.filesCount}</span> files
              </div>
              <span className="h-1 w-1 rounded-full bg-black/20" />
              <div className="flex items-center gap-1 text-[11px] text-black/50">
                <GitBranch className="h-3 w-3" />
                <span className="font-semibold">{lastPush.branch}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent repo ──────────────────────────────────────────── */}
      {isConnected && repos.length > 0 && (
        <div className="bg-white rounded-3xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-extrabold text-black">Recent Repository</span>
            <button
              onClick={() => navigate({ to: "/repositories" })}
              className="text-[11px] font-bold text-[#8b5cf6] bg-[#f0ebff] rounded-full px-3 py-1.5"
            >
              View all
            </button>
          </div>
          {loadingRepos ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-[#8b5cf6]" />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-[#f9f8f4] rounded-2xl p-3">
              <div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <GitHubLogo className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-black truncate">{repos[0].full_name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <GitBranch className="h-3 w-3 text-black/30" />
                  <span className="text-[11px] text-black/40 font-medium">{repos[0].default_branch}</span>
                </div>
              </div>
              <button
                onClick={() => navigate({ to: "/push" })}
                className="h-9 w-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0"
              >
                <ArrowRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Ship it card ─────────────────────────────────────────── */}
      {isConnected && (
        <div
          className="rounded-3xl p-5 flex items-center justify-between mb-1"
          style={{ background: "linear-gradient(135deg,#1a1a2e,#0f3460)" }}
        >
          <div>
            <div className="text-base font-extrabold text-white mb-0.5">Ready to ship?</div>
            <div className="text-[12px] text-white/40">Push your latest app in seconds.</div>
          </div>
          <button
            onClick={() => navigate({ to: "/push" })}
            className="flex items-center gap-2 rounded-2xl px-4 py-3 font-bold text-sm text-black active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
          >
            <Zap className="h-4 w-4" strokeWidth={2.5} />
            Push
          </button>
        </div>
      )}
    </AppShell>
  );
}
