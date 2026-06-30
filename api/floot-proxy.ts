import type { IncomingMessage, ServerResponse } from "node:http";

const FLOOT_BASE = "https://floot.com";

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end",  () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error",() => resolve("{}"));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Floot-Token,RSC,Next-Router-State-Tree");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const rawUrl  = new URL(req.url ?? "/", "http://localhost");
  const subpath = "/" + decodeURIComponent(rawUrl.searchParams.get("p") ?? "");
  rawUrl.searchParams.delete("p");
  const qs = rawUrl.search;
  const targetPath = subpath + qs;

  const headers = req.headers as Record<string, string>;
  const token   = (headers["x-floot-token"] ?? "") as string;

  const customReferer = headers["x-floot-referer"] as string | undefined;

  const forwardHeaders: Record<string, string> = {
    "Accept":     (headers["accept"]       as string) ?? "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Referer":    customReferer ?? "https://floot.com/",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
  };

  if (token) {
    forwardHeaders["Cookie"] = `nextauth.session-token=${token}`;
  }

  if (headers["rsc"]) forwardHeaders["RSC"] = headers["rsc"] as string;
  if (headers["next-router-state-tree"]) {
    forwardHeaders["Next-Router-State-Tree"] = headers["next-router-state-tree"] as string;
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readBody(req);
    forwardHeaders["Content-Type"] = (headers["content-type"] as string) ?? "application/json";
  }

  try {
    const flootRes = await fetch(`${FLOOT_BASE}${targetPath}`, {
      method:  req.method ?? "GET",
      headers: forwardHeaders,
      ...(body !== undefined ? { body } : {}),
    });

    const contentType = flootRes.headers.get("content-type") ?? "application/json";
    const text = await flootRes.text();

    res.writeHead(flootRes.status, {
      "Content-Type":                contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control":               "no-store",
    });
    return res.end(text);
  } catch (err: any) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Floot proxy error: " + (err?.message ?? "unknown") }));
  }
}
