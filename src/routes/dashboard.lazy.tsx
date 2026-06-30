import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UploadCloud, BookOpen, Clock, TrendingUp, ExternalLink, GitBranch } from "lucide-react";
import { getHistory, getPushStreak, formatRelativeTime, type PushRecord, type Platform } from "@/lib/storage";
import { useApp } from "@/contexts/AppContext";

export const Route = createLazyFileRoute("/dashboard")({ component: DashboardPage });

const PLATFORM_COLORS: Record<Platform, string> = {
  base44: "#f97316",
  rocket: "#8b5cf6",
  floot:  "#6366f1",
  zite:   "#0ea5e9",
};

const PLATFORM_LABELS: Record<Platform, string> = {
  base44: "Base44",
  rocket: "Rocket.new",
  floot:  "Floot",
  zite:   "Zite",
};

function PlatformBadge({ platform }: { platform?: Platform }) {
  if (!platform) return null;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: `${PLATFORM_COLORS[platform]}18`, color: PLATFORM_COLORS[platform],
    }}>
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

function StatusDot({ status }: { status: PushRecord["status"] }) {
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: status === "success" ? "#22c55e" : "#ef4444",
      flexShrink: 0,
    }} />
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

  const hasCredentials = !!(creds.githubToken && (creds.base44Token || creds.rocketToken));

  return (
    <div className="page-wide">
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            {greeting}{creds.displayName ? `, ${creds.displayName.split(" ")[0]}` : ""}
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            {hasCredentials ? "Everything is connected. Ready to push." : "Connect your accounts in Settings to get started."}
          </p>
        </div>
        {hasCredentials && (
          <Link to="/push" className="btn btn-primary" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            <UploadCloud size={15} /> Push an App
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Pushes",  value: successful.length, Icon: UploadCloud, color: "#f97316" },
          { label: "Apps Pushed",   value: uniqueApps,         Icon: BookOpen,   color: "#8b5cf6" },
          { label: "Files Synced",  value: totalFiles,         Icon: GitBranch,  color: "#0ea5e9" },
          { label: "Day Streak",    value: streak,             Icon: TrendingUp, color: "#22c55e" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      {!hasCredentials && (
        <div className="card" style={{ padding: 20, marginBottom: 24, borderColor: "#fed7aa", background: "#fff7ed" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#c2410c", marginBottom: 6 }}>Finish setup</div>
          <p style={{ color: "#9a3412", fontSize: 13, margin: "0 0 12px" }}>Connect GitHub and at least one platform to start pushing your apps.</p>
          <Link to="/settings" className="btn btn-primary btn-sm">Go to Settings →</Link>
        </div>
      )}

      {/* Recent pushes */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Pushes</div>
        {history.length > 0 && (
          <Link to="/history" style={{ fontSize: 12, color: "#f97316", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <UploadCloud size={32} color="#cbd5e1" style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 8 }}>No pushes yet</div>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px" }}>Push your first app to GitHub in under 2 minutes.</p>
          <Link to="/push" className="btn btn-primary">Push an App →</Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {recent.map((record, i) => (
            <div key={record.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              borderBottom: i < recent.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <StatusDot status={record.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{record.appName}</span>
                  <PlatformBadge platform={record.platform} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "monospace" }}>{record.repo}</span>
                  <span>·</span>
                  <span>{record.branch}</span>
                  {record.commitHash && <><span>·</span><span style={{ fontFamily: "monospace" }}>{record.commitHash}</span></>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0, textAlign: "right" }}>
                <div>{record.filesCount} files</div>
                <div>{formatRelativeTime(record.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
