import type { IncomingMessage, ServerResponse } from "node:http";

const APP_BASE = "https://push44.vercel.app";

function encodeState(nonce: string, returnTo: string) {
  return `${nonce}|${returnTo}`;
}
function decodeState(state: string): { nonce: string; returnTo: string } {
  const idx = state.indexOf("|");
  if (idx === -1) return { nonce: state, returnTo: "/settings" };
  return { nonce: state.slice(0, idx), returnTo: state.slice(idx + 1) || "/settings" };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const action = url.searchParams.get("action");
  const clientId = process.env.GITHUB_CLIENT_ID ?? "";
  const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";

  const fallback = (returnTo: string, errMsg: string) => {
    res.writeHead(302, { Location: `${returnTo}?github_error=${encodeURIComponent(errMsg)}` });
    return res.end();
  };

  if (!clientId) {
    fallback("/settings", "GitHub OAuth is not configured on this server.");
    return;
  }

  if (action === "start") {
    const nonce = Math.random().toString(36).slice(2);
    const returnTo = url.searchParams.get("return_to") ?? "/settings";
    const state = encodeState(nonce, returnTo);
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
  const rawState = url.searchParams.get("state") ?? "";
  const { returnTo } = decodeState(rawState);

  if (!code) {
    const errMsg = url.searchParams.get("error_description") ?? url.searchParams.get("error") ?? "GitHub OAuth cancelled";
    fallback(returnTo, errMsg);
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json() as any;

    if (data.error || !data.access_token) {
      fallback(returnTo, data.error_description ?? data.error ?? "OAuth token exchange failed");
      return;
    }

    res.writeHead(302, { Location: `${returnTo}?github_token=${data.access_token}` });
    return res.end();
  } catch (err: any) {
    fallback(returnTo, "Network error: " + (err?.message ?? "unknown"));
  }
}
