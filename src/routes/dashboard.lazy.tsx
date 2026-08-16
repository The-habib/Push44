import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  BookOpen,
  Clock,
  TrendingUp,
  ExternalLink,
  GitBranch,
  Settings,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getHistory, getPushStreak, formatRelativeTime, type PushRecord, type Platform } from "@/lib/storage";
import { useApp } from "@/contexts/AppContext";
import {
  Base44Logo,
  RocketLogo,
  FlootLogo,
  ZiteLogo,
  BoltLogo,
  LovableLogo,
  FramerLogo,
} from "@/components/BrandLogos";

export const Route = createLazyFileRoute("/dashboard")({ component: DashboardPage });

const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; color: string; Logo: React.ComponentType<{ size?: number }> }
> = {
  base44: { label: "Base44", color: "#ff5500", Logo: Base44Logo },
  framer: { label: "Framer", color: "#0055ff", Logo: FramerLogo },
  lovable: { label: "Lovable", color: "#f43f5e", Logo: LovableLogo },
  rocket: { label: "Rocket.new", color: "#ea580c", Logo: RocketLogo },
  floot: { label: "Floot", color: "#8b5cf6", Logo: FlootLogo },
  zite: { label: "Zite", color: "#0284c7", Logo: ZiteLogo },
  bolt: { label: "bolt.new", color: "#eab308", Logo: BoltLogo },
};

function PlatformBadge({ platform }: { platform?: Platform }) {
  if (!platform || !PLATFORM_CONFIG[platform]) return null;
  const { label, color, Logo } = PLATFORM_CONFIG[platform];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: `${color}14`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <Logo size={12} />
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: PushRecord["status"] }) {
  const isSuccess = status === "success";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: isSuccess ? "#22c55e" : "#ef4444",
        boxShadow: isSuccess ? "0 0 8px rgba(34,197,94,0.4)" : "0 0 8px rgba(239,68,68,0.4)",
        flexShrink: 0,
      }}
    />
  );
}

