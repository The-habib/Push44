import boxen, { type Options as BoxenOptions } from "boxen";
import pc from "picocolors";

export function renderBox(content: string, title?: string, options: BoxenOptions = {}): string {
  return boxen(content, {
    padding: 1,
    margin: 0,
    borderStyle: "round",
    borderColor: "cyan",
    title: title ? pc.bold(pc.cyan(` ${title} `)) : undefined,
    titleAlignment: "left",
    ...options,
  });
}
