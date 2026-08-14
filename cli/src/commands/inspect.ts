import pc from "picocolors";
import { findProjectConfig } from "../storage/project-config.js";
import { readDirectoryFiles, formatBytes } from "../utils/files.js";
import { renderFileTree } from "../ui/tree.js";
import { createTable } from "../ui/table.js";
import { Push44Error } from "../utils/errors.js";

export async function inspectCommand(options: { tree?: boolean } = {}): Promise<void> {
  const found = await findProjectConfig();
  if (!found) {
    throw new Push44Error("No .push44.json found. Run `push44 clone <app-id>` to initialize.");
  }

  const { config, projectRoot } = found;
  const files = await readDirectoryFiles(projectRoot);

  // Analyze package.json
  let dependencies: Record<string, string> = {};
  let devDependencies: Record<string, string> = {};
  const pkgFile = files.find((f) => f.path === "package.json");
  if (pkgFile && !pkgFile.binary) {
    try {
      const parsed = JSON.parse(pkgFile.content);
      dependencies = parsed.dependencies || {};
      devDependencies = parsed.devDependencies || {};
    } catch {}
  }

  const allDeps = { ...dependencies, ...devDependencies };

  // Stack Detection
  let framework = "Unknown";
  if (allDeps["@tanstack/react-router"] || allDeps["@tanstack/start"]) framework = "TanStack Start / Router";
  else if (allDeps["next"]) framework = "Next.js";
  else if (allDeps["@remix-run/react"] || allDeps["remix"]) framework = "Remix";
  else if (allDeps["react"] && allDeps["vite"]) framework = "React 19 + Vite";
  else if (files.some((f) => f.path.endsWith(".dart") || f.path === "pubspec.yaml")) framework = "Flutter / Dart (Mobile)";

  let styling = "Plain CSS";
  if (allDeps["tailwindcss"] || allDeps["@tailwindcss/vite"]) styling = "Tailwind CSS v4";
  else if (files.some((f) => f.path.endsWith(".module.css"))) styling = "CSS Modules";

  const uiLibraries: string[] = [];
  if (allDeps["lucide-react"]) uiLibraries.push("Lucide Icons");
  if (allDeps["framer-motion"]) uiLibraries.push("Framer Motion");
  if (allDeps["clsx"] && allDeps["tailwind-merge"]) uiLibraries.push("shadcn/ui (Tailwind utilities)");
  if (allDeps["@radix-ui/react-dialog"] || allDeps["@radix-ui/react-slot"]) uiLibraries.push("Radix UI Primitives");

  const integrations: string[] = [];
  if (allDeps["@supabase/supabase-js"]) integrations.push("Supabase");
  if (allDeps["firebase"] || allDeps["@firebase/app"]) integrations.push("Firebase");
  if (allDeps["@tanstack/react-query"]) integrations.push("TanStack Query");

  const totalBytes = files.reduce((acc, f) => acc + (f.sizeBytes || f.content.length), 0);
  const totalLines = files.reduce((acc, f) => {
    if (f.binary) return acc;
    return acc + f.content.split("\n").length;
  }, 0);

  console.log(`\n${pc.bold("✦ Project Architecture & Tech Stack Inspection")}\n`);

  const table = createTable({ head: ["Property", "Detected Value"] });
  table.push(["Project Name", pc.bold(config.appName)]);
  table.push(["Source Platform", pc.cyan(config.platform)]);
  table.push(["Framework / Runtime", pc.green(framework)]);
  table.push(["Styling Engine", pc.yellow(styling)]);
  table.push(["UI Libraries", uiLibraries.length > 0 ? uiLibraries.join(", ") : pc.dim("None")]);
  table.push(["Integrations", integrations.length > 0 ? integrations.join(", ") : pc.dim("None")]);
  table.push(["Total Source Files", String(files.length)]);
  table.push(["Total Lines of Code", `${totalLines.toLocaleString()} lines`]);
  table.push(["Project Bundle Size", formatBytes(totalBytes)]);

  console.log(table.toString());
  console.log();

  if (options.tree !== false) {
    console.log(pc.bold("Directory Architecture Tree:\n"));
    console.log(renderFileTree(files, 4, 30));
    console.log();
  }
}
