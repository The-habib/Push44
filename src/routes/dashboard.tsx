import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import {
  FadeUp, StaggerContainer, StaggerItem, MotionButton,
} from "@/components/PageTransition";
import { useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight, Clock, GitBranch, Loader2, AlertTriangle,
  Zap, LayoutGrid, Archive, CheckCircle2, XCircle,
  Rocket, Flame, GitCommit, ExternalLink, Lock, RefreshCw,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { GitHubLogo, Base44Logo, RocketLogo, FlootLogo, ZiteLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps } from "@/lib/base44-api";
import { listGitHubRepos } from "@/lib/github-api";
import {
  getHistory, formatRelativeTime, getPushStreak, getWeeklyActivity, savePushPrefs,
} from "@/lib/storage";
import { SkeletonStatCard, SkeletonRepoCard } from "@/components/Skeleton";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Push44" },
      {
        name: "description",
        content:
          "View your Base44 apps, GitHub repos, push stats and recent activity at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

/* ─── design tokens ────────────────────────────────────────── */
const EO = [0.22, 1, 0.36, 1] as const;
const SP = { type: "spring", stiffness: 440, damping: 32 } as const;

/* ─── sub-components ───────────────────────────────────────── */

/** Animated green/grey status dot */
function StatusDot({ connected }: { connected: boolean }) {
  return (
    <motion.span
      className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${
        connected ? "bg-[#22c55e]" : "bg-[#d4ccc4]"
      }`}
      animate={connected ? { scale: [1, 1.6, 1], opacity: [1, 0.4, 1] } : {}}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Card section header with optional right-side action */
function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f0ea]">
      <div>
        <div className="text-[14px] font-black text-[#1a1a1a] tracking-tight leading-tight">
          {title}
        </div>
        {sub && (
          <div className="text-[11px] text-[#9a8880] mt-0.5 font-medium">{sub}</div>
        )}
      </div>
      {action}
    </div>
  );
}

/** Small pill badge used in section headers */
function PillAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <MotionButton
      onClick={onClick}
      className="text-[11px] font-bold text-[#f97316] bg-[#fff4ed] rounded-full px-3 py-1.5 border border-[#fde7cc]"
    >
      {label}
    </MotionButton>
  );
}

/* ─── page ─────────────────────────────────────────────────── */
function Dashboard() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [history, setHistory]   = useState(getHistory());
  const [greeting, setGreeting] = useState("");
  const [streak, setStreak]     = useState(0);
  const [weekData, setWeekData] = useState<
    { day: string; pushes: number; files: number }[]
  >([]);

  /* ── derived flags ── */
  const hasGitHub = !!creds.githubToken;
  const hasBase44 = !!creds.base44Token;
  const hasRocket = !!creds.rocketToken;
  const hasFloot  = !!creds.flootToken;
  const hasZite   = !!creds.ziteSession;
  const isConnected = !!((hasBase44 || hasRocket || hasFloot || hasZite) && hasGitHub);
  const lastPush    = history[0];
  const firstName   = (creds.displayName || "").trim().split(/\s+/)[0] || "";
  const weekPushes  = weekData.reduce((s, d) => s + d.pushes, 0);
  const weekFiles   = weekData.reduce((s, d) => s + d.files, 0);
  const maxPushes   = Math.max(...weekData.map(d => d.pushes), 1);

  /* ── queries ── */
  const { data: apps = [], isLoading: loadingApps } = useQuery({
    queryKey: ["base44-apps", creds.base44Token],
    queryFn: () => listBase44Apps({ data: { token: creds.base44Token! } }),
    enabled: !!creds.base44Token && isLoaded,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 1,
  });

  const { data: repos = [], isLoading: loadingRepos } = useQuery({
    queryKey: ["github-repos", creds.githubToken],
    queryFn: () => listGitHubRepos({ data: { token: creds.githubToken! } }),
    enabled: !!creds.githubToken && isLoaded,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );
    const hist = getHistory();
    setHistory(hist);
    setStreak(getPushStreak());
    setWeekData(getWeeklyActivity());
  }, []);

  /* ── hero badge text ── */
  const connectedPlatforms = [
    hasBase44 && "Base44",
    hasRocket && "Rocket.new",
    hasFloot  && "Floot",
    hasZite   && "Zite",
  ].filter(Boolean) as string[];

  const heroBadge = isConnected
    ? connectedPlatforms.length > 2
      ? `${connectedPlatforms.length} Platforms → GitHub`
      : `${connectedPlatforms.join(" + ")} → GitHub`
    : "Not connected";

  const heroSub = isConnected
    ? `${loadingApps ? "—" : apps.length} apps · ${loadingRepos ? "—" : repos.length} repos · ${history.length} pushes`
    : "Connect your accounts to start pushing.";

  /* ── service tiles data ── */
  const platformServices = [
    {
      label: "Base44",
      sub: creds.base44Email || (hasBase44 ? "Connected" : "—"),
      connected: hasBase44,
      Icon: Base44Logo,
      color: "#f97316",
      bg: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.20)",
    },
    {
      label: "Rocket.new",
      sub: creds.rocketEmail || (hasRocket ? "Connected" : "—"),
      connected: hasRocket,
      Icon: RocketLogo,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
      border: "rgba(99,102,241,0.18)",
    },
    {
      label: "Floot",
      sub: creds.flootEmail || (hasFloot ? "Connected" : "—"),
      connected: hasFloot,
      Icon: FlootLogo,
      color: "#2563eb",
      bg: "rgba(37,99,235,0.07)",
      border: "rgba(37,99,235,0.18)",
    },
    {
      label: "Zite",
      sub: creds.ziteEmail || (hasZite ? "Connected" : "—"),
      connected: hasZite,
      Icon: ZiteLogo,
      color: "#d97706",
      bg: "rgba(217,119,6,0.08)",
      border: "rgba(217,119,6,0.20)",
    },
  ] as const;

  /* ── stat cards data ── */
  const statCards = [
    {
      label: "Apps",
      value: loadingApps && isConnected ? null : apps.length,
      Icon: LayoutGrid,
      bg: "rgba(249,115,22,0.07)",
      accent: "#f97316",
    },
    {
      label: "Repos",
      value: loadingRepos && isConnected ? null : repos.length,
      Icon: Archive,
      bg: "rgba(34,197,94,0.06)",
      accent: "#22c55e",
    },
    {
      label: "Pushes",
      value: history.length,
      Icon: Clock,
      bg: "rgba(154,136,128,0.08)",
      accent: "#9a8880",
    },
  ] as const;

  return (
    <>
      <AnimatedCorner variant="dashboard" />

      {/* ── Greeting ──────────────────────────────── */}
      <FadeUp>
        <div className="mb-5">
          <p className="text-[10.5px] font-bold text-[#b8a898] tracking-[0.18em] uppercase mb-1.5">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="text-[27px] font-black text-[#1a1a1a] tracking-tight leading-[1.1]">
            {isConnected ? "What are you shipping?" : "Let's get set up."}
          </h1>
        </div>
      </FadeUp>

      {/* ── Hero card ──────────────────────────────── */}
      <FadeUp delay={0.06}>
        <div
          className="relative rounded-[28px] overflow-hidden mb-4 select-none"
          style={{
            background: "linear-gradient(145deg, #fb923c 0%, #f97316 48%, #ea580c 100%)",
          }}
        >
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Top-right radial glow */}
          <div
            className="absolute -top-16 -right-16 h-64 w-64 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.24) 0%, transparent 68%)",
            }}
          />
          {/* Bottom-left softer glow */}
          <div
            className="absolute -bottom-14 -left-10 h-52 w-52 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 px-6 pt-6 pb-7">
            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 border"
              style={{ borderColor: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.12)" }}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-white"
                animate={
                  isConnected
                    ? { scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }
                    : { opacity: 0.4 }
                }
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/75">
                {heroBadge}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[32px] sm:text-[36px] font-black leading-[1.06] tracking-tight text-white mb-2">
              Push your<br />code to GitHub
            </h2>
            <p className="text-[13px] text-white/55 mb-7 font-medium leading-relaxed">
              {heroSub}
            </p>

            {/* CTA */}
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 rounded-[16px] px-5 py-3 font-bold text-[13.5px] text-[#f97316] bg-white"
              style={{ boxShadow: "0 4px 22px rgba(0,0,0,0.20)" }}
              whileHover={{
                scale: 1.04,
                y: -2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={SP}
              onClick={() => navigate({ to: isConnected ? "/push" : "/settings" })}
            >
              <Zap className="h-4 w-4" strokeWidth={2.5} />
              {isConnected ? "Push Now" : "Get Started"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Watermark */}
          <div
            className="absolute right-5 bottom-5 pointer-events-none"
            style={{ opacity: 0.09 }}
          >
            <GitHubLogo size={96} className="text-white" />
          </div>
        </div>
      </FadeUp>

      {/* ── Setup banner ───────────────────────────── */}
      {!isConnected && (
        <FadeUp delay={0.10}>
          <motion.div
            className="flex items-center gap-3 rounded-[20px] p-4 mb-4 cursor-pointer border"
            style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
            onClick={() => navigate({ to: "/settings" })}
            whileTap={{ scale: 0.985 }}
            transition={SP}
          >
            <div className="h-9 w-9 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: "rgba(249,115,22,0.12)" }}
            >
              <AlertTriangle className="h-[18px] w-[18px] text-[#f97316]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-[#9a3412] leading-tight">
                Setup required
              </div>
              <div className="text-[11px] text-[#c2410c]/65 mt-0.5 font-medium">
                Connect a platform (Base44, Rocket, Floot, Zite) + GitHub.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#f97316] shrink-0" />
          </motion.div>
        </FadeUp>
      )}

      {/* ── Connection health tiles ─────────────────── */}
      <FadeUp delay={0.09}>
        {/* Platform tiles (4-col) */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {platformServices.map(({ label, sub, connected, Icon, color, bg, border }) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => navigate({ to: "/settings" })}
              className="rounded-[16px] py-3 px-1.5 flex flex-col items-center gap-1.5 border w-full"
              style={{
                background: connected ? bg : "rgba(0,0,0,0.025)",
                borderColor: connected ? border : "rgba(0,0,0,0.07)",
              }}
              whileHover={{ y: -2, transition: SP }}
              whileTap={{ scale: 0.95, transition: SP }}
            >
              <div className="h-8 w-8 flex items-center justify-center">
                <Icon
                  size={22}
                  className={connected ? "" : "opacity-25"}
                  style={{ color: connected ? color : undefined }}
                />
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                <span
                  className="text-[9px] font-extrabold tracking-wide leading-none text-center"
                  style={{ color: connected ? color : "#c8b8a2" }}
                >
                  {label}
                </span>
                <StatusDot connected={connected} />
              </div>
            </motion.button>
          ))}
        </div>
        {/* GitHub — full-width card */}
        <motion.button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="w-full rounded-[16px] px-4 py-3 flex items-center gap-3 border mb-4"
          style={{
            background: hasGitHub ? "rgba(26,26,26,0.04)" : "rgba(0,0,0,0.025)",
            borderColor: hasGitHub ? "rgba(26,26,26,0.12)" : "rgba(0,0,0,0.07)",
          }}
          whileHover={{ y: -1, transition: SP }}
          whileTap={{ scale: 0.98, transition: SP }}
        >
          <GitHubLogo
            size={22}
            className={hasGitHub ? "text-[#1a1a1a]" : "text-[#c8b8a2]"}
          />
          <div className="flex-1 text-left min-w-0">
            <div
              className="text-[12px] font-extrabold leading-none"
              style={{ color: hasGitHub ? "#1a1a1a" : "#c8b8a2" }}
            >
              GitHub
            </div>
            <div
              className="text-[10.5px] font-medium mt-0.5 truncate"
              style={{ color: hasGitHub ? "#6b6360" : "#d4ccc4" }}
            >
              {creds.githubUsername ? `@${creds.githubUsername}` : (hasGitHub ? "Connected" : "Not connected")}
            </div>
          </div>
          <StatusDot connected={hasGitHub} />
        </motion.button>
      </FadeUp>

      {/* ── Stat cards ──────────────────────────────── */}
      {(loadingApps || loadingRepos) && !apps.length && !repos.length ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-3 gap-3 mb-4">
          {statCards.map(({ label, value, Icon, bg, accent }) => (
            <StaggerItem key={label}>
              <motion.div
                className="rounded-[20px] p-4 flex flex-col gap-3 border border-transparent"
                style={{ background: bg }}
                whileHover={{
                  y: -3,
                  borderColor: `${accent}22`,
                  boxShadow: "0 10px 28px rgba(0,0,0,0.07)",
                  transition: SP,
                }}
              >
                <div
                  className="h-8 w-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: `${accent}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-[9.5px] font-bold text-[#b8a898] uppercase tracking-widest mb-1">
                    {label}
                  </div>
                  <div className="text-[26px] font-black text-[#1a1a1a] leading-none">
                    {value === null
                      ? <Loader2 className="h-5 w-5 animate-spin text-[#c8b8a2] mt-1.5" />
                      : value
                    }
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ── Weekly activity chart ───────────────────── */}
      {history.length > 0 && (
        <FadeUp delay={0.14}>
          <div className="bg-white rounded-[24px] border border-[#f0ece4] overflow-hidden mb-4">
            <SectionHeader
              title="This week"
              sub={`${weekPushes} push${weekPushes !== 1 ? "es" : ""} · ${weekFiles.toLocaleString()} files`}
              action={
                streak > 0 ? (
                  <div className="flex items-center gap-1.5 bg-[#fff4ed] rounded-full px-2.5 py-1.5 border border-[#fde7cc]">
                    <Flame className="h-3 w-3 text-[#f97316]" />
                    <span className="text-[11px] font-bold text-[#f97316]">
                      {streak}d streak
                    </span>
                  </div>
                ) : undefined
              }
            />
            <div className="px-4 pt-3.5 pb-3">
              <div style={{ height: 72 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                  <BarChart
                    data={weekData}
                    barSize={18}
                    margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                  >
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#1a1a1a] rounded-xl px-3 py-2 text-center shadow-xl">
                            <div className="text-[13px] font-black text-white">{d.pushes}</div>
                            <div className="text-[9px] text-white/45 font-bold uppercase tracking-wider">
                              {d.day}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="pushes" radius={[6, 6, 2, 2]}>
                      {weekData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.pushes > 0 ? "#f97316" : "#f0ece4"}
                          opacity={
                            entry.pushes === maxPushes && entry.pushes > 0 ? 1
                            : entry.pushes > 0 ? 0.5 : 1
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between px-0.5 mt-2">
                {weekData.map((d, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold text-[#c8b8a2] w-[18px] text-center"
                  >
                    {d.day.slice(0, 1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── Last push ───────────────────────────────── */}
      {lastPush && (
        <FadeUp delay={0.17}>
          <div className="bg-white rounded-[24px] overflow-hidden border border-[#f0ece4] mb-4">
            <SectionHeader
              title="Last Push"
              action={
                <PillAction
                  label="History →"
                  onClick={() => navigate({ to: "/history" })}
                />
              }
            />
            <div className="p-4">
              <div
                className="rounded-[18px] p-4"
                style={{
                  background:
                    lastPush.status === "success"
                      ? "rgba(240,253,244,0.8)"
                      : "rgba(254,242,242,0.8)",
                  border: `1px solid ${
                    lastPush.status === "success" ? "#bbf7d0" : "#fecaca"
                  }`,
                }}
              >
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{
                      background:
                        lastPush.status === "success" ? "#dcfce7" : "#fee2e2",
                    }}
                  >
                    {lastPush.status === "success"
                      ? <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                      : <XCircle className="h-5 w-5 text-[#ef4444]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[#1a1a1a] truncate leading-tight">
                      {lastPush.appName}
                    </div>
                    <div className="text-[11px] text-[#6b6360] truncate mt-0.5 font-medium">
                      {lastPush.repo}
                    </div>
                    {lastPush.commitHash && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <GitCommit className="h-3 w-3 text-[#b8a898]" />
                        <span className="text-[10px] font-mono text-[#b8a898]">
                          {lastPush.commitHash.slice(0, 10)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                      style={{
                        background:
                          lastPush.status === "success" ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {lastPush.status === "success" ? "✓ OK" : "✗ Fail"}
                    </div>
                    <div className="text-[10px] text-[#b8a898] mt-1.5 font-medium">
                      {formatRelativeTime(lastPush.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Meta footer */}
                <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-black/[0.05] text-[11px] text-[#6b6360]">
                  <span className="flex items-center gap-1">
                    <strong className="text-[#1a1a1a] font-bold">
                      {lastPush.filesCount}
                    </strong>
                    <span className="text-[#b8a898]">files</span>
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[#e8e3db]" />
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3 text-[#b8a898]" />
                    <span className="font-medium">{lastPush.branch}</span>
                  </span>
                  {lastPush.commitHash && (
                    <a
                      href={`https://github.com/${lastPush.repo}/commit/${lastPush.commitHash}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="ml-auto flex items-center gap-1 text-[#b8a898] hover:text-[#f97316] transition-colors font-semibold"
                    >
                      View
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── Quick re-push tile ──────────────────────── */}
      {lastPush && lastPush.status === "success" && (
        <FadeUp delay={0.19}>
          <motion.div
            className="rounded-[24px] border mb-4 overflow-hidden"
            style={{ background: "linear-gradient(135deg,#fff8f2 0%,#fffaf5 100%)", borderColor: "#f0ece4" }}
            whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(249,115,22,0.12)" }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="px-5 py-4 flex items-center gap-4">
              {/* Icon */}
              <div
                className="h-12 w-12 rounded-[16px] flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.28)" }}
              >
                <RefreshCw className="h-5 w-5 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black text-[#f97316] uppercase tracking-wider">Quick re-push</span>
                  {lastPush.platform === "rocket"
                    ? <RocketLogo size={11} />
                    : <Base44Logo size={11} />}
                </div>
                <div className="text-[14px] font-black text-[#1a1a1a] truncate leading-tight">{lastPush.appName}</div>
                <div className="text-[11px] text-[#9a8880] truncate mt-0.5 font-medium">{lastPush.repo}</div>
              </div>

              {/* CTA */}
              <MotionButton
                onClick={() => {
                  savePushPrefs({
                    platform: lastPush.platform ?? "base44",
                    repushAppName: lastPush.appName,
                    lastRepo: lastPush.repo ? {
                      full_name: lastPush.repo,
                      default_branch: lastPush.branch,
                      html_url: `https://github.com/${lastPush.repo}`,
                    } : null,
                  });
                  navigate({ to: "/push" });
                }}
                className="flex items-center gap-1.5 text-white text-[12px] font-bold px-3.5 py-2.5 rounded-[14px] shrink-0"
                style={{
                  background: "linear-gradient(135deg,#f97316,#ea580c)",
                  boxShadow: "0 3px 14px rgba(249,115,22,0.32)",
                }}
              >
                Push again <ArrowRight className="h-3.5 w-3.5" />
              </MotionButton>
            </div>

            {/* Bottom strip */}
            <div className="px-5 py-2.5 border-t border-[#f5f0ea] flex items-center gap-3 text-[10px] text-[#b8a898] font-medium">
              <GitBranch className="h-3 w-3" />
              <span>{lastPush.branch}</span>
              <span className="h-1 w-1 rounded-full bg-[#e8e3db]" />
              <span>{lastPush.filesCount} files last push</span>
              <span className="h-1 w-1 rounded-full bg-[#e8e3db]" />
              <span>{formatRelativeTime(lastPush.timestamp)}</span>
            </div>
          </motion.div>
        </FadeUp>
      )}

      {/* ── Recent repos ────────────────────────────── */}
      {isConnected && (loadingRepos || repos.length > 0) && (
        <FadeUp delay={0.20}>
          <div className="bg-white rounded-[24px] overflow-hidden border border-[#f0ece4] mb-4">
            <SectionHeader
              title="Recent Repos"
              action={
                <PillAction
                  label="View all →"
                  onClick={() => navigate({ to: "/repositories" })}
                />
              }
            />
            <div className="p-3 space-y-2">
              {loadingRepos && repos.length === 0 ? (
                <>
                  <SkeletonRepoCard />
                  <SkeletonRepoCard />
                  <SkeletonRepoCard />
                </>
              ) : (
                repos.slice(0, 3).map((repo, i) => (
                  <motion.div
                    key={repo.full_name}
                    className="flex items-center gap-3 rounded-[18px] p-3.5 cursor-pointer"
                    style={{ background: "#faf7f3" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: i * 0.07, ease: EO }}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
                      transition: SP,
                    }}
                    whileTap={{ scale: 0.985, transition: SP }}
                    onClick={() => navigate({ to: "/push" })}
                  >
                    {/* GitHub avatar */}
                    <div className="h-9 w-9 rounded-[12px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      <GitHubLogo className="h-[18px] w-[18px] text-white" />
                    </div>

                    {/* Repo info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold text-[#1a1a1a] truncate leading-tight">
                        {repo.full_name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <GitBranch className="h-2.5 w-2.5 text-[#c8b8a2] shrink-0" />
                        <span className="text-[10px] text-[#9a8880] font-medium">
                          {repo.default_branch}
                        </span>
                        {(repo as { private?: boolean }).private && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-[#d4ccc4]" />
                            <Lock className="h-2.5 w-2.5 text-[#c8b8a2]" />
                            <span className="text-[9.5px] text-[#b8a898] font-semibold">Private</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Push action */}
                    <div
                      className="h-8 w-8 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #fb923c, #f97316)",
                        boxShadow: "0 3px 10px rgba(249,115,22,0.38)",
                      }}
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── Ship-it CTA ─────────────────────────────── */}
      {isConnected && (
        <FadeUp delay={0.24}>
          <motion.div
            className="rounded-[24px] p-5 flex items-center justify-between mb-2 cursor-pointer overflow-hidden relative"
            style={{
              background: "linear-gradient(140deg, #1c1917 0%, #292524 100%)",
            }}
            onClick={() => navigate({ to: "/push" })}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 14px 40px rgba(0,0,0,0.26)",
              transition: SP,
            }}
            whileTap={{ scale: 0.985, transition: SP }}
          >
            {/* Subtle orange top-right glow */}
            <div
              className="absolute -top-8 -right-8 h-40 w-40 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(249,115,22,0.20) 0%, transparent 68%)",
              }}
            />

            <div className="relative z-10 mr-4 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="h-4 w-4 text-[#f97316] shrink-0" />
                <div className="text-[15px] font-black text-white tracking-tight">
                  Ready to ship?
                </div>
              </div>
              <div className="text-[12px] text-white/35 font-medium">
                Push your latest app in seconds.
              </div>
            </div>

            <motion.button
              type="button"
              className="relative z-10 flex items-center gap-1.5 rounded-[16px] px-4 py-2.5 font-bold text-[13px] text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #fb923c, #f97316)",
                boxShadow: "0 4px 18px rgba(249,115,22,0.50)",
              }}
              onClick={e => {
                e.stopPropagation();
                navigate({ to: "/push" });
              }}
              whileHover={{ scale: 1.07, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={SP}
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
              Push
            </motion.button>
          </motion.div>
        </FadeUp>
      )}
    </>
  );
}
