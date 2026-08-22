import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { seoPlugin } from "./src/seo/vite-plugin";
import boltLoginHandler from "./api/bolt-login";

function ziteProxyPlugin(): Plugin {
  const ZITE_BASE = "https://server.zite.com";
  const ZITE_ORIGIN = "https://build.fillout.com";

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/zite")) return next();

    const targetPath = req.url.replace("/api/zite", "") || "/";
    const session = (req.headers["x-zite-session"] as string) ?? "";
    const csrf    = (req.headers["x-zite-csrf"]    as string) ?? "";

    const forwardHeaders: Record<string, string> = {
      Accept:         "application/json",
      "Content-Type": "application/json",
      Origin:         ZITE_ORIGIN,
      Referer:        ZITE_ORIGIN + "/",
    };

    if (session || csrf) {
      const parts: string[] = [];
      if (session) parts.push(`connect.sid=${session}`);
      if (csrf)    parts.push(`fillout-csrf-token=${csrf}`);
      forwardHeaders["Cookie"] = parts.join("; ");
    }

    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise<string>((resolve) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      });
    }

    try {
      const ziteRes = await fetch(`${ZITE_BASE}${targetPath}`, {
        method: req.method ?? "GET",
        headers: forwardHeaders,
        ...(body !== undefined ? { body } : {}),
      });

      const contentType = ziteRes.headers.get("content-type") ?? "application/json";

      const isLogin = targetPath === "/login/password" || targetPath.startsWith("/login");
      if (isLogin) {
        const rawCookies: string[] = [];
        ziteRes.headers.forEach((val, key) => {
          if (key.toLowerCase() === "set-cookie") rawCookies.push(val);
        });
        let sessionVal = "";
        let csrfVal    = "";
        for (const c of rawCookies) {
          const match = c.match(/^([^=]+)=([^;]*)/);
          if (!match) continue;
          const [, name, value] = match;
          if (name === "connect.sid")        sessionVal = value;
          if (name === "fillout-csrf-token") csrfVal    = value;
        }

        let profileEmail = "";
        let profileName  = "";
        try {
          const profileRes = await fetch(`${ZITE_BASE}/admin/profile`, {
            headers: {
              Accept:  "application/json",
              Origin:  ZITE_ORIGIN,
              Referer: ZITE_ORIGIN + "/",
              Cookie:  `connect.sid=${sessionVal}; fillout-csrf-token=${csrfVal}`,
            },
          });
          if (profileRes.ok) {
            const pd = await profileRes.json().catch(() => null);
            const user = pd?.user ?? pd;
            profileEmail = user?.email ?? "";
            profileName  = user?.firstName ?? user?.fullName ?? "";
          }
        } catch { /* ignore */ }

        res.writeHead(ziteRes.ok ? 200 : ziteRes.status, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        return res.end(JSON.stringify({ session: sessionVal, csrf: csrfVal, email: profileEmail, name: profileName }));
      }

      const responseText = await ziteRes.text();
      res.writeHead(ziteRes.status, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(responseText);
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Zite proxy error: " + (err?.message ?? "unknown") }));
    }
  };

  return {
    name: "zite-proxy",
    configureServer(server) { server.middlewares.use(handler as any); },
    configurePreviewServer(server) { server.middlewares.use(handler as any); },
  };
}

function githubOAuthPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/github-oauth")) return next();

    const url = new URL(req.url, "http://localhost");
    const action = url.searchParams.get("action");
    const clientId = process.env.GITHUB_CLIENT_ID ?? "";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
    const devBase = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : `http://localhost:5000`;

    const sanitizeReturnTo = (value: string | null | undefined): string => {
      const path = (value ?? "").trim();
      if (!path) return "/settings";
      try {
        const url = new URL(path, "https://push44.invalid");
        if (url.hostname !== "push44.invalid") return "/settings";
        const normalized = url.pathname + url.search + url.hash;
        if (normalized.startsWith("//")) return "/settings";
        return normalized;
      } catch { return "/settings"; }
    };
    const encodeState = (nonce: string, returnTo: string) => `${nonce}|${returnTo}`;
    const decodeState = (s: string) => {
      const idx = s.indexOf("|");
      return idx === -1 ? { nonce: s, returnTo: "/settings" } : { nonce: s.slice(0, idx), returnTo: sanitizeReturnTo(s.slice(idx + 1)) };
    };
    const fallback = (returnTo: string, msg: string) => {
      res.writeHead(302, { Location: `${returnTo}?github_error=${encodeURIComponent(msg)}` });
      res.end();
    };

    if (!clientId) {
      fallback("/settings", "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your Replit secrets to use OAuth in dev.");
      return;
    }

    if (action === "start") {
      const nonce = Math.random().toString(36).slice(2);
      const returnTo = sanitizeReturnTo(url.searchParams.get("return_to"));
      const state = encodeState(nonce, returnTo);
      const params = new URLSearchParams({
        client_id: clientId,
        scope: "repo user",
        state,
        redirect_uri: `${devBase}/api/github-oauth`,
      });
      res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
      return res.end();
    }

    const code = url.searchParams.get("code");
    const { returnTo } = decodeState(url.searchParams.get("state") ?? "");

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
      const data: any = await tokenRes.json();

      if (data.error || !data.access_token) {
        fallback(returnTo, data.error_description ?? data.error ?? "OAuth token exchange failed");
        return;
      }

      // Pass token via cookie — never in the URL (browser history safe).
      res.writeHead(302, {
        Location: `${returnTo}?github_authed=1`,
        // Omit Secure flag in dev (HTTP localhost)
        "Set-Cookie": `gh_token=${encodeURIComponent(data.access_token)}; SameSite=Strict; Max-Age=30; Path=/`,
      });
      return res.end();
    } catch (err: any) {
      fallback(returnTo, "Network error: " + (err?.message ?? "unknown"));
    }
  };

  return {
    name: "github-oauth",
    configureServer(server) { server.middlewares.use(handler as any); },
    configurePreviewServer(server) { server.middlewares.use(handler as any); },
  };
}

function flootProxyPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/floot")) {
      return next();
    }

    const token = (req.headers["x-floot-token"] as string) ?? "";
    const targetPath = req.url.replace("/api/floot", "") || "/";

    const forwardHeaders: Record<string, string> = {
      "Cookie": `nextauth.session-token=${token}; next-auth.session-token=${token}`,
      "Accept": (req.headers["accept"] as string) ?? "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Referer": "https://floot.com/",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
    };

    if (req.headers["rsc"]) forwardHeaders["RSC"] = req.headers["rsc"] as string;
    if (req.headers["next-router-state-tree"]) {
      forwardHeaders["Next-Router-State-Tree"] = req.headers["next-router-state-tree"] as string;
    }

    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise<string>((resolve) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      });
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

      res.writeHead(flootRes.status, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(responseText);
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy error: " + (err?.message ?? "unknown") }));
    }
  };

  return {
    name: "floot-proxy",
    configureServer(server) {
      server.middlewares.use(handler as any);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler as any);
    },
  };
}


function lovableProxyPlugin(): Plugin {
  const LOVABLE_API = "https://api.lovable.dev";

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/lovable")) return next();

    const rawUrl  = new URL(req.url, "http://localhost");
    const subpath = "/" + decodeURIComponent(rawUrl.searchParams.get("p") ?? "");
    rawUrl.searchParams.delete("p");
    const qs = rawUrl.search;
    const targetPath = subpath + qs;

    const token = (req.headers["x-lovable-token"] as string) ?? "";

    const forwardHeaders: Record<string, string> = {
      Accept:       (req.headers["accept"] as string) ?? "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; Push44/1.0)",
      Origin:       "https://lovable.dev",
      Referer:      "https://lovable.dev/",
    };
    if (token) forwardHeaders["Authorization"] = `Bearer ${token}`;
    if (req.headers["content-type"]) {
      forwardHeaders["Content-Type"] = req.headers["content-type"] as string;
    }

    let bodyBuf: Buffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyBuf = await new Promise<Buffer>((resolve) => {
        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
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
      res.end(responseText);
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Lovable proxy error: " + (err?.message ?? "unknown") }));
    }
  };

  return {
    name: "lovable-proxy",
    configureServer(server)        { server.middlewares.use(handler as any); },
    configurePreviewServer(server) { server.middlewares.use(handler as any); },
  };
}

function boltProxyPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/bolt/") && req.url !== "/api/bolt" && !req.url?.startsWith("/api/bolt?")) return next();

    const rawReqUrl = new URL(req.url ?? "/", "http://localhost");
    const siteUrlParam = rawReqUrl.searchParams.get("url");
    if (siteUrlParam) {
      try {
        const decodedTarget = decodeURIComponent(siteUrlParam);
        const siteRes = await fetch(decodedTarget, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": (req.headers["accept"] as string) || "*/*",
          },
        });
        const siteBuf = await siteRes.arrayBuffer();
        res.writeHead(siteRes.status, {
          "Content-Type": siteRes.headers.get("content-type") || "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        });
        return res.end(Buffer.from(siteBuf));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        return res.end(JSON.stringify({ error: "Site proxy error: " + (err?.message ?? "unknown") }));
      }
    }

    // token is stored URL-encoded; bolt.new expects the decoded form as the cookie value
    const rawToken = (req.headers["x-bolt-token"] ?? "") as string;
    let token = decodeURIComponent(rawToken).trim();
    token = token.replace(/^cookie:\s*/i, "");
    if (token.includes("__session=")) {
      const match = token.match(/(?:^|;\s*)__session=([^;]+)/);
      if (match) {
        token = match[1].trim();
      } else {
        token = token.replace(/^__session=\s*/i, "").trim();
      }
    }
    token = token.replace(/^["']|["']$/g, "").trim();
    if (token.includes(";") && !token.includes("eyJ")) {
      const first = token.split(";")[0].trim();
      const eq = first.indexOf("=");
      if (eq !== -1) token = first.slice(eq + 1).trim();
    }

    let targetPath = req.url.replace(/^\/api\/bolt(-proxy)?/, "") || "/";
    if (!targetPath.startsWith("/api/") && targetPath !== "/api") {
      targetPath = `/api${targetPath}`;
    }
    const contentType = (req.headers["content-type"] as string) ?? "application/json";

    const forwardHeaders: Record<string, string> = {
      ...(token ? { "Cookie": `__session=${token}` } : {}),
      "Accept":     (req.headers["accept"] as string) ?? "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Origin":     "https://bolt.new",
      "Referer":    "https://bolt.new/",
    };

    // Read body as raw Buffer to support binary ZIP uploads
    let bodyBuf: Buffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyBuf = await new Promise<Buffer>((resolve) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
      if (bodyBuf.length > 0) {
        forwardHeaders["Content-Type"] = contentType;
      }
    }

    try {
      const boltRes = await fetch(`https://bolt.new${targetPath}`, {
        method: req.method ?? "GET",
        headers: forwardHeaders,
        ...(bodyBuf && bodyBuf.length > 0 ? { body: bodyBuf as unknown as BodyInit } : {}),
      });

      const responseText = await boltRes.text();
      res.writeHead(boltRes.status, {
        "Content-Type":                 boltRes.headers.get("content-type") ?? "application/json",
        "Access-Control-Allow-Origin":  "*",
        "Cache-Control":                "no-store",
      });
      res.end(responseText);
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bolt proxy error: " + (err?.message ?? "unknown") }));
    }
  };

  return {
    name: "bolt-proxy",
    configureServer(server) { server.middlewares.use(handler as any); },
    configurePreviewServer(server) { server.middlewares.use(handler as any); },
  };
}

function boltLoginPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== "/api/bolt-login") return next();
    await boltLoginHandler(req, res);
  };

  return {
    name: "bolt-login",
    configureServer(server) { server.middlewares.use(handler as any); },
    configurePreviewServer(server) { server.middlewares.use(handler as any); },
  };
}

function framerProxyPlugin(): Plugin {
  const FRAMER_API_BASE = "https://api.framer.com";
  const FRAMER_WEB_BASE = "https://framer.com";

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/framer")) return next();

    const rawUrl = new URL(req.url, "http://localhost");
    const targetPath = rawUrl.pathname.replace("/api/framer", "") + rawUrl.search;

    const headers = req.headers as Record<string, string>;
    const sessionToken = (headers["x-framer-session"] ?? "").trim();
    const authHeader = (headers["authorization"] ?? "").trim();

    const isWebRoute = targetPath.startsWith("/projects/new") || targetPath.startsWith("/remix");
    const targetBase = isWebRoute ? FRAMER_WEB_BASE : FRAMER_API_BASE;

    const forwardHeaders: Record<string, string> = {
      Accept: headers["accept"] || "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Referer: "https://framer.com/",
      Origin: "https://framer.com",
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
      body = await new Promise<string>((resolve) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      });
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

      const contentType = framerRes.headers.get("content-type") ?? "application/json";
      const buffer = Buffer.from(await framerRes.arrayBuffer());

      res.writeHead(framerRes.status, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(buffer);
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Framer proxy error: " + (err?.message ?? "unknown") }));
    }
  };

  return {
    name: "framer-proxy",
    configureServer(server) { server.middlewares.use(handler as any); },
    configurePreviewServer(server) { server.middlewares.use(handler as any); },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    seoPlugin(),
    ziteProxyPlugin(),
    flootProxyPlugin(),
    lovableProxyPlugin(),
    boltProxyPlugin(),
    boltLoginPlugin(),
    framerProxyPlugin(),
    githubOAuthPlugin(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: [
        "**/.cache/**",
        "**/node_modules/**",
        "**/attached_assets/**",
        "**/.local/**",
        "**/.agents/**",
      ],
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) return "vendor-charts";
          if (id.includes("node_modules/jszip")) return "vendor-jszip";
          if (id.includes("node_modules/@tanstack/react-query")) return "vendor-query";
          if (id.includes("node_modules/@tanstack/react-router") || id.includes("node_modules/@tanstack/router")) return "vendor-router";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "vendor-react";
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
        },
      },
    },
  },
});
