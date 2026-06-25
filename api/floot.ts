import type { IncomingMessage, ServerResponse } from "node:http";
type VercelRequest = IncomingMessage & { url?: string; method?: string; headers: Record<string, string | string[] | undefined>; body?: any };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (body: any) => void; send: (body: any) => void; setHeader: (key: string, value: string) => void; end: (body?: any) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Floot-Token");
    return res.status(204).end();
  }

  const rawPath = req.url ?? "/";
  const targetPath = rawPath.replace(/^\/api\/floot/, "") || "/";
  const token = (req.headers["x-floot-token"] as string) ?? "";

  const forwardHeaders: Record<string, string> = {
    Cookie: `nextauth.session-token=${token}; next-auth.session-token=${token}`,
    Accept: (req.headers["accept"] as string) ?? "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    Referer: "https://floot.com/",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
  };

  if (req.headers["rsc"]) forwardHeaders["RSC"] = req.headers["rsc"] as string;
  if (req.headers["next-router-state-tree"]) {
    forwardHeaders["Next-Router-State-Tree"] = req.headers["next-router-state-tree"] as string;
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    forwardHeaders["Content-Type"] = (req.headers["content-type"] as string) ?? "application/json";
  }

  try {
    const flootRes = await fetch(`https://floot.com${targetPath}`, {
      method: req.method ?? "GET",
      headers: forwardHeaders,
      ...(body !== undefined ? { body } : {}),
    });

    const responseText = await flootRes.text();
    const contentType = flootRes.headers.get("content-type") ?? "text/plain";

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);
    return res.status(flootRes.status).send(responseText);
  } catch (err: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: "Floot proxy error: " + (err?.message ?? "unknown") });
  }
}
