import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { api: { bodyParser: false } };

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

function parseCookies(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};

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
    .filter(([_, v]) => v !== "")
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
    // ── Step 1: Initiate auth flow on bolt.new to get authorizeUri & __oauth cookie ──
    const initRes = await fetch("https://bolt.new/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Origin": "https://bolt.new",
        "Referer": "https://bolt.new/",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        start: { destination: "https://bolt.new/" },
        upgrade: false,
        ssoFlow: false,
      }),
    });

    if (!initRes.ok) {
      return jsonError(res, 502, "Could not initiate bolt.new session. Please try again or use the Session Cookie tab.");
    }

    const boltInitCookies = parseCookies(initRes.headers);
    const initData = await initRes.json().catch(() => ({})) as any;
    const authorizeUri = String(initData?.authorizeUri ?? "");

    if (!authorizeUri) {
      return jsonError(res, 502, "No authorization URL returned from bolt.new. Please use the Session Cookie tab.");
    }

    // ── Step 2: StackBlitz sign_in with redirect_to authorizeUri ─────────────
    const rawAuthUrl = new URL(authorizeUri);
    rawAuthUrl.searchParams.set("bolt_oauth_provider", "login_password");
    const oauthRelative = rawAuthUrl.pathname + rawAuthUrl.search;
    const signInUrl = `https://stackblitz.com/sign_in?redirect_to=${encodeURIComponent(oauthRelative)}`;

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

    if (!csrf) {
      return jsonError(res, 502, "Could not extract StackBlitz CSRF token. Try again later.");
    }

    // ── Step 3: Check SSO (optional) ──────────────────────────────────────────
    try {
      const ssoRes = await fetch(
        `https://stackblitz.com/api/users/sessions/sso?login=${encodeURIComponent(email)}`,
        {
          headers: {
            "Cookie": buildCookieHeader(signInCookies),
            "x-csrf-token": csrf,
            "User-Agent": UA,
            "Accept": "application/json",
            "Referer": signInUrl,
          },
        }
      );
      if (ssoRes.ok) {
        const sso = await ssoRes.json().catch(() => ({})) as any;
        if (sso.forceSSO) {
          return jsonError(res, 400,
            "This account uses Google or GitHub sign-in. " +
            "Please switch to the Session Cookie tab and paste your __session cookie from bolt.new."
          );
        }
      }
    } catch { /* non-fatal — proceed with login attempt */ }

    // ── Step 4: POST credentials to StackBlitz ───────────────────────────────
    const loginRes = await fetch("https://stackblitz.com/api/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
        "x-requested-with": "XMLHttpRequest",
        "Cookie": buildCookieHeader(signInCookies),
        "Origin": "https://stackblitz.com",
        "Referer": signInUrl,
        "User-Agent": UA,
        "Accept": "application/json",
      },
      body: JSON.stringify({ user: { login: email, password } }),
    });

    if (loginRes.status === 401 || loginRes.status === 422) {
      return jsonError(res, 401, "Invalid email or password. Please check your credentials.");
    }
    if (loginRes.status !== 204) {
      return jsonError(res, 502, `StackBlitz login failed (HTTP ${loginRes.status}). Please try again.`);
    }

    const loginCookies = parseCookies(loginRes.headers);
    const sbSessionJar = { ...signInCookies, ...loginCookies };

    // ── Step 5: Execute direct authorize request on StackBlitz ───────────────
    const authorizeRes = await fetch(`https://stackblitz.com${oauthRelative}`, {
      method: "GET",
      redirect: "manual",
      headers: {
        "Cookie": buildCookieHeader(sbSessionJar),
        "User-Agent": UA,
        "Referer": "https://stackblitz.com/",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    const boltRedirectLoc = authorizeRes.headers.get("location");
    if (!boltRedirectLoc) {
      return jsonError(res, 502, "StackBlitz did not return a redirect to bolt.new.");
    }

    // ── Step 6: Visit bolt.new/oauth2 with bolt cookies to update __oauth ────
    const oauth2Res = await fetch(boltRedirectLoc, {
      headers: {
        "Cookie": buildCookieHeader(boltInitCookies),
        "User-Agent": UA,
        "Referer": "https://stackblitz.com/",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    const oauth2Cookies = parseCookies(oauth2Res.headers);
    const combinedBoltCookies = { ...boltInitCookies, ...oauth2Cookies };

    // ── Step 7: POST /api/sessions finish: true on bolt.new to obtain __session ──
    const finishRes = await fetch("https://bolt.new/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": buildCookieHeader(combinedBoltCookies),
        "User-Agent": UA,
        "Origin": "https://bolt.new",
        "Referer": boltRedirectLoc,
        "Accept": "application/json",
      },
      body: JSON.stringify({ finish: true, upgrade: false, firstLogin: false }),
    });

    if (!finishRes.ok) {
      return jsonError(res, 502, `bolt.new could not finalize login (HTTP ${finishRes.status}). Please use the Session Cookie tab.`);
    }

    const finishCookies = parseCookies(finishRes.headers);
    const sessionToken = finishCookies["__session"] ? decodeURIComponent(finishCookies["__session"]) : "";

    if (!sessionToken) {
      return jsonError(res, 502, "Login succeeded but no session token was received from bolt.new.");
    }

    const finishData = await finishRes.json().catch(() => ({})) as any;
    const returnedEmail = finishData?.userData?.user?.email || email;

    return jsonOk(res, { token: sessionToken, email: returnedEmail });

  } catch (err: any) {
    const msg = err?.message ?? "Unexpected error during login";
    return jsonError(res, 500, msg);
  }
}
