import pc from "picocolors";
import { THEMES, setActiveTheme, type ThemeName } from "../ui/theme-engine.js";
import { createTable } from "../ui/table.js";
import { logger } from "../ui/logger.js";
import { Push44Error } from "../utils/errors.js";

export function themeCommand(themeName?: string): void {
  if (!themeName || themeName === "list") {
    console.log(`\n${pc.bold("✦ Push44 Terminal Themes")}\n`);
    const table = createTable({ head: ["Theme Key", "Description", "Preview"] });
    for (const [key, theme] of Object.entries(THEMES)) {
      table.push([
        pc.bold(pc.cyan(key)),
        theme.displayName,
        `${theme.primary("●")} ${theme.secondary("●")} ${theme.accent("●")} ${theme.success("●")}`,
      ]);
    }
    console.log(table.toString());
    console.log(pc.dim("\nSwitch theme with: `push44 theme <name>`\n"));
    return;
  }

  const clean = themeName.toLowerCase() as ThemeName;
  if (!THEMES[clean]) {
    throw new Push44Error(`Unknown theme "${themeName}". Available: ${Object.keys(THEMES).join(", ")}`);
  }

  setActiveTheme(clean);
  const t = THEMES[clean];
  logger.success(`Activated theme: ${t.primary(t.displayName)}`);
}
