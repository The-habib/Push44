import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { UploadCloud, Trash2, ExternalLink, Search, GitBranch, Calendar } from "lucide-react";
import { getHistory, clearHistory, formatRelativeTime, type PushRecord, type Platform } from "@/lib/storage";

export const Route = createLazyFileRoute("/history")({ component: HistoryPage });

const PLATFORM_COLORS: Record<Platform, string> = {
  base44: "#ff5500",
  framer: "#0055ff",
  lovable: "#f43f5e",
  rocket: "#ea580c",
  floot: "#8b5cf6",
  zite: "#0284c7",
  bolt: "#eab308",
};

const PLATFORM_LABELS: Record<Platform, string> = {
  base44: "Base44",
  framer: "Framer",
  lovable: "Lovable",
  rocket: "Rocket.new",
  floot: "Floot",
  zite: "Zite",
  bolt: "bolt.new",
};

export default function HistoryPage() {
  const [records, setRecords] = useState<PushRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            r.appName.toLowerCase().includes(q) ||
            r.repo.toLowerCase().includes(q) ||
            r.branch.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [records, search, statusFilter]
  );

  const handleClear = () => {
    clearHistory();
    setRecords([]);
    setConfirming(false);
  };

  return (
    <div className="page-wide">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#191411", margin: 0, letterSpacing: "-0.03em" }}>
            Push History
          </h1>
          <p style={{ color: "#78716c", fontSize: 13.5, margin: "4px 0 0" }}>
            Track and audit every repository export committed through Push44.
          </p>
        </div>

        {records.length > 0 &&
          (confirming ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#78716c", fontWeight: 600 }}>Clear all records?</span>
              <button className="btn btn-danger btn-sm" onClick={handleClear}>
                Yes, clear
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirming(true)}
              style={{ color: "#ef4444" }}
            >
              <Trash2 size={13} /> Clear History
            </button>
          ))}
      </div>

      {/* Filters & Search */}
      {records.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={14}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#a8a29e" }}
            />
            <input
              aria-label="Search push history"
              className="input"
              placeholder="Search by app, repo, or branch…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div className="tabs" style={{ width: "auto" }}>
            {(["all", "success", "failed"] as const).map((s) => (
              <button
                key={s}
                className={`tab${statusFilter === s ? " active" : ""}`}
                onClick={() => setStatusFilter(s)}
                style={{ minWidth: 64 }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", background: "#ffffff" }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "#faf8f5",
              border: "1px solid #e7e2db",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <UploadCloud size={24} color="#a8a29e" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#191411", marginBottom: 6 }}>
            {records.length === 0 ? "No push history recorded" : "No matching records found"}
          </div>
          <p style={{ color: "#78716c", fontSize: 13.5, margin: "0 auto 16px", maxWidth: 360 }}>
            {records.length === 0
              ? "All successful and failed pushes will appear here with direct commit SHA links."
              : "Try adjusting your search terms or filter status."}
          </p>
          {records.length === 0 && (
            <Link to="/push" className="btn btn-primary btn-sm">
              Push an App →
            </Link>
          )}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden", background: "#ffffff" }}>
          {filtered.map((record, i) => {
            const color = record.platform ? PLATFORM_COLORS[record.platform] : "#ff5500";
            const label = record.platform ? PLATFORM_LABELS[record.platform] : "App";
            return (
              <div
                key={record.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 18px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f3efe9" : "none",
                }}
              >
                {/* Status indicator */}
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    marginTop: 6,
                    flexShrink: 0,
                    background: record.status === "success" ? "#16a34a" : "#dc2626",
                    boxShadow:
                      record.status === "success"
                        ? "0 0 6px rgba(22,163,74,0.4)"
                        : "0 0 6px rgba(220,38,38,0.4)",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#191411" }}>
                      {record.appName}
                    </span>
                    {record.platform && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: `${color}14`,
                          color: color,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {label}
                      </span>
                    )}
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 700,
                        background: record.status === "success" ? "#f0fdf4" : "#fef2f2",
                        color: record.status === "success" ? "#16a34a" : "#dc2626",
                        border: `1px solid ${record.status === "success" ? "#bbf7d0" : "#fecaca"}`,
                      }}
                    >
                      {record.status}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: "#78716c",
                      marginTop: 4,
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
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontWeight: 600,
                          }}
                        >
                          {record.commitHash.slice(0, 7)}
                          <ExternalLink size={10} />
                        </a>
                      </>
                    )}
                  </div>

                  {record.error && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "6px 10px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: 6,
                        fontSize: 12,
                        color: "#dc2626",
                        fontFamily: "monospace",
                      }}
                    >
                      {record.error}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 12, color: "#78716c", flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#191411" }}>{record.filesCount} files</div>
                  <div>{formatRelativeTime(record.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
