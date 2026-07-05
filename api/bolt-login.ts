import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";

export const config = { api: { bodyParser: false } };

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generatePKCE() {
  const verifier  = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

// ── Body reader ───────────────────────────────────────────────────────────────

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data",  (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end",   () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", () => resolve(""));
  });
}

// ── Cookie parser ─────────────────────────────────────────────────────────────
// Handles the multi-value Set-Cookie header correctly across Node versions.

function parseCookies(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};

  // Node 18.14+ / Node 20+ exposes getSetCookie() which returns an array
  // and avoids the ambiguous comma-join problem.
  const rawList: string[] =
    typeof (headers as any).getSetCookie === "function"
      ? (headers as any).getSetCookie()
      : (headers.get("set-cookie") ?? "").split(/,\s*(?=[a-zA-Z_]+=)/);

  for (const raw of rawList) {
    const nameVal = raw.split(";")[0].trim();
    const eq = nameVal.indexOf("=");
    if (eq === -1) continue;
    const name  = nameVal.slice(0, eq).trim();
    const value = nameVal.slice(eq + 1).trim();
    if (name) result[name] = value;
  }
  return result;
}

function buildCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

// ── Handler ───────────────────────────────────────────────────────────────────

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

function jsonError(res: ServerResponse, status: number, message: string) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify({ error: message }));
}

function jsonOk(res: ServerResponse, body: unknown) {
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method !== "POST")    { return jsonError(res, 405, "Method not allowed"); }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let email = "", password = "";
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw);
    email    = String(body.email    ?? "").trim();
    password = String(body.password ?? "");
  } catch {
    return jsonError(res, 400, "Invalid JSON body");
  }

  if (!email || !password) {
    return jsonError(res, 400, "email and password are required");
  }

  try {
    // ── Step 1: Generate PKCE + construct authorizeUri ─────────────────────
    // We bypass bolt.new's /api/sessions (CF-blocked from non-browser) by
    // constructing the standard PKCE OAuth2 URL directly — equivalent result.
    const { verifier, challenge } = generatePKCE();
    const state = crypto.randomUUID();

    const oauthPath =
      `/oauth/authorize?client_id=bolt&response_type=code` +
      `&redirect_uri=${encodeURIComponent("https://bolt.new/oauth2")}` +
      `&code_challenge_method=S256&code_challenge=${challenge}` +
      `&state=${state}&scope=public&bolt_oauth_provider=login_password`;

    const signInUrl =
      `https://stackblitz.com/sign_in?redirect_to=${encodeURIComponent(oauthPath)}`;

    // ── Step 2: GET StackBlitz sign_in page → CSRF token + session cookie ──
    const signInRes = await fetch(signInUrl, {
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml" },
      redirect: "follow",
    });

    if (!signInRes.ok) {
      return jsonError(res, 502, "Could not load StackBlitz login page. Try again later.");
    }

    const signInCookies = parseCookies(signInRes.headers);
    const html = await signInRes.text();
    const csrf = html.match(/<meta name="csrf-token" content="([^"]+)"/)?.[1] ?? "";
    const sbSession = signInCookies["_stackblitz_session"] ?? "";

    if (!csrf || !sbSession) {
      return jsonError(res, 502, "Could not load StackBlitz login page (missing CSRF or session). Try again later.");
    }

    // ── Step 3: Check SSO (optional) ────────────────────────────────────────
    // If forceSSO is true the account uses Google/GitHub — can't use password.
    try {
      const ssoRes = await fetch(
        `https://stackblitz.com/api/users/sessions/sso?login=${encodeURIComponent(email)}`,
        {
          headers: {
            "Cookie":           buildCookieHeader({ _stackblitz_session: sbSession }),
            "x-csrf-token":     csrf,
            "User-Agent":       UA,
            "Accept":           "application/json",
            "Referer":          signInUrl,
          },
        }
      );
      if (ssoRes.ok) {
        const sso = await ssoRes.json().catch(() => ({})) as any;
        if (sso.forceSSO) {
          return jsonError(res, 400,
            "This account uses Google or GitHub sign-in. " +
            "Please use the Session Cookie tab instead and paste your __session cookie from bolt.new."
          );
        }
      }
    } catch { /* non-fatal — proceed with login attempt */ }

    // ── Step 4: POST credentials to StackBlitz ─────────────────────────────
    const loginRes = await fetch("https://stackblitz.com/api/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-csrf-token":      csrf,
        "x-requested-with":  "XMLHttpRequest",
        "Cookie":            buildCookieHeader({ _stackblitz_session: sbSession }),
        "Origin":            "https://stackblitz.com",
        "Referer":           signInUrl,
        "User-Agent":        UA,
        "Accept":            "application/json",
      },
      body: JSON.stringify({ user: { login: email, password } }),
    });

    if (loginRes.status === 401 || loginRes.status === 422) {
      return jsonError(res, 401, "Invalid email or password. Please check your credentials.");
    }
    if (loginRes.status !== 204) {
      return jsonError(res, 502,
        `StackBlitz login failed (HTTP ${loginRes.status}). Please try again.`
      );
    }

    // Grab updated session cookies from the login response
    const loginCookies = parseCookies(loginRes.headers);
    const newSbSession = loginCookies["_stackblitz_session"] ?? sbSession;
    // Merge: start from sign_in cookies, then overlay login cookies
    const sessionJar: Record<string, string> = {
      ...signInCookies,
      ...loginCookies,
    };

    // ── Step 5: GET /oauth/authorize → 302 → bolt.new/oauth2?code=… ────────
    const authRes = await fetch(`https://stackblitz.com${oauthPath}`, {
      method:   "GET",
      redirect: "manual",
      headers: {
        "Cookie":       buildCookieHeader({ ...sessionJar, _stackblitz_session: newSbSession }),
        "Origin":       "https://stackblitz.com",
        "Referer":      signInUrl,
        "User-Agent":   UA,
        "Accept":       "text/html,application/xhtml+xml",
      },
    });

    const location = authRes.headers.get("location") ?? "";
    if (!location) {
      // StackBlitz might return a form page if something went wrong
      return jsonError(res, 502, "OAuth authorization failed — no redirect received. Please try again.");
    }

    // The redirect should go to https://bolt.new/oauth2?code=…&state=…
    const redirectUrl = location.startsWith("https://")
      ? new URL(location)
      : new URL(location, "https://stackblitz.com");

    const code          = redirectUrl.searchParams.get("code");
    const returnedState = redirectUrl.searchParams.get("state");

    if (!code) {
      return jsonError(res, 502, "OAuth authorization failed — no code in redirect. Please try again.");
    }
    // Require state to be present and exactly match — missing state is a failure.
    if (!returnedState || returnedState !== state) {
      return jsonError(res, 502, "OAuth state mismatch — please try again.");
    }

    // ── Step 6: Exchange code at bolt.new/oauth2 → Set-Cookie __session ────
    // Include code_verifier so bolt.new can complete the PKCE validation with
    // StackBlitz when it exchanges the code server-side for an access token.
    const oauth2Url =
      `https://bolt.new/oauth2?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&code_verifier=${encodeURIComponent(verifier)}`;

    const token = await exchangeCodeForSession(oauth2Url);
    if (!token) {
      return jsonError(res, 502,
        "Login succeeded on StackBlitz but bolt.new did not set a session. " +
        "Please try again or use the Session Cookie tab."
      );
    }

    return jsonOk(res, { token, email });

  } catch (err: any) {
    const msg = err?.message ?? "Unexpected error during login";
    return jsonError(res, 500, msg);
  }
}

