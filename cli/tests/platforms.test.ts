import { describe, expect, it } from "bun:test";
import { getPlatformAdapter, getAllAdapters } from "../src/platforms/index.js";

describe("Universal Platform Layer", () => {
  it("resolves all supported platform adapters", () => {
    const platforms = ["base44", "rocket", "floot", "zite", "bolt", "lovable"];
    for (const p of platforms) {
      const adapter = getPlatformAdapter(p);
      expect(adapter).toBeDefined();
      expect(adapter.platform).toBe(p as any);
      expect(adapter.displayName).toBeDefined();
      expect(typeof adapter.listApps).toBe("function");
      expect(typeof adapter.exportProject).toBe("function");
    }
  });

  it("handles platform name aliases gracefully", () => {
    expect(getPlatformAdapter("rocket.new").platform).toBe("rocket");
    expect(getPlatformAdapter("bolt.new").platform).toBe("bolt");
    expect(getPlatformAdapter("lovable.dev").platform).toBe("lovable");
    expect(getPlatformAdapter("fillout").platform).toBe("zite");
  });

  it("throws Push44Error on unknown platform", () => {
    expect(() => getPlatformAdapter("unknown-platform")).toThrow();
  });
});
