import { promises as fs } from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { getCredentials } from "../auth/store.js";
import { getPlatformAdapter } from "../platforms/index.js";
import { RocketAdapter } from "../platforms/rocket.js";
import { findProjectConfig } from "../storage/project-config.js";
import { withSpinner } from "../ui/spinner.js";
import { logger } from "../ui/logger.js";
import { requestWithRetry } from "../utils/network.js";
import { formatBytes } from "../utils/files.js";
import { Push44Error } from "../utils/errors.js";

export async function apkCommand(
  action = "status",
  threadIdArg?: string,
  options: { out?: string; watch?: boolean } = {}
): Promise<void> {
  const creds = await getCredentials();
  if (!creds.rocketToken) {
    throw new Push44Error("Rocket.new token required. Run `push44 login rocket` first.");
  }

  let threadId = threadIdArg;
  if (!threadId) {
    const found = await findProjectConfig();
    if (found && found.config.platform === "rocket") {
      threadId = found.config.appId;
    }
  }

  if (!threadId) {
    throw new Push44Error("Please provide a Rocket.new project thread ID or run from a cloned Rocket.new project directory.");
  }

  const rocket = getPlatformAdapter("rocket") as RocketAdapter;

  if (action === "build" || action === "start") {
    const res = await withSpinner("Triggering Rocket.new APK build...", async () =>
      rocket.triggerApkBuild(threadId!, creds)
    );

    logger.success("APK build queued on Rocket.new build servers.");

    if (options.watch) {
      await watchApkBuild(rocket, threadId, creds, options.out);
    }
    return;
  }

  if (action === "status") {
    const statusData = await withSpinner("Checking APK build status...", async () =>
      rocket.checkApkBuildStatus(threadId!, creds)
    );

    const statusMap: Record<number, string> = {
      1: "IN_QUEUE (Waiting for build runner)",
      2: "IN_PROCESS (Compiling Flutter & Android bundle)",
      3: "COMPLETED (Ready for download)",
      4: "FAILED",
      5: "QUEUE_BUILD_REJECTED",
      6: "IDLE (No active build)",
    };

    const statusNum = statusData?.data?.status || statusData?.status || 6;
    const statusName = statusMap[statusNum] || `UNKNOWN (${statusNum})`;

    console.log(`\n${pc.bold("Rocket.new APK Build Status")}`);
    console.log(`  Thread ID:  ${pc.cyan(threadId)}`);
    console.log(`  Status:     ${pc.bold(statusNum === 3 ? pc.green(statusName) : statusName)}`);
    console.log(`  Updated:    ${statusData?.data?.updatedAt || "N/A"}\n`);

    if (statusNum === 3) {
      logger.info("Run `push44 apk download` to download the compiled APK binary.");
    }
    return;
  }

  if (action === "download") {
    const downloadUrl = await withSpinner("Resolving APK download URL...", async () =>
      rocket.downloadApkUrl(threadId!, creds)
    );

    const targetFile = path.resolve(process.cwd(), options.out || `app-${threadId.slice(0, 8)}.apk`);
    await withSpinner(`Downloading APK from ${pc.dim(new URL(downloadUrl).hostname)}...`, async () => {
      const res = await requestWithRetry(downloadUrl);
      if (!res.ok) throw new Push44Error(`Download failed (${res.status})`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(targetFile, buf);
      return buf.length;
    }, (bytes) => `Saved APK (${formatBytes(bytes as number)}) to ${pc.bold(targetFile)}`);

    return;
  }

  throw new Push44Error(`Unknown APK action "${action}". Supported: build, status, download.`);
}

async function watchApkBuild(
  rocket: RocketAdapter,
  threadId: string,
  creds: any,
  outFile?: string
): Promise<void> {
  const started = Date.now();
  const maxWaitMs = 10 * 60 * 1000; // 10 min

  await withSpinner("Compiling Android APK...", async (spinner) => {
    while (Date.now() - started < maxWaitMs) {
      const statusData = await rocket.checkApkBuildStatus(threadId, creds);
      const status = statusData?.data?.status || statusData?.status;

      if (status === 1) spinner.text = pc.yellow("APK in queue...");
      else if (status === 2) spinner.text = pc.cyan("Compiling Flutter APK...");
      else if (status === 3) {
        spinner.succeed(pc.green("APK Build Complete!"));
        break;
      } else if (status === 4 || status === 5) {
        throw new Push44Error("Rocket.new APK build failed.");
      }

      await new Promise((r) => setTimeout(r, 6000));
    }
  });

  await apkCommand("download", threadId, { out: outFile });
}
