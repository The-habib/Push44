import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { ProjectConfig } from "../types.js";

const CONFIG_FILENAME = ".push44.json";

export async function readProjectConfig(projectDir = process.cwd()): Promise<ProjectConfig | null> {
  const configPath = path.join(projectDir, CONFIG_FILENAME);
  try {
    const content = await fs.readFile(configPath, "utf-8");
    return JSON.parse(content) as ProjectConfig;
  } catch {
    return null;
  }
}

export async function findProjectConfig(startDir = process.cwd()): Promise<{ config: ProjectConfig; filePath: string; projectRoot: string } | null> {
  let currentDir = path.resolve(startDir);

  while (true) {
    const configPath = path.join(currentDir, CONFIG_FILENAME);
    try {
      const content = await fs.readFile(configPath, "utf-8");
      const config = JSON.parse(content) as ProjectConfig;
      return { config, filePath: configPath, projectRoot: currentDir };
    } catch {
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
  }

  return null;
}

export async function saveProjectConfig(projectDir: string, config: ProjectConfig): Promise<void> {
  const configPath = path.join(projectDir, CONFIG_FILENAME);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}
