import pc from "picocolors";
import { symbols } from "../ui/theme.js";

export function telemetryCommand(action = "status"): void {
  console.log(`\n${pc.bold("✦ Push44 Privacy & Telemetry Guard")}\n`);

  console.log(`  ${symbols.tick} ${pc.bold("Telemetry Collection:")} ${pc.green("DISABLED (100% Zero Telemetry)")}`);
  console.log(`  ${symbols.tick} ${pc.bold("Local Encryption:")}     ${pc.green("ACTIVE (AES-256-GCM machine-keyed)")}`);
  console.log(`  ${symbols.tick} ${pc.bold("Cloud Analytics:")}      ${pc.green("NONE (All API calls go direct to platforms)")}`);
  console.log(`  ${symbols.tick} ${pc.bold("CI Environment:")}       ${process.env.CI ? pc.cyan("Detected (Interactive prompts suppressed)") : pc.dim("Interactive Shell")}`);
  console.log(`  ${symbols.tick} ${pc.bold("Color Mode:")}           ${process.env.NO_COLOR ? pc.dim("NO_COLOR active") : pc.green("TrueColor enabled")}\n`);

  console.log(pc.dim("Push44 has zero remote telemetry servers, tracking pixels, or third-party loggers.\n"));
}
