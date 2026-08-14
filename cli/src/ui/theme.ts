import pc from "picocolors";

export const symbols = {
  tick: pc.green("✓"),
  cross: pc.red("✖"),
  info: pc.cyan("ℹ"),
  warning: pc.yellow("▲"),
  star: pc.yellow("★"),
  bullet: pc.dim("•"),
  pointer: pc.cyan("›"),
  arrow: pc.dim("→"),
  diamond: pc.magenta("◆"),
  square: pc.blue("■"),
  sparkles: pc.yellow("✨"),
  lock: pc.yellow("🔒"),
  package: pc.cyan("📦"),
  git: pc.magenta("🌿"),
  pulse: pc.green("●"),
  offline: pc.dim("○"),
};

export const colors = {
  brand: (text: string) => pc.bold(pc.cyan(text)),
  brandSecondary: (text: string) => pc.bold(pc.magenta(text)),
  platform: (name: string) => {
    switch (name.toLowerCase()) {
      case "base44":
        return pc.bold(pc.cyan("Base44"));
      case "rocket":
        return pc.bold(pc.red("Rocket.new"));
      case "floot":
        return pc.bold(pc.blue("Floot"));
      case "zite":
        return pc.bold(pc.magenta("Zite"));
      case "bolt":
        return pc.bold(pc.yellow("Bolt.new"));
      case "lovable":
        return pc.bold(pc.green("Lovable"));
      case "github":
        return pc.bold(pc.white("GitHub"));
      default:
        return pc.bold(name);
    }
  },
  accent: pc.cyan,
  muted: pc.dim,
  highlight: pc.bold,
  success: pc.green,
  warning: pc.yellow,
  error: pc.red,
};

export const APP_BANNER = `
  ${pc.bold(pc.cyan("Push44"))} ${pc.dim("v1.0.0")} ${pc.dim("— Universal CLI for AI Vibe-Coding Platforms")}
`;
