import { promises as fs } from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { logger } from "../ui/logger.js";

const DEFAULT_IGNORE_PATTERNS = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local
.pnp
.pnp.js

# Environment Variables & Secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.pem
*.key
credentials.enc

# Editor & OS files
.DS_Store
Thumbs.db
.idea
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# Build & Cache
.turbo
.next
.nuxt
.cache
.push44-cache
*.tsbuildinfo

# Flutter / Mobile artifacts
.dart_tool
.flutter-plugins
.flutter-plugins-dependencies
build/
android/app/release/
*.apk
*.aab
`;

export async function ignoreCommand(): Promise<void> {
  const root = process.cwd();
  const gitignorePath = path.join(root, ".gitignore");
  const push44ignorePath = path.join(root, ".push44ignore");

  await fs.writeFile(gitignorePath, DEFAULT_IGNORE_PATTERNS.trim() + "\n", "utf-8");
  await fs.writeFile(push44ignorePath, DEFAULT_IGNORE_PATTERNS.trim() + "\n", "utf-8");

  logger.success(`Generated safe ignore rules:`);
  console.log(`  ${pc.cyan("• .gitignore")}`);
  console.log(`  ${pc.cyan("• .push44ignore")}\n`);
}
