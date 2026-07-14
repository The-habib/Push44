import { Search, CheckCircle2, Plug } from "lucide-react";
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
    <div>
      {showSearch && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search
            size={13}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#939084", pointerEvents: "none" }}
          />
          <input
            className="input"
            placeholder="Search platforms…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 13 }}
          />
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
        gap: 8,
      }}>
        {connectedFirst.map(p => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 8, padding: "14px 10px 12px",
                borderRadius: 10,
                border: `2px solid ${active ? "#f97316" : "#e6e1da"}`,
                background: active ? "#fff3e8" : "#fff",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.12s",
                boxShadow: active
                  ? "0 0 0 3px rgba(249,115,22,0.12), 0 2px 8px rgba(32,21,21,0.06)"
                  : "0 1px 3px rgba(32,21,21,0.04)",
                position: "relative",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.borderColor = "#c5c0b1";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(32,21,21,0.08)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e6e1da";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(32,21,21,0.04)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }
              }}
            >
              {/* Connected check mark */}
              {p.connected && (
                <div style={{
                  position: "absolute", top: 7, right: 7,
                  color: "#16a34a",
                }}>
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                </div>
              )}

              {/* Tag (e.g. "New", "Beta") */}
              {p.tag && (
                <div style={{
                  position: "absolute", top: 6, left: 6,
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
                  padding: "1px 5px", borderRadius: 4,
                  background: "#f5f0eb", color: "#939084",
                  textTransform: "uppercase",
                }}>
                  {p.tag}
                </div>
              )}

              {/* Logo */}
              <div style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {p.icon}
              </div>

              {/* Name */}
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: active ? "#c2410c" : "#2f2a26",
                letterSpacing: "-0.01em",
                textAlign: "center", lineHeight: 1.2,
                wordBreak: "break-word",
              }}>
                {p.label}
              </span>

              {/* Status */}
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 500,
                color: p.connected ? "#16a34a" : "#939084",
              }}>
                {p.connected
                  ? <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, display: "inline-block" }} />Connected</>
                  : <><Plug size={10} />Set up</>
                }
              </div>
            </button>
          );
        })}

        {connectedFirst.length === 0 && (
          <div style={{
            gridColumn: "1 / -1", padding: "28px 0",
            textAlign: "center", color: "#939084", fontSize: 13,
          }}>
            No platforms match "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