// ── Code → session exchange ───────────────────────────────────────────────────

const ALLOWED_REDIRECT_HOSTS = new Set(["bolt.new", "www.bolt.new"]);

async function exchangeCodeForSession(oauth2Url: string): Promise<string | null> {
  // bolt.new/oauth2 may take 1–2 hops of redirects before the session cookie is set.
  // We only follow redirects within the bolt.new domain to avoid SSRF.
  const visited = new Set<string>();
  let url = oauth2Url;
  const UA_HDR = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

  for (let hop = 0; hop < 6; hop++) {
    if (visited.has(url)) break;
    visited.add(url);

    // Safety: only follow redirects to bolt.new — reject any off-domain Location.
    const parsedUrl = new URL(url);
    if (!ALLOWED_REDIRECT_HOSTS.has(parsedUrl.hostname)) break;

    const r = await fetch(url, {
      method:   "GET",
      redirect: "manual",
      headers: {
        "User-Agent": UA_HDR,
        "Referer":    "https://stackblitz.com/",
        "Accept":     "text/html,application/xhtml+xml",
      },
    });

    // Check for __session in this response's Set-Cookie
    const cookies = parseCookies(r.headers);
    if (cookies["__session"]) {
      return decodeURIComponent(cookies["__session"]);
    }

    // Follow redirect if present — validate host before following
    const next = r.headers.get("location");
    if (!next) break;
    const nextUrl = next.startsWith("https://")
      ? new URL(next)
      : new URL(next, "https://bolt.new");
    if (!ALLOWED_REDIRECT_HOSTS.has(nextUrl.hostname)) break;
    url = nextUrl.toString();
  }

  return null;
}
