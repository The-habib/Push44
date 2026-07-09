import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { api: { bodyParser: false } };

const LOVABLE_API = "https://api.lovable.dev";

async function readBody(req: IncomingMessage): Promise<Buffer> {
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
  res.setHeader("Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Lovable-Token,Accept");

  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  // Route: /api/lovable?p=<encoded-sub-path>
  const rawUrl  = new URL(req.url ?? "/", "http://localhost");
  const subpath = "/" + decodeURIComponent(rawUrl.searchParams.get("p") ?? "");
  rawUrl.searchParams.delete("p");
  const qs = rawUrl.search;
  const targetPath = subpath + qs;

  const headers = req.headers as Record<string, string>;
  const token = headers["x-lovable-token"] ?? "";

  const forwardHeaders: Record<string, string> = {
    Accept:        headers["accept"] ?? "application/json",
    "User-Agent":  "Mozilla/5.0 (compatible; Push44/1.0)",
    Origin:        "https://lovable.dev",
    Referer:       "https://lovable.dev/",
  };
  if (token) forwardHeaders["Authorization"] = `Bearer ${token}`;
  if (headers["content-type"]) forwardHeaders["Content-Type"] = headers["content-type"];

  let bodyBuf: Buffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    bodyBuf = await readBody(req);
  }

  try {
    const apiRes = await fetch(`${LOVABLE_API}${targetPath}`, {
      method:  req.method ?? "GET",
      headers: forwardHeaders,
      ...(bodyBuf && bodyBuf.length > 0 ? { body: bodyBuf as unknown as BodyInit } : {}),
    });

    const contentType = apiRes.headers.get("content-type") ?? "application/json";
    const responseText = await apiRes.text();

    res.writeHead(apiRes.status, {
      "Content-Type":                contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control":               "no-store",
    });
    return res.end(responseText);
  } catch (err: any) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Lovable proxy error: " + (err?.message ?? "unknown") }));
  }
}
