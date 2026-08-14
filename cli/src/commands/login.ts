import pc from "picocolors";
import { getPlatformAdapter, getAllAdapters } from "../platforms/index.js";
import { saveCredentials, getCredentials } from "../auth/store.js";
import { logger } from "../ui/logger.js";
import { withSpinner } from "../ui/spinner.js";
import { askSelect, askText, askPassword } from "../ui/prompts.js";
import { getGitHubUser } from "../github/client.js";
import { Push44Error } from "../utils/errors.js";

export async function loginCommand(
  platformArg?: string,
  options: {
    token?: string;
    email?: string;
    password?: string;
    otp?: string;
    session?: string;
    csrf?: string;
  } = {}
): Promise<void> {
  let target = platformArg?.toLowerCase();

  if (!target) {
    const choices = [
      { title: "GitHub", value: "github", description: "Personal Access Token with repo scope" },
      ...getAllAdapters().map((a) => ({
        title: a.displayName,
        value: a.platform,
        description: a.description,
      })),
    ];
    const selected = await askSelect("Select a platform to authenticate:", choices);
    if (!selected) return;
    target = selected;
  }

  // GitHub Login Flow
  if (target === "github") {
    let token = options.token;
    if (!token) {
      logger.info(
        "Generate a token at: " +
          pc.cyan("https://github.com/settings/tokens (classic) with `repo` and `user` scopes.")
      );
      token = await askPassword("Enter your GitHub Personal Access Token:");
    }
    if (!token) {
      throw new Push44Error("GitHub token cannot be empty.");
    }

    const user = await withSpinner(
      "Verifying GitHub token...",
      async () => getGitHubUser(token!),
      (u) => `Authenticated as @${u.login} (${u.name})`
    );

    await saveCredentials({
      githubToken: token,
      githubUsername: user.login,
      githubName: user.name,
      githubEmail: user.email,
      githubId: user.id,
    });
    logger.success(`GitHub credentials saved securely.`);
    return;
  }

  // AI Platform Login Flow
  const adapter = getPlatformAdapter(target);

  let authInput = { ...options };

  if (!authInput.token && !authInput.email && !authInput.session) {
    const methodChoice = await askSelect(
      `Select login method for ${adapter.displayName}:`,
      adapter.authMethods.map((m) => {
        if (m === "token") return { title: "API Token", value: "token" };
        if (m === "email_password") return { title: "Email & Password", value: "email_password" };
        if (m === "otp") return { title: "Email OTP", value: "otp" };
        return { title: "Session Cookie", value: "session" };
      })
    );

    if (methodChoice === "token") {
      authInput.token = await askPassword("Enter your API Token:");
    } else if (methodChoice === "email_password") {
      authInput.email = await askText("Enter your email:");
      authInput.password = await askPassword("Enter your password:");
    } else if (methodChoice === "otp") {
      authInput.email = await askText("Enter your email address:");
      if (adapter.platform === "rocket") {
        await withSpinner("Sending OTP verification code...", async () => {
          await (adapter as any).requestOTP(authInput.email!);
        });
        authInput.otp = await askText("Enter the 6-digit OTP sent to your email:");
      }
    } else if (methodChoice === "session") {
      authInput.session = await askPassword("Enter session token / cookie:");
      if (adapter.platform === "zite") {
        authInput.csrf = await askPassword("Enter fillout-csrf-token (optional):");
      }
    }
  }

  const result = await withSpinner(
    `Authenticating with ${adapter.displayName}...`,
    async () => adapter.authenticate(authInput),
    (res) => `Successfully logged in to ${adapter.displayName} as ${res.email || res.name || "User"}`
  );

  const credsUpdate: Record<string, any> = {};
  if (adapter.platform === "base44") {
    credsUpdate.base44Token = result.token;
    credsUpdate.base44Email = result.email;
  } else if (adapter.platform === "rocket") {
    credsUpdate.rocketToken = result.token;
    credsUpdate.rocketEmail = result.email;
    credsUpdate.rocketCompanyId = result.companyId;
  } else if (adapter.platform === "floot") {
    credsUpdate.flootToken = result.token;
    credsUpdate.flootEmail = result.email;
  } else if (adapter.platform === "zite") {
    credsUpdate.ziteSession = result.session;
    credsUpdate.ziteCsrf = result.csrf;
    credsUpdate.ziteEmail = result.email;
  } else if (adapter.platform === "bolt") {
    credsUpdate.boltToken = result.token;
    credsUpdate.boltEmail = result.email;
  } else if (adapter.platform === "lovable") {
    credsUpdate.lovableToken = result.token;
    credsUpdate.lovableRefreshToken = result.refreshToken;
    credsUpdate.lovableEmail = result.email;
  }

  await saveCredentials(credsUpdate);
  logger.success(`Saved credentials for ${adapter.displayName}.`);
}
