---
name: Bolt.new API Patterns
description: Confirmed auth, deploy, badge endpoints and badge removal strategy for bolt.new integration in Push44
---

# Bolt.new API — Confirmed Patterns

**Why:** Reverse-engineered via live API calls (July 5 2026) against a real account. Full research in `docs/research/bolt-new-api.md`.

## Auth
- Cookie name: `__session`
- Value: URL-decode the raw cookie value before sending
- Headers required: `Cookie`, `Origin: https://bolt.new`, `Referer: https://bolt.new/`
- Expired session: `{"code":"login-required","message":"Login Required","isRetryable":false}` (401)

## Key Endpoints (all on `https://bolt.new`)
- `GET /api/deploy/{pid}` → `{kind, site_url, is_custom_domain, updated_at}` — confirms project + live URL
- `PUT /api/deploy/{pid}` — Content-Type: application/zip, body: zip bytes → `{deploy_url}` (staging)
- `POST /api/deploy/{pid}/promote` — body: `{}` → `{site_url, updated_at, ...}` (promotes to live)
- `GET /api/projects/{pid}/badge` → `true|false` (server-side badge flag)
- `DELETE /api/deploy/{pid}/badge` → 204 (sets badge flag false — does NOT remove CDN HTML injection)
- `GET /api/projects` → 400 always (project listing unresolved — user must provide projectId manually)

## Badge Removal — Confirmed Working ✅
**Two-layer approach:**

### Layer 1 (server-side): `DELETE /api/deploy/{pid}/badge`
Sets internal flag to false. Purpose unclear — does NOT suppress `badge.js` from CDN HTML.

### Layer 2 (JS bundle modification) — the real fix
Prepend this to the deployed JS bundle before PUT/promote:

```javascript
;(function removeBoltBadge(){
  function isBadge(n){return n&&n.nodeType===1&&n.tagName==='DIV'&&n.style&&n.style.zIndex==='2147483647'&&n.style.position==='fixed';}
  function sweep(){try{document.querySelectorAll('div').forEach(function(el){if(isBadge(el))el.remove();});}catch(e){}}
  var obs=new MutationObserver(function(muts){muts.forEach(function(m){m.addedNodes.forEach(function(n){if(isBadge(n))n.remove();});});});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  sweep();setTimeout(sweep,500);setTimeout(sweep,1700);setTimeout(sweep,3000);
  document.addEventListener('DOMContentLoaded',sweep);
})();
```

**Why zIndex `2147483647`:** badge.js sets `r.style.zIndex = "2147483647"` (max int32). This is the reliable fingerprint. Do NOT check `innerHTML` — badge content is in shadow DOM and `innerHTML` returns `""` on host element.

**Why previous agent's approach failed:** They checked `innerHTML.includes('badge')` — wrong for shadow DOM.

## badge.js Structure (deobfuscated key parts)
```javascript
let d = typeof webcontainer < "u"; // false on public sites
let r = l("div"); // badge host — fingerprinted by zIndex
Object.assign(r.style, {position:"fixed",bottom:"1rem",right:"1rem",zIndex:"2147483647"});
let a = r.attachShadow({mode:"open"}); // shadow DOM!
let g = l("style"); // font @font-face element
let f = !1;
function u(){f||(f=!0,A(document.body,g),A(document.body,r));} // f flag prevents re-insert
setTimeout(u,1500); document.addEventListener("DOMContentLoaded",u);
```

## Deploy ZIP Structure
- `index.html` — included but IGNORED by bolt.new CDN (they serve their own HTML)
- `assets/index-[HASH].js` — MODIFIED: badge blocker prepended
- `assets/index-[HASH].css` — original
- `vite.svg` — original
- Filenames discovered from live HTML (`<script type="module" src="/assets/index-HASH.js">`)

## Permanence Limitation
Badge removal lasts until user deploys new changes from bolt.new editor (new build = new content hash = our modified bundle is no longer referenced). Users must re-run Push44 after each new editor deploy.

## How to Apply
**How to apply:** Follow the 9-step workflow in `docs/research/bolt-new-api.md` → "Complete Removal Workflow".

## URL Normalization (added 2026-07-05)
`d.site_url` from bolt.new's deploy API returns a full URL with protocol (e.g. `https://robot.bolt.host`). Always strip `https?://` and trailing `/` when storing `siteUrl`, otherwise downstream code like `https://${siteUrl}/` produces double-protocol URLs. Normalize at the source in `validateBoltProject` and in `removeBoltBadge`'s return value.
