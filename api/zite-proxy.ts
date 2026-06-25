import type { IncomingMessage, ServerResponse } from "node:http";

const ZITE_BASE = "https://server.zite.com";
const ORIGIN    = "https://build.fillout.com";

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Zite-Session,X-Zite-Csrf");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const rawUrl  = new URL(req.url ?? "/", "http://localhost");
  const subpath = "/" + decodeURIComponent(rawUrl.searchParams.get("p") ?? "");
  rawUrl.searchParams.delete("p");
  const qs = rawUrl.search;
  const targetPath = subpath + qs;

  const headers: Record<string, string> = req.headers as Record<string, string>;
  const session = (headers["x-zite-session"] ?? "") as string;
  const csrf    = (headers["x-zite-csrf"]    ?? "") as string;

  const forwardHeaders: Record<string, string> = {
    "Accept":       "application/json",
    "Content-Type": "application/json",
    "Origin":       ORIGIN,
    "Referer":      ORIGIN + "/",
  };

  if (session || csrf) {
    const parts: string[] = [];
    if (session) parts.push(`connect.sid=${session}`);
    if (csrf)    parts.push(`fillout-csrf-token=${csrf}`);
    forwardHeaders["Cookie"] = parts.join("; ");
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readBody(req);
    if (!body) body = "{}";
  }

  try {
    const ziteRes = await fetch(`${ZITE_BASE}${targetPath}`, {
      method: req.method ?? "GET",
      headers: forwardHeaders,
      ...(body !== undefined ? { body } : {}),
    });

    const isLogin = targetPath.startsWith("/login");

    if (isLogin) {
      const rawCookies = ziteRes.headers.getSetCookie?.() ?? [];
      let sessionVal = "";
      let csrfVal    = "";
      for (const c of rawCookies) {
        const m = c.match(/^([^=]+)=([^;]*)/);
        if (!m) continue;
        if (m[1] === "connect.sid")        sessionVal = m[2];
        if (m[1] === "fillout-csrf-token") csrfVal    = m[2];
      }

      let profileEmail = "";
      let profileName  = "";
      try {
        const pr = await fetch(`${ZITE_BASE}/admin/profile`, {
          headers: {
            Accept:  "application/json",
            Origin:  ORIGIN,
            Referer: ORIGIN + "/",
            Cookie:  `connect.sid=${sessionVal}; fillout-csrf-token=${csrfVal}`,
          },
        });
        if (pr.ok) {
          const pd = await pr.json().catch(() => null);
          const u  = pd?.user ?? pd;
          profileEmail = u?.email     ?? "";
          profileName  = u?.firstName ?? u?.fullName ?? "";
        }
      } catch { /* ignore */ }

      res.writeHead(ziteRes.ok ? 200 : ziteRes.status, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ session: sessionVal, csrf: csrfVal, email: profileEmail, name: profileName }));
    }

    const contentType = ziteRes.headers.get("content-type") ?? "application/json";
    const text = await ziteRes.text();
    res.writeHead(ziteRes.status, { "Content-Type": contentType });
    return res.end(text);
  } catch (err: any) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Zite proxy error: " + (err?.message ?? "unknown") }));
  }
}
