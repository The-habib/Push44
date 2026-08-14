import { describe, expect, it } from "bun:test";
import { computeLineDiff, renderInlineDiff } from "../src/ui/code-diff.js";

describe("Line & Code Diff Visualizer", () => {
  it("computes line additions and removals", () => {
    const oldCode = "line 1\nline 2\nline 3";
    const newCode = "line 1\nline 2 edited\nline 3\nline 4";

    const diffs = computeLineDiff(oldCode, newCode);
    expect(diffs.some((d) => d.type === "added")).toBe(true);
    expect(diffs.some((d) => d.type === "removed")).toBe(true);
  });

  it("renders inline diff output cleanly", () => {
    const diff = renderInlineDiff("app.ts", "const x = 1;", "const x = 2;");
    expect(diff).toContain("--- a/app.ts");
    expect(diff).toContain("+++ b/app.ts");
    expect(diff).toContain("const x = 2;");
  });
});
