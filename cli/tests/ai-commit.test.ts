import { describe, expect, it } from "bun:test";
import { generateSemanticCommitMessage } from "../src/utils/ai-commit.js";
import type { FileDiffItem } from "../src/types.js";

describe("AI Semantic Commit Generator", () => {
  it("generates feat(ui) commit message when UI components change", () => {
    const diffs: FileDiffItem[] = [
      { path: "src/components/Header.tsx", status: "modified" },
      { path: "src/styles.css", status: "modified" },
    ];
    const msg = generateSemanticCommitMessage(diffs, "base44", "My App");
    expect(msg).toContain("feat(ui)");
  });

  it("generates feat(auth) commit message when auth files change", () => {
    const diffs: FileDiffItem[] = [
      { path: "src/lib/auth-service.ts", status: "modified" },
    ];
    const msg = generateSemanticCommitMessage(diffs, "floot", "Store");
    expect(msg).toContain("feat(auth)");
  });

  it("generates chore(config) when only configuration files change", () => {
    const diffs: FileDiffItem[] = [
      { path: "package.json", status: "modified" },
      { path: "tsconfig.json", status: "modified" },
    ];
    const msg = generateSemanticCommitMessage(diffs, "zite", "Blog");
    expect(msg).toContain("chore(config)");
  });
});
