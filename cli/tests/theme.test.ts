import { describe, expect, it } from "bun:test";
import { THEMES, setActiveTheme, getActiveTheme } from "../src/ui/theme-engine.js";

describe("Theme Engine", () => {
  it("provides 6 unique color schemes", () => {
    expect(Object.keys(THEMES).length).toBe(6);
    expect(THEMES.anthropic).toBeDefined();
    expect(THEMES.monokai).toBeDefined();
    expect(THEMES.dracula).toBeDefined();
    expect(THEMES.nord).toBeDefined();
    expect(THEMES.cyberpunk).toBeDefined();
    expect(THEMES.minimal).toBeDefined();
  });

  it("switches active themes cleanly", () => {
    setActiveTheme("dracula");
    expect(getActiveTheme().name).toBe("dracula");
    setActiveTheme("anthropic");
    expect(getActiveTheme().name).toBe("anthropic");
  });
});
