# Bolt.new API — Reverse Engineering Research

> **Status:** Fully verified via live API calls (July 5 2026).  
> All endpoints below were tested against a real account and project.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Confirmed API Endpoints](#confirmed-api-endpoints)
4. [Badge Removal — Full Analysis](#badge-removal--full-analysis)
5. [badge.js Internals](#badgejs-internals)
6. [Badge Blocker Code](#badge-blocker-code)
7. [Deploy ZIP Format](#deploy-zip-format)
8. [Complete Removal Workflow](#complete-removal-workflow)
9. [Permanence & Limitations](#permanence--limitations)
10. [Project Listing — Unresolved](#project-listing--unresolved)
11. [Push44 Integration Checklist](#push44-integration-checklist)

---

## Overview

Bolt.new (by StackBlitz) is a browser-based AI app builder. Deployed projects live on `*.bolt.host` (via Netlify Edge + Cloudflare). The "Made in Bolt" badge is injected as an **async script tag** directly into the CDN-generated HTML on every published project.

This document covers every API endpoint needed to:
- Authenticate as a user
- Inspect and deploy to a project
- Remove the "Made in Bolt" badge **permanently**

---

## Authentication

### Cookie name
```
__session
```

The session token is a **custom encrypted JWT-like format** (NOT a standard JWT). It is URL-encoded when stored in the browser cookie.

```
__session=eyJkIjoiMTVoOUty...%3D%3D.NZlTYWxh%2B...
```

When sending via code, **URL-decode it first**:
```javascript
const token = decodeURIComponent(rawCookieValue);
```

### How to get the session token

1. Go to [bolt.new](https://bolt.new) and log in
2. Open DevTools → Application → Cookies → `bolt.new`
3. Find the cookie named `__session`
4. Copy the **Value** field (it is URL-encoded — copy as-is)

### Headers required

Every authenticated API request needs:
```http
Cookie: __session=<decoded-token>
Origin: https://bolt.new
Referer: https://bolt.new/
User-Agent: Mozilla/5.0 ...
Accept: application/json
```

---

## Confirmed API Endpoints

All endpoints are on `https://bolt.new`.

### GET `/api/deploy/{projectId}`
Returns the current deployment state of a project.

**Response (200):**
```json
{
  "kind": "static-hosting",
  "site_url": "https://robot.bolt.host",
  "is_custom_domain": false,
  "updated_at": "2026-07-05T12:41:09.220Z"
}
```

Returns `401` if session is invalid, `404` if projectId is wrong.

---

### PUT `/api/deploy/{projectId}`
Deploy a new build to **staging**. Body is a raw ZIP file.

```http
PUT /api/deploy/65925718 HTTP/1.1
Content-Type: application/zip
Cookie: __session=<token>
Origin: https://bolt.new

<zip bytes>
```

**Response (200):**
```json
{
  "deploy_url": "https://6a4a50e45dadd64c2b7cf698--profound-marigold-a5e80e.netlify.app"
}
```

The `deploy_url` is a Netlify staging preview URL — **not live yet**.

---

### POST `/api/deploy/{projectId}/promote`
Promotes the latest staging deployment to the **live domain**.

```http
POST /api/deploy/65925718/promote HTTP/1.1
Content-Type: application/json
Cookie: __session=<token>
Origin: https://bolt.new

{}
```

**Response (200):**
```json
{
  "site_url": "https://robot.bolt.host",
  "updated_at": "2026-07-05T12:48:14.061Z",
  "kind": "static-hosting",
  "is_custom_domain": false,
  "claimed": true
}
```

---

### GET `/api/projects/{projectId}/badge`
Returns the server-side badge flag for the project.

```
200 false   ← badge disabled
200 true    ← badge enabled
```

---

### DELETE `/api/deploy/{projectId}/badge`
Sets the server-side badge flag to `false`.

```
204 No Content  ← success
```

> ⚠️ **Important limitation:** This endpoint toggles an internal flag but does **not** remove the `<script src="badge.js">` tag from the CDN-generated HTML. The HTML injection is unconditional in bolt.new's CDN. Use this alongside the JS bundle blocker (see below).

---

### GET `/api/projects/{projectId}/staging-deployment`
Returns the current staging deployment, or `null` if none.

```
200 null       ← no staging deployment
200 { ... }   ← staging deployment exists
```

---

## Badge Removal — Full Analysis

### How the badge is injected

bolt.new's CDN **always** adds this into the `<head>` of the served HTML, regardless of any API settings:

```html
<script async src="https://bolt.new/badge.js?s=8d94127a-db9b-4312-8e6e-aefc2d2d2ca3"></script>
```

The `s` parameter is the **site ID** (a UUID, different from the numeric project ID). It is embedded in the live HTML and cannot be changed.

### Why the HTML cannot be overridden

When you deploy a ZIP to bolt.new, the `index.html` in your ZIP is **ignored**. bolt.new's CDN generates and serves its own HTML, which always includes the badge script. This was verified by deploying a ZIP with a modified `index.html` (badge tag removed) — the live site still served bolt.new's own HTML with the badge tag.

### Why the `DELETE /badge` endpoint alone is not enough

Tested: `DELETE /api/deploy/{pid}/badge` → 204, `GET /api/projects/{pid}/badge` → `false`.  
Then: full redeploy (PUT + POST promote).  
Result: HTML **still** contained `badge.js`.  

The server-side flag does not suppress CDN HTML injection. It may be reserved for a Pro-plan feature or internal use.

---

## badge.js Internals

URL: `https://bolt.new/badge.js?s={siteId}`  
Size: ~25 KB (includes an embedded Inter font in base64)

### Deobfuscated logic

```javascript
"use strict";
(function() {
  function C() {
    // 1. Embed Inter font via @font-face
    const x = "d09G..."; // ~21KB base64 woff2 font
    const b = "...";     // second weight
    const c = "Inter-NjBkMDQwOTZj"; // font-family name

    // 2. Helper functions
    function l(e) { return document.createElement(e); }
    function A(e, t) { e.appendChild(t); }  // ← only insertion method used

    // 3. Detect WebContainer environment (bolt.new editor)
    const d = typeof webcontainer !== "undefined"; // false on published sites

    // 4. Create badge HOST element — THIS IS WHAT WE MUST INTERCEPT
    const r = l("div");
    Object.assign(r.style, {
      position: "fixed",
      bottom: "1rem",
      right: "1rem",
      zIndex: "2147483647"  // ← Max int32 — THE KEY FINGERPRINT
    });

    // 5. Attach Shadow DOM (open mode) and build badge UI inside it
    const a = r.attachShadow({ mode: "open" });
    const p = d ? "div" : "a";  // anchor on public sites, div in editor
    a.innerHTML = `<${p} class="badge">...</${p}><div class="dialog">...</div>`;
    // ... (badge styled, SVG logo added, "Made in Bolt" text)

    // 6. Create font style element
    const g = l("style");
    g.innerHTML = `@font-face { font-family: ${c}; ... }`;

    // 7. In WebContainer: add hover interactions (not relevant for public sites)
    if (d) { /* hover show/hide dialog */ }

    // 8. INSERTION — guarded by flag to prevent double-run
    let f = false;
    function u() {
      if (f) return;
      f = true;
      A(document.body, g);  // append font style
      A(document.body, r);  // append badge host div  ← BLOCK THIS
    }

    setTimeout(u, 1500);                        // fallback: fires after 1.5s
    document.addEventListener("DOMContentLoaded", u);  // primary: fires when DOM ready
  }

  C();
})();
```

### Key facts for interception

| Property | Value |
|---|---|
| Element type | `div` (host) with Shadow DOM |
| `style.zIndex` | `"2147483647"` (max int32 — highly specific) |
| `style.position` | `"fixed"` |
| `style.bottom` | `"1rem"` |
| `style.right` | `"1rem"` |
| Shadow mode | `"open"` |
| Insertion method | `document.body.appendChild(r)` |
| Double-insert guard | `let f = false` — set to `true` after first run |
| Insertion triggers | `DOMContentLoaded` + `setTimeout(1500ms)` |

### Why the previous attempt failed

The prior research session prepended a blocker that checked `node.innerHTML.includes('badge')`.  
**This does NOT work** because the badge content is in the **Shadow DOM**, not in the host element's `innerHTML`. `div.innerHTML` on the badge host element returns `""`.

The correct fingerprint is `node.style.zIndex === '2147483647'`.

---

## Badge Blocker Code

This code must be **prepended** to the user's deployed JavaScript bundle. It runs before badge.js can insert anything (the bundle is `type="module"` deferred, giving us a reliable early-execution window), and the MutationObserver catches any late insertions.

```javascript
;(function removeBoltBadge() {
  // Fingerprint: the bolt.new badge host div has a unique max-int32 z-index
  function isBadge(n) {
    return n &&
           n.nodeType === 1 &&
           n.tagName === 'DIV' &&
           n.style &&
           n.style.zIndex === '2147483647' &&
           n.style.position === 'fixed';
  }

  // Remove any badge already in the DOM (handles case where badge.js ran first)
  function sweep() {
    try {
      document.querySelectorAll('div').forEach(function(el) {
        if (isBadge(el)) el.remove();
      });
    } catch(e) {}
  }

  // MutationObserver: intercept future insertions synchronously
  var obs = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (isBadge(n)) n.remove();
      });
    });
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // Sweep immediately (in case badge already exists)
  sweep();
  // Sweep at 500ms (catches early DOMContentLoaded path)
  setTimeout(sweep, 500);
  // Sweep at 1700ms (just after badge.js's 1500ms setTimeout fallback)
  setTimeout(sweep, 1700);
  // Sweep at 3000ms (belt-and-suspenders)
  setTimeout(sweep, 3000);
  // Also on DOMContentLoaded (our module is deferred, so we run before this event)
  document.addEventListener('DOMContentLoaded', sweep);
})();
```

### Why this is permanent per page load

Once `u()` runs in badge.js, the guard `f` is set to `true`. Even if our code removes `r` from the DOM after badge.js inserted it, badge.js will never try to re-insert it. **Removing it once is sufficient.**

### Why this approach is reliable even under bad timing

| Scenario | Handled by |
|---|---|
| Our bundle loads before badge.js | MutationObserver intercepts the insertion |
| badge.js DOMContentLoaded fires first | `setTimeout(sweep, 500)` removes it |
| badge.js setTimeout(1500) fires first | `setTimeout(sweep, 1700)` removes it |
| Both fire before our bundle loads | `sweep()` on bundle init + `setTimeout(sweep, 3000)` |

---

## Deploy ZIP Format

The ZIP must be a valid DEFLATE-compressed ZIP containing the site's static files. bolt.new serves these from Netlify.

### Required files

```
index.html                        ← included but IGNORED by CDN (bolt.new serves its own HTML)
assets/index-[contenthash].js     ← MODIFIED: badge blocker prepended
assets/index-[contenthash].css    ← original, unmodified
vite.svg                          ← original favicon
```

> The `[contenthash]` filenames come from Vite's build. They must **exactly match** what the bolt.new CDN's HTML references (e.g., `index-DECuZBpD.js`). These are discovered by fetching the live HTML at `{site_url}`.

### ZIP construction (Node.js, no external deps)

```javascript
// Uses native node:zlib deflateRaw + manual ZIP format assembly
// Full working implementation: see push44 codebase (bolt-api.ts)
```

### Upload format

```http
PUT https://bolt.new/api/deploy/{projectId}
Content-Type: application/zip
Content-Length: <bytes>
Cookie: __session=<token>

<raw zip bytes>
```

---

## Complete Removal Workflow

```
User provides:
  - __session cookie value
  - Project ID (from bolt.new URL: bolt.new/~/PROJECT_ID)

Step 1: GET /api/deploy/{pid}
  → Confirm project exists, get site_url (e.g. robot.bolt.host)

Step 2: GET https://{site_url}/
  → Parse HTML: find JS bundle filename and CSS filename
    <script type="module" src="/assets/index-HASH.js">
    <link rel="stylesheet" href="/assets/index-HASH.css">
  → Also extract siteId from: <script src="https://bolt.new/badge.js?s=SITE_ID">

Step 3: Download assets
  → GET https://{site_url}/assets/index-HASH.js   (main JS bundle)
  → GET https://{site_url}/assets/index-HASH.css  (CSS)
  → GET https://{site_url}/vite.svg               (favicon)
  → GET https://{site_url}/                       (original HTML, for reference)

Step 4: Modify JS bundle
  → Prepend BADGE_BLOCKER_CODE to the JS bundle bytes

Step 5: DELETE /api/deploy/{pid}/badge
  → Sets server-side badge flag to false (204 response)
  → May suppress badge in future platform-generated deploys

Step 6: Build ZIP
  → index.html (original, will be ignored by CDN)
  → assets/index-HASH.js (modified with blocker)
  → assets/index-HASH.css (original)
  → vite.svg (original)

Step 7: PUT /api/deploy/{pid}  (Content-Type: application/zip)
  → Response: { deploy_url: "https://xxx.netlify.app" } (staging)

Step 8: POST /api/deploy/{pid}/promote  (body: {})
  → Response: { site_url: "https://xxx.bolt.host", updated_at: ... }

Step 9: Verify
  → GET https://{site_url}/assets/index-HASH.js
  → Confirm response starts with badge blocker code
  → Screenshot or fetch live page to confirm badge is gone
```

---

## Permanence & Limitations

### What "permanent" means in practice

| Scenario | Badge status |
|---|---|
| User visits site immediately after Push44 removes badge | ✅ Gone |
| User visits site days/weeks later (no new deploy) | ✅ Gone |
| User makes changes in bolt.new editor and redeploys | ❌ Badge returns (new build, new JS hash) |
| User runs Push44 again after new deploy | ✅ Gone again |

### Why the badge returns after a new editor deploy

When the user saves new changes in bolt.new's editor:
1. bolt.new generates a new Vite build with a new content-hashed JS bundle (e.g., `index-XYZnew.js`)
2. The HTML is updated to reference `index-XYZnew.js`
3. Our modified `index-DECuZBpD.js` is still on Netlify but the HTML no longer references it
4. `index-XYZnew.js` is the unmodified user app bundle — no badge blocker

### The server-side flag (`DELETE /badge`) does not help

Tested and confirmed: even with the badge flag set to `false`, every full redeploy cycle (PUT + POST promote) continues to serve HTML with `badge.js` injected. The CDN badge injection is unconditional.

### Recommended UX for Push44

- Tell users: **"Run Push44 again after you make changes in bolt.new"**  
- Optionally detect staleness: compare `updated_at` from `GET /api/deploy/{pid}` against the timestamp Push44 last ran

---

## Project Listing — Unresolved

`GET /api/projects` returns HTTP `400` (no body) regardless of query parameters tried:
- `?page=1`, `?limit=20`, `?userId=me`, `?owner=me`, `?per_page=100`

Methods tried: GET, POST — GET returns 400, POST returns 405.

**Workaround for Push44:** Ask the user to provide their **Project ID** manually. It appears in the bolt.new editor URL:
```
https://bolt.new/~/PROJECT_ID
```
For example: `https://bolt.new/~/65925718` → Project ID is `65925718`.

The `GET /api/deploy/{pid}` endpoint confirms the project and returns the live URL.

---

## Push44 Integration Checklist

### UI inputs needed from user
- [ ] `__session` cookie value (with copy instructions)
- [ ] Project ID (with screenshot showing where to find it in the URL)

### API calls to implement in `src/lib/bolt-api.ts`
- [ ] `validateBoltToken({ token })` → `GET /api/deploy/{pid}` (or any endpoint that confirms auth)
- [ ] `getBoltDeployInfo({ token, projectId })` → `GET /api/deploy/{pid}` 
- [ ] `getBoltBadgeState({ token, projectId })` → `GET /api/projects/{pid}/badge`
- [ ] `removeBoltBadge({ token, projectId })` → full workflow (Steps 1–9 above)
- [ ] `getBoltSiteHtml({ siteUrl })` → parse bundle filenames + siteId from live HTML

### Proxy needed?
Bolt.new's API does **not** appear to enforce CORS restrictions on the confirmed endpoints. Direct browser fetch should work. Verify in production before assuming no proxy is needed.

### ZIP builder
Implement in pure TypeScript using `node:zlib` deflateRaw (no external deps). Reference implementation already written during this research session (creates valid DEFLATE-compressed ZIP with local file headers + central directory + EOCD record).

---

## Notes & Gotchas

1. **Session expiry**: The `__session` cookie expires. Users will need to re-copy it when it does. The error returned is `{"code":"login-required","message":"Login Required","isRetryable":false}` (401).

2. **Content-hash filenames**: The JS/CSS filenames change with every bolt.new build. Always discover them fresh from the live HTML — never hardcode them.

3. **`type="module"` execution order**: The app bundle is loaded as `<script type="module">` (deferred). badge.js is loaded as `<script async>`. Module scripts execute after HTML parsing but before `DOMContentLoaded`. This gives our blocker code reliable early access to set up the MutationObserver before badge.js's DOMContentLoaded listener fires.

4. **Shadow DOM**: The badge host element's `innerHTML` is always `""` — the badge UI lives in the Shadow DOM. Never check `innerHTML` to identify the badge element. Always check `style.zIndex === '2147483647'`.

5. **`f` flag is idempotent**: badge.js's guard flag `f` means removing the badge once is sufficient. It will never re-insert for the lifetime of the page.

6. **Netlify staging URLs**: Staging URLs (`*.netlify.app`) are valid for inspection but are not the live domain. Always promote after staging.

7. **Project ID format**: Numeric (e.g., `65925718`), not a UUID.

8. **Site ID format**: UUID (e.g., `8d94127a-db9b-4312-8e6e-aefc2d2d2ca3`), found in the badge.js script tag in the live HTML. Not currently used in the removal flow but useful for identification.
