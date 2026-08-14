import pc from "picocolors";

export interface Push44ErrorDetails {
  code?: string;
  message: string;
  reason?: string;
  suggestion?: string;
  originalError?: any;
}

export class Push44Error extends Error {
  public code?: string;
  public reason?: string;
  public suggestion?: string;
  public originalError?: any;

  constructor(details: Push44ErrorDetails | string) {
    if (typeof details === "string") {
      super(details);
      this.message = details;
    } else {
      super(details.message);
      this.code = details.code;
      this.reason = details.reason;
      this.suggestion = details.suggestion;
      this.originalError = details.originalError;
    }
    this.name = "Push44Error";
  }
}

export function formatErrorOutput(err: any, debug = false): string {
  const isCustom = err instanceof Push44Error;
  const message = err?.message || String(err);
  const code = isCustom ? err.code : err?.code;
  const reason = isCustom ? err.reason : undefined;
  const suggestion = isCustom ? err.suggestion : undefined;

  const lines: string[] = [];
  lines.push(pc.red(`\n✖ Error: ${message}`));

  if (code) {
    lines.push(pc.dim(`  Code: ${code}`));
  }

  if (reason) {
    lines.push(pc.yellow(`  Cause: ${reason}`));
  }

  if (suggestion) {
    lines.push(pc.cyan(`  Fix: ${suggestion}`));
  }

  if (debug && err?.stack) {
    lines.push(pc.dim(`\n--- Stack Trace ---\n${err.stack}\n-------------------`));
  }

  return lines.join("\n");
}
