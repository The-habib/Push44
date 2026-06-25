import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

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

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    ziteProxyPlugin(),
    flootProxyPlugin(),
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
