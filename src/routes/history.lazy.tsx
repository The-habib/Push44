import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { UploadCloud, Trash2, ExternalLink, Search } from "lucide-react";
import { getHistory, clearHistory, formatRelativeTime, type PushRecord, type Platform } from "@/lib/storage";

export const Route = createLazyFileRoute("/history")({ component: HistoryPage });

const PLATFORM_COLORS: Record<string, string> = {
  base44: "#f97316", rocket: "#8b5cf6", floot: "#6366f1", zite: "#0ea5e9",
};
const PLATFORM_LABELS: Record<string, string> = {
  base44: "Base44", rocket: "Rocket.new", floot: "Floot", zite: "Zite",
};

export default function HistoryPage() {
  const [records, setRecords] = useState<PushRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { setRecords(getHistory()); }, []);

  const filtered = useMemo(() => records.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.appName.toLowerCase().includes(q) || r.repo.toLowerCase().includes(q) || r.branch.toLowerCase().includes(q);
    }
    return true;
  }), [records, search, statusFilter]);

  const handleClear = () => {
    clearHistory();
    setRecords([]);
    setConfirming(false);
  };

  return (
    <div className="page-wide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Push History</h1>
        {records.length > 0 && (
          confirming
            ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Clear all records?</span>
                <button className="btn btn-danger btn-sm" onClick={handleClear}>Yes, clear</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            : <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)} style={{ color: "#ef4444" }}>
                <Trash2 size={13} />Clear history
              </button>
        )}
      </div>

      {/* Filters */}
      {records.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input className="input" placeholder="Search pushes…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <div className="tabs" style={{ width: "auto" }}>
            {(["all", "success", "failed"] as const).map((s) => (
              <button key={s} className={`tab${statusFilter === s ? " active" : ""}`} onClick={() => setStatusFilter(s)} style={{ minWidth: 60 }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <UploadCloud size={32} color="#cbd5e1" style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
            {records.length === 0 ? "No push history" : "No results found"}
          </div>
          {records.length === 0 && (
            <Link to="/push" className="btn btn-primary" style={{ marginTop: 8, display: "inline-flex" }}>Push an App →</Link>
          )}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {filtered.map((record, i) => (
            <div key={record.id} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              {/* Status dot */}
              <span style={{
                display: "inline-block", width: 7, height: 7, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                background: record.status === "success" ? "#22c55e" : "#ef4444",
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{record.appName}</span>
                  {record.platform && (
                    <span style={{ padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${PLATFORM_COLORS[record.platform]}15`, color: PLATFORM_COLORS[record.platform] }}>
                      {PLATFORM_LABELS[record.platform] ?? record.platform}
                    </span>
                  )}
                  <span style={{ padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: record.status === "success" ? "#f0fdf4" : "#fef2f2", color: record.status === "success" ? "#15803d" : "#b91c1c" }}>
                    {record.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace" }}>{record.repo}</span>
                  <span style={{ color: "#cbd5e1" }}>·</span>
                  <span>{record.branch}</span>
                  {record.commitHash && (
                    <>
                      <span style={{ color: "#cbd5e1" }}>·</span>
                      <a href={`https://github.com/${record.repo}/commit/${record.commitHash}`} target="_blank" rel="noopener" style={{ fontFamily: "monospace", color: "#f97316", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        {record.commitHash}<ExternalLink size={10} />
                      </a>
                    </>
                  )}
                </div>
                {record.error && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 3 }}>{record.error}</div>
                )}
              </div>

              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>
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
