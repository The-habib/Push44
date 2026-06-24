import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

function flootProxyPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/proxy/floot")) {
      return next();
    }

    const token = (req.headers["x-floot-token"] as string) ?? "";
    const targetPath = req.url.replace("/proxy/floot", "") || "/";

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
});
