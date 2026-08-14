import * as readline from "node:readline";
import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { findProjectConfig } from "../storage/project-config.js";
import { renderClaudeBanner } from "../ui/banner.js";
import { appsCommand } from "./apps.js";
import { diffCommand } from "./diff.js";
import { syncCommand } from "./sync.js";
import { pullCommand } from "./pull.js";
import { inspectCommand } from "./inspect.js";
import { doctorCommand } from "./doctor.js";
import { backupCommand } from "./backup.js";
import { authStatusCommand } from "./auth.js";
import { cloneCommand } from "./clone.js";
import { formatErrorOutput } from "../utils/errors.js";

export async function interactiveShellCommand(): Promise<void> {
  const creds = await getCredentials();
  const found = await findProjectConfig();
  const project = found ? found.config : null;

  console.clear();
  console.log(renderClaudeBanner(creds, project));
  console.log(pc.dim("  Type a command (e.g. `apps`, `diff`, `sync`, `doctor`, `inspect`) or `/help`. Press Ctrl+C to exit.\n"));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: pc.yellow("push44 › "),
  });

  rl.prompt();

  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line) {
      rl.prompt();
      continue;
    }

    const [cmd, ...args] = line.split(/\s+/);
    const cleanCmd = cmd.replace(/^\//, "").toLowerCase();

    try {
      switch (cleanCmd) {
        case "exit":
        case "quit":
        case "q":
          console.log(pc.dim("\nGoodbye!\n"));
          process.exit(0);

        case "help":
        case "?":
          console.log(`\n${pc.bold("✦ Interactive Shell Commands:")}`);
          console.log(`  ${pc.cyan("apps")}             ${pc.dim("List & search projects across platforms")}`);
          console.log(`  ${pc.cyan("clone <id>")}       ${pc.dim("Clone an AI project into local directory")}`);
          console.log(`  ${pc.cyan("diff")}             ${pc.dim("View local visual file modifications")}`);
          console.log(`  ${pc.cyan("sync")}             ${pc.dim("Auto-commit & push changes to GitHub")}`);
          console.log(`  ${pc.cyan("pull")}             ${pc.dim("Pull latest remote changes from platform")}`);
          console.log(`  ${pc.cyan("inspect")}          ${pc.dim("Analyze tech stack, dependencies & file tree")}`);
          console.log(`  ${pc.cyan("doctor")}           ${pc.dim("Run complete system & health audit")}`);
          console.log(`  ${pc.cyan("auth")}             ${pc.dim("Inspect connected platform accounts")}`);
          console.log(`  ${pc.cyan("backup")}           ${pc.dim("Export all projects to timestamped ZIPs")}`);
          console.log(`  ${pc.cyan("clear")}            ${pc.dim("Clear terminal screen")}`);
          console.log(`  ${pc.cyan("exit")}             ${pc.dim("Exit interactive session")}\n`);
          break;

        case "clear":
        case "cls":
          console.clear();
          console.log(renderClaudeBanner(creds, project));
          break;

        case "apps":
        case "list":
          await appsCommand(args[0], { interactive: true });
          break;

        case "diff":
          await diffCommand({ live: args.includes("--live") });
          break;

        case "sync":
          await syncCommand({ yes: args.includes("-y") || args.includes("--yes") });
          break;

        case "pull":
          await pullCommand();
          break;

        case "clone":
          if (!args[0]) {
            console.log(pc.yellow("Usage: clone <app-id> [--platform <name>]"));
          } else {
            await cloneCommand(args[0]);
          }
          break;

        case "inspect":
          await inspectCommand();
          break;

        case "doctor":
          await doctorCommand();
          break;

        case "auth":
        case "whoami":
          await authStatusCommand();
          break;

        case "backup":
          await backupCommand();
          break;

        default:
          console.log(pc.red(`Unknown command "${line}". Type \`/help\` for available commands.`));
          break;
      }
    } catch (err: any) {
      console.error(formatErrorOutput(err, false));
    }

    console.log();
    rl.prompt();
  }
}
