import pc from "picocolors";

// Anthropic / Push44 Coral & Terracotta Gradient
const CORAL_START = [249, 115, 22];  // #F97316 (Orange/Coral)
const CORAL_END   = [217, 119, 87];  // #D97757 (Anthropic Terracotta)
const CYAN_ACCENT = [6, 182, 212];   // #06B6D4 (Cyan)

function rgb(r: number, g: number, b: number, text: string): string {
  return `\x1b[38;2;${Math.round(r)};${Math.round(g)};${Math.round(b)}m${text}\x1b[0m`;
}

export function applyGradient(text: string, startRgb = CORAL_START, endRgb = CORAL_END): string {
  const chars = Array.from(text);
  if (chars.length === 0) return text;
  if (chars.length === 1) return rgb(startRgb[0], startRgb[1], startRgb[2], text);

  return chars
    .map((char, i) => {
      const t = i / (chars.length - 1);
      const r = startRgb[0] + (endRgb[0] - startRgb[0]) * t;
      const g = startRgb[1] + (endRgb[1] - startRgb[1]) * t;
      const b = startRgb[2] + (endRgb[2] - startRgb[2]) * t;
      return rgb(r, g, b, char);
    })
    .join("");
}

export const HERO_LOGO = `
 ██████╗ ██╗   ██╗███████╗██╗  ██╗██╗  ██╗██╗  ██╗
 ██╔══██╗██║   ██║██╔════╝██║  ██║██║  ██║██║  ██║
 ██████╔╝██║   ██║███████╗███████║███████║███████║
 ██╔═══╝ ██║   ██║╚════██║██╔══██║╚════██║╚════██║
 ██║     ╚██████╔╝███████║██║  ██║     ██║     ██║
 ╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═╝     ╚═╝     ╚═╝
`;
