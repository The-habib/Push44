import { Command } from "commander";
import pc from "picocolors";
import { APP_BANNER } from "./ui/theme.js";
import { formatErrorOutput } from "./utils/errors.js";

// Commands
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { authStatusCommand } from "./commands/auth.js";
import { appsCommand } from "./commands/apps.js";
import { cloneCommand } from "./commands/clone.js";
import { pullCommand } from "./commands/pull.js";
import { exportCommand } from "./commands/export.js";
import { diffCommand } from "./commands/diff.js";
import { syncCommand } from "./commands/sync.js";
import { pushCommand } from "./commands/push.js";
import { githubCommand } from "./commands/github.js";
import { doctorCommand } from "./commands/doctor.js";
import { backupCommand } from "./commands/backup.js";
import { watchCommand } from "./commands/watch.js";
import { releaseCommand } from "./commands/release.js";
import { apkCommand } from "./commands/apk.js";
import { badgeCommand } from "./commands/badge.js";
import { deployCommand } from "./commands/deploy.js";
import { inspectCommand } from "./commands/inspect.js";
import { configCommand } from "./commands/config.js";
import { completionCommand } from "./commands/completion.js";
import { statsCommand } from "./commands/stats.js";
import { compareCommand } from "./commands/compare.js";
import { migrateCommand } from "./commands/migrate.js";
import { interactiveShellCommand } from "./commands/shell.js";
import { vibeMenuCommand, showVibeCoderGuide } from "./commands/vibe.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("push44")
    .description("Push44 CLI — Universal Command-Line Interface for AI Vibe-Coding Platforms")
    .version("1.0.0")
    .addHelpText("beforeAll", APP_BANNER)
    .option("-d, --debug", "Enable verbose debug logs and stack traces")
    .action(async () => {
      try {
        if (process.stdin.isTTY) {
          await vibeMenuCommand();
        } else {
          await interactiveShellCommand();
        }
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // Vibe Coder Guided Hub
  program
    .command("vibe")
    .alias("menu")
    .alias("quick")
    .description("Open the Vibe Coder Interactive Guided Menu")
    .action(async () => {
      try {
        await vibeMenuCommand();
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // Guide
  program
    .command("guide")
    .alias("cheatsheet")
    .description("Show the friendly Vibe Coder Cheatsheet & Guide")
    .action(() => {
      showVibeCoderGuide();
    });

  // Interactive REPL Shell
  program
    .command("shell")
    .alias("interactive")
    .description("Launch Claude Code style interactive terminal REPL")
    .action(async () => {
      try {
        await interactiveShellCommand();
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 1. Login
  program
    .command("login [platform]")
    .description("Authenticate with an AI platform (base44, rocket, floot, zite, bolt, lovable) or GitHub")
    .option("-t, --token <token>", "API token or Personal Access Token")
    .option("-e, --email <email>", "Account email address")
    .option("-p, --password <password>", "Account password")
    .option("--otp <otp>", "Email OTP verification code (Rocket.new)")
    .option("--session <session>", "Session cookie value (Floot, Zite, Bolt)")
    .option("--csrf <csrf>", "CSRF token (Zite)")
    .action(async (platform, opts) => {
      try {
        await loginCommand(platform, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 2. Logout
  program
    .command("logout [platform]")
    .description("Log out of an AI platform or clear all stored credentials")
    .option("-a, --all", "Log out of all connected platforms")
    .action(async (platform, opts) => {
      try {
        await logoutCommand(platform, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 3. Auth / Whoami
  program
    .command("auth [action]")
    .alias("whoami")
    .description("Inspect active authentication status and credentials matrix")
    .action(async () => {
      try {
        await authStatusCommand();
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 4. Apps
  program
    .command("apps [platform]")
    .description("List available AI projects across platforms")
    .option("-i, --interactive", "Interactively pick a project to clone")
    .option("--json", "Output raw JSON representation")
    .action(async (platform, opts) => {
      try {
        await appsCommand(platform, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 5. Clone
  program
    .command("clone <app-id>")
    .description("Clone an AI project, reconstruct its folder structure, and initialize Git")
    .option("-p, --platform <platform>", "Source platform (base44, rocket, floot, zite, bolt, lovable)")
    .option("-o, --out <directory>", "Target output directory name")
    .option("--no-git", "Skip initializing a local Git repository")
    .option("--repo <repo>", "Link to a target GitHub repository (owner/name)")
    .option("-b, --branch <branch>", "Target branch name", "main")
    .action(async (appId, opts) => {
      try {
        await cloneCommand(appId, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 6. Pull
  program
    .command("pull")
    .description("Pull the latest source files from the linked AI platform into current directory")
    .action(async () => {
      try {
        await pullCommand();
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 7. Export
  program
    .command("export [app-id]")
    .description("Export project files or build a standalone ZIP package")
    .option("-p, --platform <platform>", "Platform name")
    .option("-z, --zip", "Package as a ZIP archive")
    .option("-o, --out <path>", "Destination directory or zip file path")
    .action(async (appId, opts) => {
      try {
        await exportCommand(appId, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 8. Diff
  program
    .command("diff")
    .description("Show local file modifications relative to the last sync snapshot")
    .option("-l, --live", "Compare directly against the live remote platform version")
    .action(async (opts) => {
      try {
        await diffCommand(opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 9. Sync
  program
    .command("sync")
    .description("Automatically detect changes, commit, and push to GitHub (with AI commit generation)")
    .option("-m, --message <message>", "Commit message")
    .option("-y, --yes", "Skip interactive confirmations")
    .option("-r, --repo <repo>", "Override target repository")
    .option("-b, --branch <branch>", "Override target branch")
    .action(async (opts) => {
      try {
        await syncCommand(opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 10. Push
  program
    .command("push")
    .description("Commit and push current project files directly to GitHub via Trees API")
    .option("-r, --repo <repo>", "GitHub repository (owner/name)")
    .option("-b, --branch <branch>", "Target branch", "main")
    .option("-m, --message <message>", "Commit message")
    .option("--private", "Create repository as private if creating a new one")
    .action(async (opts) => {
      try {
        await pushCommand(opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 11. Inspect
  program
    .command("inspect")
    .description("Deep inspection of project framework, tech stack, lines of code, and visual tree")
    .option("--no-tree", "Omit directory tree diagram")
    .action(async (opts) => {
      try {
        await inspectCommand(opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 12. Stats
  program
    .command("stats")
    .alias("dashboard")
    .description("Display weekly push activity chart, streak metrics, and sync history")
    .action(async () => {
      try {
        await statsCommand();
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 13. Compare
  program
    .command("compare <app1> <app2>")
    .description("Compare two AI projects side-by-side (shared files, size, divergence)")
    .option("--platform1 <p1>", "Platform of first app")
    .option("--platform2 <p2>", "Platform of second app")
    .action(async (app1, app2, opts) => {
      try {
        await compareCommand(app1, app2, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 14. Migrate
  program
    .command("migrate <appId> <targetPlatform>")
    .description("Assess and adapt project structure for migrating between platforms")
    .option("-s, --source <source>", "Source platform (default: base44)")
    .action(async (appId, targetPlatform, opts) => {
      try {
        await migrateCommand(appId, targetPlatform, { sourcePlatform: opts.source });
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 15. GitHub
  program
    .command("github [action]")
    .description("Manage GitHub credentials, repositories, and connection (status, login, repos, create)")
    .option("-t, --token <token>", "GitHub Personal Access Token")
    .option("-n, --name <name>", "New repository name")
    .option("--private", "Make repository private")
    .option("-d, --description <desc>", "Repository description")
    .action(async (action, opts) => {
      try {
        await githubCommand(action, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 16. Doctor
  program
    .command("doctor")
    .description("Run a complete health, runtime, platform, and permission audit")
    .option("--fix", "Attempt automatic fixes for detected issues")
    .action(async (opts) => {
      try {
        await doctorCommand(opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 17. Backup
  program
    .command("backup")
    .description("Export every connected project into timestamped ZIP archives")
    .option("-a, --all", "Backup from all connected platforms")
    .option("-p, --platform <platform>", "Backup only a specific platform")
    .option("-o, --out <directory>", "Output directory for backups")
    .action(async (opts) => {
      try {
        await backupCommand(opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 18. Watch
  program
    .command("watch")
    .description("Monitor local project files for changes with auto-sync capability")
    .option("--auto-sync", "Automatically sync and push when changes are detected")
    .option("-i, --interval <ms>", "Debounce interval in milliseconds", "1500")
    .action(async (opts) => {
      try {
        await watchCommand({
          autoSync: opts.autoSync,
          interval: Number(opts.interval),
        });
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 19. Release
  program
    .command("release [versionTag]")
    .description("Automated release pipeline: sync -> commit -> push -> GitHub tag/release -> watch CI")
    .option("-n, --name <name>", "Release title")
    .option("--notes <notes>", "Release notes")
    .option("--no-watch", "Skip watching GitHub Actions workflow execution")
    .option("-y, --yes", "Skip interactive prompts")
    .action(async (tag, opts) => {
      try {
        await releaseCommand(tag, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 20. Config
  program
    .command("config [action] [key] [value]")
    .description("Inspect and update global Push44 CLI configuration")
    .action(async (action, key, value) => {
      try {
        await configCommand(action, key, value);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 21. Completion
  program
    .command("completion [shell]")
    .description("Generate shell auto-completion script (bash, zsh, fish)")
    .action((shell) => {
      completionCommand(shell);
    });

  // 22. APK
  program
    .command("apk [action] [threadId]")
    .description("Rocket.new mobile APK build management (build, status, download)")
    .option("-o, --out <filepath>", "Output APK binary file path")
    .option("-w, --watch", "Watch build until completion and download automatically")
    .action(async (action, threadId, opts) => {
      try {
        await apkCommand(action, threadId, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 23. Badge
  program
    .command("badge <action> [platform] [appId]")
    .description("Remove platform watermark/branding badges (Floot, Zite, Bolt, Lovable)")
    .action(async (action, platform, appId) => {
      try {
        await badgeCommand(action, platform, appId);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  // 24. Deploy
  program
    .command("deploy [platform]")
    .description("Trigger web deployments to live hosting URLs")
    .option("-s, --subdomain <subdomain>", "Custom subdomain (e.g. for Floot apps)")
    .option("-u, --update", "Mark as existing production update")
    .action(async (platform, opts) => {
      try {
        await deployCommand(platform, opts);
      } catch (err: any) {
        console.error(formatErrorOutput(err, program.opts().debug));
        process.exit(1);
      }
    });

  return program;
}
