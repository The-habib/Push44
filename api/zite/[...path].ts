import type { IncomingMessage, ServerResponse } from "node:http";
type VercelRequest = IncomingMessage & { url?: string; method?: string; headers: Record<string, string | string[] | undefined>; body?: any };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (body: any) => void; send: (body: any) => void; setHeader: (key: string, value: string) => void; end: (body?: any) => void };

const ZITE_BASE = "https://server.zite.com";
const ORIGIN    = "https://build.fillout.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Zite-Session,X-Zite-Csrf");
    return res.status(204).end();
  }

  const rawPath = req.url ?? "/";
  const targetPath = rawPath.replace(/^\/api\/zite/, "") || "/";

  const session = (req.headers["x-zite-session"] as string) ?? "";
  const csrf    = (req.headers["x-zite-csrf"]    as string) ?? "";

  const forwardHeaders: Record<string, string> = {
    "Accept":       "application/json",
    "Content-Type": "application/json",
    "Origin":       ORIGIN,
    "Referer":      ORIGIN + "/",
  };

  if (session || csrf) {
    const cookieParts: string[] = [];
    if (session) cookieParts.push(`connect.sid=${session}`);
    if (csrf)    cookieParts.push(`fillout-csrf-token=${csrf}`);
    forwardHeaders["Cookie"] = cookieParts.join("; ");
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  }

  try {
    const ziteRes = await fetch(`${ZITE_BASE}${targetPath}`, {
      method: req.method ?? "GET",
      headers: forwardHeaders,
      ...(body !== undefined ? { body } : {}),
    });

    const contentType = ziteRes.headers.get("content-type") ?? "application/json";

    if (targetPath === "/login/password" || targetPath.startsWith("/login")) {
      const rawCookies = ziteRes.headers.getSetCookie?.() ?? [];
      let sessionVal = "";
      let csrfVal    = "";

      for (const c of rawCookies) {
        const match = c.match(/^([^=]+)=([^;]*)/);
        if (!match) continue;
        const [, name, value] = match;
        if (name === "connect.sid")       sessionVal = value;
        if (name === "fillout-csrf-token") csrfVal   = value;
      }

      let profileEmail = "";
      let profileName  = "";
      try {
        const profileRes = await fetch(`${ZITE_BASE}/admin/profile`, {
          headers: {
            Accept:  "application/json",
            Origin:  ORIGIN,
            Referer: ORIGIN + "/",
            Cookie:  `connect.sid=${sessionVal}; fillout-csrf-token=${csrfVal}`,
          },
        });
        if (profileRes.ok) {
          const pd = await profileRes.json().catch(() => null);
          const user = pd?.user ?? pd;
          profileEmail = user?.email ?? "";
          profileName  = user?.firstName ?? user?.fullName ?? "";
        }
      } catch { /* ignore profile fetch failure */ }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      return res.status(ziteRes.ok ? 200 : ziteRes.status).json({
        session: sessionVal,
        csrf:    csrfVal,
        email:   profileEmail,
        name:    profileName,
      });
    }

    const responseText = await ziteRes.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);
    return res.status(ziteRes.status).send(responseText);
  } catch (err: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: "Zite proxy error: " + (err?.message ?? "unknown") });
  }
}