export default function DashboardPage() {
  const { creds } = useApp();
  const [history, setHistory] = useState<PushRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setHistory(getHistory());
    setStreak(getPushStreak());
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const successful = history.filter((r) => r.status === "success");
  const totalFiles = successful.reduce((s, r) => s + r.filesCount, 0);
  const uniqueApps = new Set(successful.map((r) => r.appName)).size;
  const recent = history.slice(0, 8);

  const connectedPlatforms: Platform[] = [];
  if (creds.base44Token || creds.base44Email) connectedPlatforms.push("base44");
  if (creds.framerSession || creds.framerApiKey) connectedPlatforms.push("framer");
  if (creds.lovableToken || creds.lovableEmail) connectedPlatforms.push("lovable");
  if (creds.rocketToken) connectedPlatforms.push("rocket");
  if (creds.flootToken) connectedPlatforms.push("floot");
  if (creds.ziteToken) connectedPlatforms.push("zite");
  if (creds.boltToken) connectedPlatforms.push("bolt");

  const hasCredentials = !!(creds.githubToken && connectedPlatforms.length > 0);

  return (
    <div className="page-wide">
      {/* Header Banner */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#191411", margin: 0, letterSpacing: "-0.03em" }}>
              {greeting}{creds.displayName ? `, ${creds.displayName.split(" ")[0]}` : ""}
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "#f0fdf4",
                color: "#16a34a",
                padding: "2px 8px",
                borderRadius: 99,
                border: "1px solid #bbf7d0",
              }}
            >
              100% Client-Side
            </span>
          </div>
          <p style={{ color: "#78716c", margin: 0, fontSize: 14 }}>
            {hasCredentials
              ? `Connected to GitHub with ${connectedPlatforms.length} active platform integrations.`
              : "Connect your AI platforms in Settings to start pushing code to GitHub."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link to="/settings" className="btn btn-secondary btn-sm">
            <Settings size={14} /> Settings
          </Link>
          <Link to="/push" className="btn btn-primary btn-sm">
            <UploadCloud size={14} /> Push App →
          </Link>
        </div>
      </div>

      {/* Metric Bento Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total Pushes", value: successful.length, Icon: UploadCloud, color: "#ff5500" },
          { label: "Apps Synced", value: uniqueApps, Icon: BookOpen, color: "#8b5cf6" },
          { label: "Files Exported", value: totalFiles, Icon: GitBranch, color: "#0284c7" },
          { label: "Day Streak", value: streak, Icon: TrendingUp, color: "#16a34a" },
        ].map(({ label, value, Icon, color }, i) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className="card"
            style={{
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "#ffffff",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: `${color}12`,
                border: `1px solid ${color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#191411", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
                {value.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#78716c", marginTop: 4 }}>
                {label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Platform Connection Status Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: 28,
          background: "#faf8f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#78716c" }}>
            Ecosystem Integrations:
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {(["base44", "framer", "lovable", "rocket", "floot", "zite", "bolt"] as Platform[]).map((p) => {
              const cfg = PLATFORM_CONFIG[p];
              const isConnected = connectedPlatforms.includes(p);
              const Logo = cfg.Logo;
              return (
                <div
                  key={p}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: isConnected ? "#ffffff" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isConnected ? "#bbf7d0" : "#e7e2db"}`,
                    color: isConnected ? "#15803d" : "#a8a29e",
                    opacity: isConnected ? 1 : 0.6,
                  }}
                >
                  <Logo size={13} />
                  <span>{cfg.label}</span>
                  {isConnected && <CheckCircle2 size={11} color="#16a34a" strokeWidth={3} />}
                </div>
              );
            })}
          </div>
        </div>

        <Link
          to="/settings"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#ff5500",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Manage Accounts <ExternalLink size={12} />
        </Link>
      </div>

      {/* Setup Prompt If Incomplete */}
      {!hasCredentials && (
        <div
          className="card"
          style={{
            padding: "20px 24px",
            marginBottom: 28,
            borderColor: "#fed7aa",
            background: "#fff7ed",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#c2410c", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} /> Complete Your Setup
            </div>
            <p style={{ color: "#9a3412", fontSize: 13.5, margin: 0 }}>
              Connect your GitHub PAT and at least one platform (Base44, Framer, Lovable, etc.) to start exporting code.
            </p>
          </div>
          <Link to="/settings" className="btn btn-primary btn-sm">
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Recent Push Activity Feed */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#191411", letterSpacing: "-0.02em" }}>
          Recent Pushes &amp; Commits
        </div>
        {history.length > 0 && (
          <Link to="/history" style={{ fontSize: 13, color: "#ff5500", fontWeight: 700, textDecoration: "none" }}>
            View Full History →
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: "#fff7ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <UploadCloud size={28} color="#ff5500" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#191411", marginBottom: 6 }}>
            No code exported yet
          </div>
          <p style={{ color: "#78716c", fontSize: 14, margin: "0 auto 20px", maxWidth: 420 }}>
            Connect your AI builder and push your first project to GitHub in under 2 minutes.
          </p>
          <Link to="/push" className="btn btn-primary">
            Export Your First App →
          </Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden", background: "#ffffff" }}>
          {recent.map((record, i) => (
            <div
              key={record.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: i < recent.length - 1 ? "1px solid #f3efe9" : "none",
                transition: "background 0.15s",
              }}
            >
              <StatusDot status={record.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#191411" }}>
                    {record.appName}
                  </span>
                  <PlatformBadge platform={record.platform} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#78716c",
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontFamily: "monospace", color: "#191411", fontWeight: 600 }}>
                    {record.repo}
                  </span>
                  <span>·</span>
                  <span>{record.branch}</span>
                  {record.commitHash && (
                    <>
                      <span>·</span>
                      <a
                        href={`https://github.com/${record.repo}/commit/${record.commitHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "monospace",
                          color: "#ff5500",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        {record.commitHash.slice(0, 7)}
                      </a>
                    </>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#78716c", flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#191411" }}>{record.filesCount} files</div>
                <div>{formatRelativeTime(record.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
