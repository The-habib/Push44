import { describe, expect, it } from "bun:test";
import { fuzzySearch } from "../src/ui/fuzzy.js";

describe("Fuzzy Search & Substring Highlighter", () => {
  it("matches and scores direct substrings", () => {
    const apps = [
      { id: "1", name: "Flutter Ecommerce App" },
      { id: "2", name: "React Chat Dashboard" },
      { id: "3", name: "NextJS Blog" },
    ];

    const results = fuzzySearch(apps, "chat", (a) => a.name);
    expect(results.length).toBe(1);
    expect(results[0].item.name).toBe("React Chat Dashboard");
    expect(results[0].highlightedText).toContain("Chat");
  });

  it("returns all items when query is empty", () => {
    const items = ["app1", "app2", "app3"];
    const results = fuzzySearch(items, "", (i) => i);
    expect(results.length).toBe(3);
  });
});
