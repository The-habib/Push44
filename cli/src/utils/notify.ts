import { execFile } from "node:child_process";
import * as os from "node:os";

/**
 * Trigger an audible terminal bell / beep.
 */
export function ringTerminalBell(): void {
  if (!process.env.CI && process.stdout.isTTY) {
    process.stdout.write("\x07");
  }
}

/**
 * Display an OS-level notification on completion of long tasks if supported.
 */
export function sendDesktopNotification(title: string, message: string): void {
  if (process.env.CI) return;

  const platform = os.platform();

  if (platform === "darwin") {
    // macOS AppleScript notification
    execFile("osascript", ["-e", `display notification "${message}" with title "${title}"`], () => {});
  } else if (platform === "linux") {
    // Linux notify-send
    execFile("notify-send", [title, message], () => {});
  }
}
