import { Search } from "lucide-react";
import { useState, useMemo } from "react";

export interface PlatformOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  connected: boolean;
  tag?: string;
}

interface PlatformPickerProps {
  platforms: PlatformOption[];
  selected: string;
  onSelect: (id: string) => void;
  /** Show search bar. Defaults to auto (true when ≥8 platforms) */
  searchable?: boolean;
}

export function PlatformPicker({ platforms, selected, onSelect, searchable }: PlatformPickerProps) {
  const [query, setQuery] = useState("");

  const showSearch = searchable ?? platforms.length >= 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return platforms;
    return platforms.filter(p => p.label.toLowerCase().includes(q));
  }, [platforms, query]);

  const connectedFirst = useMemo(
    () => [...filtered].sort((a, b) => Number(b.connected) - Number(a.connected)),
    [filtered],
  );

  return (
    <div style={{ marginBottom: 14 }}>
      {showSearch && (
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search
            size={13}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
          />
          <input
            className="input"
            placeholder="Filter platforms…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 13, height: 36 }}
          />
        </div>
      )}

      {/* Modern Compact SaaS Platform Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
          gap: 6,
        }}
      >
        {connectedFirst.map(p => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1.5px solid ${active ? "#f97316" : p.connected ? "#e2e8f0" : "#f1f5f9"}`,
                background: active
                  ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                  : p.connected
                    ? "#ffffff"
                    : "#fafafa",
                cursor: "pointer",
                transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: active
                  ? "0 0 0 3px rgba(249,115,22,0.12), 0 2px 6px rgba(249,115,22,0.08)"
                  : "0 1px 2px rgba(0,0,0,0.03)",
                position: "relative",
                textAlign: "left",
                minHeight: 42,
              }}
              onMouseEnter={e => {
                if (!active) {
                  const target = e.currentTarget as HTMLElement;
                  target.style.borderColor = p.connected ? "#cbd5e1" : "#e2e8f0";
                  target.style.background = "#ffffff";
                  target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
                  target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const target = e.currentTarget as HTMLElement;
                  target.style.borderColor = p.connected ? "#e2e8f0" : "#f1f5f9";
                  target.style.background = p.connected ? "#ffffff" : "#fafafa";
                  target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                  target.style.transform = "translateY(0)";
                }
              }}
            >
              {/* Logo Icon */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: active ? 700 : 600,
                    color: active ? "#c2410c" : "#0f172a",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}
                >
                  {p.label}
                </div>
              </div>

              {/* Status Indicator Dot */}
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                {p.connected ? (
                  <span
                    title="Connected"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
                      display: "inline-block",
                    }}
                  />
                ) : (
                  <span
                    title="Not connected"
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#cbd5e1",
                      display: "inline-block",
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}

        {connectedFirst.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "20px 0",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            No platforms match "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
