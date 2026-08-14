import pc from "picocolors";
import { askSelect } from "../ui/prompts.js";
import { getCredentials } from "../auth/store.js";
import { findProjectConfig } from "../storage/project-config.js";
import { renderClaudeBanner } from "../ui/banner.js";
import { syncCommand } from "./sync.js";
import { appsCommand } from "./apps.js";
import { inspectCommand } from "./inspect.js";
import { statsCommand } from "./stats.js";
import { doctorCommand } from "./doctor.js";
import { authStatusCommand } from "./auth.js";
import { loginCommand } from "./login.js";
import { apkCommand } from "./apk.js";
import { deployCommand } from "./deploy.js";

export async function vibeMenuCommand(): Promise<void> {
  const creds = await getCredentials();
  const found = await findProjectConfig();
  const project = found ? found.config : null;

  console.clear();
  console.log(renderClaudeBanner(creds, project));

  console.log(pc.bold(pc.yellow("✦ What would you like to do today?\n")));

  const choice = await askSelect(
    "Choose an action:",
    [
      {
        title: "🚀 Quick Sync to GitHub",
        description: "Auto-detect your changes and push directly to GitHub (No git skills needed!)",
        value: "sync",
      },
      {
        title: "📦 Download / Clone AI App",
        description: "Explore and clone apps from Base44, Rocket.new, Floot, Zite, Bolt, Lovable",
        value: "apps",
      },
      {
        title: "🔍 Inspect Project Architecture",
        description: "See your framework (React/Flutter), UI kits (Tailwind/Radix), and file tree",
        value: "inspect",
      },
      {
        title: "📊 Activity & Push Streaks",
        description: "View weekly sync chart, commit history, and push streaks",
        value: "stats",
      },
      {
        title: "🩺 Doctor & Self-Repair",
        description: "Run full health diagnostic and auto-repair any issues",
        value: "doctor",
      },
      {
        title: "🔑 Connect Accounts / Log In",
        description: "Authenticate with GitHub, Base44, Rocket.new, Floot, Zite, Bolt, Lovable",
        value: "auth",
      },
      {
        title: "📱 Build Mobile APK / Deploy",
        description: "Trigger Rocket.new Android APK builds or deploy live web apps",
        value: "platform_tools",
      },
      {
        title: "💡 Vibe Coder Cheatsheet",
        description: "Read the friendly guide on how Push44 works",
        value: "guide",
      },
      {
        title: "👋 Exit",
        description: "Close Push44",
        value: "exit",
      },
    ]
  );

  switch (choice) {
    case "sync":
      await syncCommand();
      break;
    case "apps":
      await appsCommand(undefined, { interactive: true });
      break;
    case "inspect":
      await inspectCommand();
      break;
    case "stats":
      await statsCommand();
      break;
    case "doctor":
      await doctorCommand({ fix: true });
      break;
    case "auth":
      await loginCommand();
      break;
    case "platform_tools":
      console.log(`\n${pc.bold("✦ Platform Builder Tools:")}`);
      console.log(`  ${pc.cyan("push44 apk build")}   ${pc.dim("— Build Flutter Android APK on Rocket.new")}`);
      console.log(`  ${pc.cyan("push44 deploy")}      ${pc.dim("— Deploy live website on Floot.app")}`);
      console.log(`  ${pc.cyan("push44 badge remove")}${pc.dim("— Remove platform branding badges\n")}`);
      break;
    case "guide":
      showVibeCoderGuide();
      break;
    case "exit":
      console.log(pc.dim("\nHappy vibe coding! 🚀\n"));
      break;
  }
}

export function showVibeCoderGuide(): void {
  console.log(`\n${pc.bold(pc.yellow("✦ Push44 — Vibe Coder Cheatsheet & Guide"))}\n`);
  console.log(
    pc.cyan("1. How do I get my code out of AI builders?") +
      `\n   Run ${pc.bold("push44 apps")} to see your projects, then pick one to clone.` +
      `\n   Push44 downloads all files, assets, and sets up a clean folder on your computer.\n`
  );
  console.log(
    pc.cyan("2. How do I save my changes to GitHub?") +
      `\n   Whenever you edit files in Cursor, VS Code, or your editor, just run:` +
      `\n   ${pc.bold("push44 sync")}` +
      `\n   Push44 figures out what changed, writes a clear commit message, and saves it to GitHub!\n`
  );
  console.log(
    pc.cyan("3. How do I turn a Rocket.new app into an Android phone app?") +
      `\n   Run ${pc.bold("push44 apk build --watch")}` +
      `\n   Rocket builds the APK in the cloud, and Push44 downloads the .apk ready to install on your phone.\n`
  );
  console.log(
    pc.cyan("4. Something isn't working?") +
      `\n   Run ${pc.bold("push44 doctor --fix")}` +
      `\n   Push44 checks your Node, Git, internet, and accounts, and repairs issues automatically.\n`
  );
}
