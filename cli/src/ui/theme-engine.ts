import pc from "picocolors";

export type ThemeName = "anthropic" | "monokai" | "dracula" | "nord" | "cyberpunk" | "minimal";

export interface ColorScheme {
  name: ThemeName;
  displayName: string;
  primary: (text: string) => string;
  secondary: (text: string) => string;
  accent: (text: string) => string;
  success: (text: string) => string;
  warning: (text: string) => string;
  error: (text: string) => string;
}

export const THEMES: Record<ThemeName, ColorScheme> = {
  anthropic: {
    name: "anthropic",
    displayName: "Anthropic Terracotta & Coral",
    primary: (t) => pc.bold(pc.yellow(t)),
    secondary: (t) => pc.cyan(t),
    accent: (t) => pc.magenta(t),
    success: (t) => pc.green(t),
    warning: (t) => pc.yellow(t),
    error: (t) => pc.red(t),
  },
  monokai: {
    name: "monokai",
    displayName: "Monokai Vivid",
    primary: (t) => pc.bold(pc.green(t)),
    secondary: (t) => pc.magenta(t),
    accent: (t) => pc.yellow(t),
    success: (t) => pc.green(t),
    warning: (t) => pc.yellow(t),
    error: (t) => pc.red(t),
  },
  dracula: {
    name: "dracula",
    displayName: "Dracula Purple",
    primary: (t) => pc.bold(pc.magenta(t)),
    secondary: (t) => pc.cyan(t),
    accent: (t) => pc.green(t),
    success: (t) => pc.green(t),
    warning: (t) => pc.yellow(t),
    error: (t) => pc.red(t),
  },
  nord: {
    name: "nord",
    displayName: "Nord Arctic Blue",
    primary: (t) => pc.bold(pc.blue(t)),
    secondary: (t) => pc.cyan(t),
    accent: (t) => pc.white(t),
    success: (t) => pc.cyan(t),
    warning: (t) => pc.yellow(t),
    error: (t) => pc.red(t),
  },
  cyberpunk: {
    name: "cyberpunk",
    displayName: "Cyberpunk Neon",
    primary: (t) => pc.bold(pc.yellow(t)),
    secondary: (t) => pc.cyan(t),
    accent: (t) => pc.magenta(t),
    success: (t) => pc.green(t),
    warning: (t) => pc.yellow(t),
    error: (t) => pc.red(t),
  },
  minimal: {
    name: "minimal",
    displayName: "Monochrome Minimal",
    primary: (t) => pc.bold(pc.white(t)),
    secondary: (t) => pc.dim(t),
    accent: (t) => pc.white(t),
    success: (t) => pc.bold(t),
    warning: (t) => pc.underline(t),
    error: (t) => pc.bold(t),
  },
};

let activeThemeName: ThemeName = "anthropic";

export function setActiveTheme(name: ThemeName): void {
  if (THEMES[name]) activeThemeName = name;
}

export function getActiveTheme(): ColorScheme {
  return THEMES[activeThemeName] || THEMES.anthropic;
}
