import type { IncomingMessage, ServerResponse } from "node:http";

const APP_BASE = "https://push44.vercel.app";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const action = url.searchParams.get("action");
  const clientId = process.env.GITHUB_CLIENT_ID ?? "";
  const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";

  if (!clientId) {
    res.writeHead(302, { Location: `${APP_BASE}/settings?github_error=${encodeURIComponent("GitHub OAuth is not configured on this server.")}` });
    return res.end();
  }

  if (action === "start") {
    const state = url.searchParams.get("state") ?? Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      client_id: clientId,
      scope: "repo user",
      state,
      redirect_uri: `${APP_BASE}/api/github-oauth`,
    });
    res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
    return res.end();
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";

  if (!code) {
    const errMsg = url.searchParams.get("error_description") ?? url.searchParams.get("error") ?? "GitHub OAuth cancelled";
    res.writeHead(302, { Location: `/settings?github_error=${encodeURIComponent(errMsg)}` });
    return res.end();
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json() as any;

    if (data.error || !data.access_token) {
      const errMsg = data.error_description ?? data.error ?? "OAuth token exchange failed";
      res.writeHead(302, { Location: `/settings?github_error=${encodeURIComponent(errMsg)}` });
      return res.end();
    }

    res.writeHead(302, { Location: `/settings?github_token=${data.access_token}&state=${encodeURIComponent(state)}` });
    return res.end();
  } catch (err: any) {
    res.writeHead(302, { Location: `/settings?github_error=${encodeURIComponent("Network error: " + (err?.message ?? "unknown"))}` });
    return res.end();
  }
}
