import type { IncomingMessage, ServerResponse } from "node:http";

// Disable Vercel's built-in body parser so we can read raw binary (ZIP uploads).
export const config = { api: { bodyParser: false } };

const BOLT_BASE = "https://bolt.new";

async function readBodyBuffer(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error",() => resolve(Buffer.alloc(0)));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Bolt-Token");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Route pattern: /api/bolt-proxy?p=<encoded-subpath>
  const rawUrl  = new URL(req.url ?? "/", "http://localhost");
  const subpath = "/" + decodeURIComponent(rawUrl.searchParams.get("p") ?? "");
  rawUrl.searchParams.delete("p");
  const qs = rawUrl.search;
  const targetPath = subpath + qs;

  const headers = req.headers as Record<string, string>;

  // Token arrives URL-encoded; bolt.new expects the decoded value as the cookie.
  const rawToken = (headers["x-bolt-token"] ?? "") as string;
  const token    = decodeURIComponent(rawToken);

  const contentType = (headers["content-type"] as string) ?? "application/json";

  const forwardHeaders: Record<string, string> = {
    "Cookie":     `__session=${token}`,
    "Accept":     (headers["accept"] as string) ?? "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Origin":     "https://bolt.new",
    "Referer":    "https://bolt.new/",
  };

  // Read body as raw Buffer — required for binary ZIP PUT uploads.
  let bodyBuf: Buffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    bodyBuf = await readBodyBuffer(req);
    if (bodyBuf.length > 0) {
      forwardHeaders["Content-Type"] = contentType;
    }
  }

  try {
    const boltRes = await fetch(`${BOLT_BASE}${targetPath}`, {
      method:  req.method ?? "GET",
      headers: forwardHeaders,
      ...(bodyBuf && bodyBuf.length > 0 ? { body: bodyBuf as unknown as BodyInit } : {}),
    });

    const responseText = await boltRes.text();
    res.writeHead(boltRes.status, {
      "Content-Type":                boltRes.headers.get("content-type") ?? "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control":               "no-store",
    });
    return res.end(responseText);
  } catch (err: any) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Bolt proxy error: " + (err?.message ?? "unknown") }));
  }
}
