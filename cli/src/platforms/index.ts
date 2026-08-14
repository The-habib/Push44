import type { UniversalPlatformAdapter } from "./types.js";
import type { SupportedPlatform } from "../types.js";
import { Base44Adapter } from "./base44.js";
import { RocketAdapter } from "./rocket.js";
import { FlootAdapter } from "./floot.js";
import { ZiteAdapter } from "./zite.js";
import { BoltAdapter } from "./bolt.js";
import { LovableAdapter } from "./lovable.js";
import { Push44Error } from "../utils/errors.js";

const adapters: Record<SupportedPlatform, UniversalPlatformAdapter> = {
  base44: new Base44Adapter(),
  rocket: new RocketAdapter(),
  floot: new FlootAdapter(),
  zite: new ZiteAdapter(),
  bolt: new BoltAdapter(),
  lovable: new LovableAdapter(),
};

export function getPlatformAdapter(platform: string): UniversalPlatformAdapter {
  const normalized = platform.toLowerCase().replace(/[.\-_ ]/g, "") as SupportedPlatform;

  // Aliases
  if (normalized === "rocketnew" || normalized === "rocket") return adapters.rocket;
  if (normalized === "boltnew" || normalized === "bolt") return adapters.bolt;
  if (normalized === "lovabledev" || normalized === "lovable") return adapters.lovable;
  if (normalized === "fillout" || normalized === "zite") return adapters.zite;
  if (normalized === "base44") return adapters.base44;
  if (normalized === "floot") return adapters.floot;

  const adapter = adapters[normalized as SupportedPlatform];
  if (!adapter) {
    throw new Push44Error({
      message: `Unsupported platform "${platform}".`,
      suggestion: `Available platforms: ${Object.keys(adapters).join(", ")}`,
    });
  }

  return adapter;
}

export function getAllAdapters(): UniversalPlatformAdapter[] {
  return Object.values(adapters);
}

export * from "./types.js";
export * from "./base44.js";
export * from "./rocket.js";
export * from "./floot.js";
export * from "./zite.js";
export * from "./bolt.js";
export * from "./lovable.js";
