/**
 * FileDiffViewer — beautiful inline unified diff for a single file.
 * Shows line additions (green), deletions (red), and optional context lines.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";

type DiffLine = { type: "+" | "-" | "="; text: string };

/** Simple LCS-based diff. Caps at MAX_LINES to stay fast. */
function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const MAX = 300;
  const old = oldLines.slice(0, MAX);
  const nw  = newLines.slice(0, MAX);
  const m = old.length, n = nw.length;

  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = old[i - 1] === nw[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && old[i - 1] === nw[j - 1]) {
      out.unshift({ type: "=", text: old[i - 1] }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      out.unshift({ type: "+", text: nw[j - 1] }); j--;
    } else {
      out.unshift({ type: "-", text: old[i - 1] }); i--;
    }
  }

  if (oldLines.length > MAX || newLines.length > MAX) {
    out.push({ type: "=", text: `… (truncated — file has ${Math.max(oldLines.length, newLines.length)} lines)` });
  }
  return out;
}

interface FileDiffViewerProps {
  filename: string;
  oldContent: string | null;   // null = new file
  newContent: string | null;   // null = deleted file
}

export function FileDiffViewer({ filename, oldContent, newContent }: FileDiffViewerProps) {
  const [hideContext, setHideContext] = useState(false);
  const [collapsed, setCollapsed]    = useState(false);

  const lines = useMemo((): DiffLine[] => {
    if (oldContent === null && newContent !== null) {
      return newContent.split("\n").map(t => ({ type: "+", text: t }));
    }
    if (newContent === null && oldContent !== null) {
      return oldContent.split("\n").map(t => ({ type: "-", text: t }));
    }
    if (!oldContent && !newContent) return [];
    return computeDiff(
      (oldContent ?? "").split("\n"),
      (newContent ?? "").split("\n"),
    );
  }, [oldContent, newContent]);

  const addCount = lines.filter(l => l.type === "+").length;
  const delCount = lines.filter(l => l.type === "-").length;
  const visible  = hideContext ? lines.filter(l => l.type !== "=") : lines;

  // Add context line numbers
  const numbered = useMemo(() => {
    let oldN = 1, newN = 1;
    return lines.map(l => {
      const oN = l.type !== "+" ? oldN : null;
      const nN = l.type !== "-" ? newN : null;
      if (l.type !== "+") oldN++;
      if (l.type !== "-") newN++;
      return { ...l, oN, nN };
    });
  }, [lines]);

  const visibleNumbered = hideContext ? numbered.filter(l => l.type !== "=") : numbered;

  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ borderColor: "#f0ece4", background: "#fdfcfb" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer select-none"
        style={{ background: "#faf7f3", borderColor: "#f0ece4" }}
        onClick={() => setCollapsed(c => !c)}
      >
        <span className="text-[11px] font-mono font-bold text-[#6b6360] flex-1 truncate min-w-0">
          {filename}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {addCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#22c55e]">
              <Plus className="h-2.5 w-2.5" />{addCount}
            </span>
          )}
          {delCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#ef4444]">
              <Minus className="h-2.5 w-2.5" />{delCount}
            </span>
          )}
          {/* Toggle context */}
          {!collapsed && (
            <button
              onClick={e => { e.stopPropagation(); setHideContext(h => !h); }}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1"
              style={{
                background: hideContext ? "#fff4ed" : "#faf7f3",
                borderColor: hideContext ? "#f97316" : "#e8e3db",
                color: hideContext ? "#f97316" : "#9a8880",
              }}
            >
              {hideContext ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
              {hideContext ? "Show all" : "Changes"}
            </button>
          )}
          {collapsed
            ? <ChevronDown className="h-3.5 w-3.5 text-[#c8b8a2]" />
            : <ChevronUp className="h-3.5 w-3.5 text-[#c8b8a2]" />}
        </div>
      </div>

      {/* Diff body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div
              className="overflow-x-auto overflow-y-auto font-mono text-[11px] leading-[1.65]"
              style={{ maxHeight: 220 }}
            >
              {visibleNumbered.length === 0 && (
                <div className="px-4 py-3 text-[11px] text-[#c8b8a2] italic">No changes</div>
              )}
              {visibleNumbered.map((line, i) => {
                const isAdd = line.type === "+";
                const isDel = line.type === "-";
                return (
                  <div
                    key={i}
                    className="flex items-start min-w-full"
                    style={{
                      background: isAdd ? "rgba(34,197,94,0.07)" : isDel ? "rgba(239,68,68,0.07)" : "transparent",
                    }}
                  >
                    {/* Old line number */}
                    <span
                      className="shrink-0 w-8 text-right pr-2 text-[10px] select-none border-r"
                      style={{
                        color: isDel ? "#ef4444" : "#d4ccc4",
                        borderColor: isDel ? "rgba(239,68,68,0.15)" : "#f0ece4",
                        lineHeight: "inherit",
                        paddingTop: "0px",
                        paddingBottom: "0px",
                      }}
                    >
                      {line.oN ?? ""}
                    </span>
                    {/* New line number */}
                    <span
                      className="shrink-0 w-8 text-right pr-2 text-[10px] select-none border-r mr-2"
                      style={{
                        color: isAdd ? "#22c55e" : "#d4ccc4",
                        borderColor: isAdd ? "rgba(34,197,94,0.15)" : "#f0ece4",
                        lineHeight: "inherit",
                      }}
                    >
                      {line.nN ?? ""}
                    </span>
                    {/* Gutter sign */}
                    <span
                      className="shrink-0 w-3.5 font-bold"
                      style={{ color: isAdd ? "#22c55e" : isDel ? "#ef4444" : "#d4ccc4" }}
                    >
                      {isAdd ? "+" : isDel ? "−" : " "}
                    </span>
                    {/* Content */}
                    <span
                      className="flex-1 pl-1 pr-4 whitespace-pre break-all"
                      style={{ color: isAdd ? "#166534" : isDel ? "#991b1b" : "#4b4642" }}
                    >
                      {line.text || " "}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
