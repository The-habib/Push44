import type { IncomingMessage, ServerResponse } from "node:http";

const FRAMER_API_BASE = "https://api.framer.com";
const FRAMER_WEB_BASE = "https://framer.com";

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", () => resolve("{}"));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Framer-Session,X-Framer-Project-Id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const rawUrl = new URL(req.url ?? "/", "http://localhost");
  const subpath = "/" + decodeURIComponent(rawUrl.searchParams.get("p") ?? "");
  rawUrl.searchParams.delete("p");
  const qs = rawUrl.search;
  const targetPath = subpath + qs;

  const headers = req.headers as Record<string, string>;
  const sessionToken = (headers["x-framer-session"] ?? "").trim();
  const authHeader = (headers["authorization"] ?? "").trim();

  // Route to web base if it's a project duplicate/remix, otherwise api base
  const isWebRoute = targetPath.startsWith("/projects/new") || targetPath.startsWith("/remix");
  const targetBase = isWebRoute ? FRAMER_WEB_BASE : FRAMER_API_BASE;

  const forwardHeaders: Record<string, string> = {
    "Accept": headers["accept"] || "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Referer": "https://framer.com/",
    "Origin": "https://framer.com",
  };

  if (sessionToken) {
    forwardHeaders["Cookie"] = `session=${sessionToken}`;
    if (!authHeader) {
      forwardHeaders["Authorization"] = `Token ${sessionToken}`;
    }
  }

  if (authHeader) {
    forwardHeaders["Authorization"] = authHeader;
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readBody(req);
    forwardHeaders["Content-Type"] = headers["content-type"] || "application/json";
  }

  try {
    const targetUrl = `${targetBase}${targetPath}`;
    const framerRes = await fetch(targetUrl, {
      method: req.method ?? "GET",
      headers: forwardHeaders,
      redirect: "follow",
      ...(body !== undefined ? { body } : {}),
    });

    const contentType = framerRes.headers.get("content-type") ?? "application/json";
    const status = framerRes.status;

    // Handle template duplicate/remix redirect result
    if (isWebRoute) {
      const finalUrl = framerRes.url;
      const matchId = finalUrl.match(/projects\/([A-Za-z0-9_\-]+)/);
      const projectId = matchId ? matchId[1] : "";
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      return res.end(
        JSON.stringify({
          projectId,
          url: finalUrl,
          title: `Remixed Project (${projectId})`,
        })
      );
    }

    const buffer = Buffer.from(await framerRes.arrayBuffer());

    res.writeHead(status, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    });
    return res.end(buffer);
  } catch (err: any) {
    res.writeHead(500, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    return res.end(JSON.stringify({ error: "Framer proxy error: " + (err?.message ?? "unknown") }));
  }
}
