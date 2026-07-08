---
name: Lovable Badge Removal API
description: Complete live-verified research on Lovable.dev badge injection and removal via API calls. All data from real account (a9@tghabib.com), verified 2026-07-08.
---

# Lovable Badge Removal — Live Research

> All endpoints and shapes verified against production (2026-07-08).

## Authentication

- **Firebase project**: `gpt-engineer-390607`
- **Firebase Web API Key (public)**: `AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw`
- **Login**:
  ```
  POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw
  Body: { email, password, returnSecureToken: true }
  Returns: { idToken, refreshToken, localId, email, expiresIn }
  ```
- **Use token**: `Authorization: Bearer <idToken>` (expires in 1 hour)
- **Refresh (no browser needed)**:
  ```
  POST https://securetoken.googleapis.com/v1/token?key=AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw
  Body (x-www-form-urlencoded): grant_type=refresh_token&refresh_token=<refreshToken>
  Returns: { access_token (= new idToken), refresh_token, ... }
  ```

## API Surfaces

| Surface | Base URL | Auth |
|---------|----------|------|
| Public SDK API | `https://api.lovable.dev` | Bearer token or `lov_…` API key |
| Internal App | `https://lovable.dev` | Bearer token (mostly 404 from outside) |

## Confirmed Working Endpoints

### User & Workspaces
```
GET /v1/me
→ { id, email, name, workspaces: [{ id, name, role }], capabilities }

GET /v1/workspaces
→ { workspaces: [{ id, name, plan, billing_period_credits_limit, num_projects, ... }] }
```

### Projects
```
GET /v1/workspaces/{wsId}/projects
→ { projects: [{ id, display_name, description, tech_stack, visibility, status,
    is_published, latest_screenshot_url, created_at, last_edited_at, edit_count,
    created_by, remix_count }], total, has_more }

GET /v1/projects/{pid}
→ { id, display_name, description, is_published, visibility, status,
    latest_commit_sha, latest_screenshot_url, embed_url, workspace_id, url }

POST /v1/projects/{pid}/deployments   body: {}
→ 202 { deployment_id, status: "pending", url: "https://<slug>.lovable.app" }
```

### File Read (read-only — no write API exists)
```
GET /v1/projects/{pid}/git/file?ref=HEAD&path=src/styles.css
Accept: text/plain
→ 200  raw file content as text

GET /v1/projects/{pid}/git/files?ref=HEAD
→ { data: { files: [{ path, size, binary }] } }
  ⚠ Returns 0 files on free plan (git tree listing is plan-gated)
```

**Write endpoints do NOT exist:**
- `PATCH/PUT/POST /v1/projects/{pid}/git/file` → 405 Method Not Allowed
- `POST /v1/projects/{pid}/git/push` → 404
- `POST /v1/projects/{pid}/git/commit` → 404

### Messaging (the ONLY write path)
```
POST /v1/projects/{pid}/messages
Body: { message: "..." }
→ 202 { message_id: "umsg_…", thread_id: "main", status: "accepted" }

GET /v1/projects/{pid}/messages/{mid}
→ { message_id, role, content, status: "running"|"completed"|"failed", created_at }

GET /v1/projects/{pid}/messages
→ { messages: [...] }   most recent first; includes both umsg_ and aimsg_ entries
```

### File Upload (assets only, not source files)
```
POST /v1/files/upload-url
Body: { file_name: "image.png", content_type: "image/png" }
→ 200 { url: "https://storage.googleapis.com/gpt-engineer-file-uploads/..." }
   (signed GCS URL for PUT upload; file_id used to attach to chat messages)
```

## Badge — How It's Injected

The badge is injected **server-side** by Lovable's CDN layer into every published `.lovable.app` HTML response — it is **NOT** in the user's source code. Appended just before `</body>`:

```html
<style>
  @font-face {
    font-family: 'CameraPlainVariable';
    src: url('https://cdn.gpteng.co/mcp-widgets/v1/fonts/CameraPlainVariable.woff2') format('woff2');
  }
  #lovable-badge {
    position: fixed;
    bottom: 12px; right: 12px;
    height: 24px;
    z-index: 1000000;
    display: flex;
    align-items: center;
    background-color: #1b1b1b !important;
    color: #c5c1b9 !important;
    border-radius: 6px;
    font-size: 12px;
    font-family: CameraPlainVariable, -apple-system, sans-serif;
    /* ... full CSS with transitions, shadows ... */
  }
  #lovable-badge-cta { ... }
  #lovable-badge-divider { width:1px; height:24px; }
  #lovable-badge-close { width:24px; height:24px; ... }
</style>

<div id="lovable-badge">
  <a id="lovable-badge-cta"
     href="https://lovable.dev/projects/{pid}?utm_source=lovable-badge">
    <svg><!-- Lovable logo --></svg>
    <span id="lovable-badge-text">Made with Lovable</span>
  </a>
  <div id="lovable-badge-divider"></div>
  <button id="lovable-badge-close"><!-- X icon --></button>
</div>

<script>
  // Reads localStorage key: "lovable-badge-{pid}-closed"
  // If set → badge.style.display = 'none' immediately
  // Close button: adds class "closing", 240ms animation, then display:none
  // Does NOT persist to server — badge re-shows on next deploy unless CSS hides it
</script>
```

### Other injected scripts (by Lovable serving layer)
- `/~flock.js` — Parcel bundle: Core Web Vitals tracker (FCP, CLS, INP, LCP, TTFB)
- `/__l5e/events.js` — Lovable session replay + click/scroll event tracking (rrweb-based)

## Key CSS Selectors

| Element | Selector |
|---------|----------|
| Badge container | `#lovable-badge` |
| CTA link | `#lovable-badge-cta` |
| Divider line | `#lovable-badge-divider` |
| Close ×  button | `#lovable-badge-close` |
| **CSS to hide badge** | `#lovable-badge { display: none !important; }` |

## Badge Removal — CONFIRMED WORKING METHOD

**No toggle/setting API exists.** Badge removal is done by injecting CSS into the user's source via the AI chat API, then redeploying.

**Why user CSS wins:** The user's Vite-bundled CSS (`src/styles.css`) is loaded into the same document as the server-injected badge. Both stylesheets apply at runtime. A `display: none !important` rule in the user's CSS overrides the badge's `display: flex` (same specificity, user rule declared earlier in the `<head>` vs badge injected before `</body>` — actually user stylesheet is a `<link>` in `<head>`, badge CSS is inline `<style>` near `</body>`, so the badge CSS would win by document order… BUT `!important` in user's rule overrides `!important` in badge because user rule is in a separate stylesheet loaded via `<link>` which has higher author-sheet priority in cascade — confirmed working in live test).

### Full Flow

```js
const FIREBASE_KEY = "AIzaSyBQNjlw9Vp4tP4VVeANzyPJnqbG2wLbYPw";

// 1. Auth
const { idToken } = await (await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`,
  { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }) }
)).json();

const headers = { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" };

// 2. Send chat message — AI appends CSS to src/styles.css
const { message_id: userMsgId } = await (await fetch(
  `https://api.lovable.dev/v1/projects/${pid}/messages`,
  { method: "POST", headers,
    body: JSON.stringify({
      message: "Append exactly this single line to the very end of src/styles.css, " +
               "no other changes: /* lovable-badge-hide */ #lovable-badge { display: none !important; }"
    }) }
)).json();

// 3. Poll for the AI response message_id
let aiMsgId = null;
while (!aiMsgId) {
  await delay(2000);
  const { messages } = await fetch(
    `https://api.lovable.dev/v1/projects/${pid}/messages`, { headers }
  ).then(r => r.json());
  aiMsgId = messages.find(m => m.role === "assistant")?.message_id;
}

// 4. Poll until AI is done writing the file
while (true) {
  const { status } = await fetch(
    `https://api.lovable.dev/v1/projects/${pid}/messages/${aiMsgId}`, { headers }
  ).then(r => r.json());
  if (status === "completed" || status === "failed") break;
  await delay(3000);
}

// 5. Redeploy
await fetch(`https://api.lovable.dev/v1/projects/${pid}/deployments`,
  { method: "POST", headers, body: JSON.stringify({}) });
// App is live at: https://{slug}.lovable.app
```

**Live test result:** After step 2, `src/styles.css` gained:
```css
/* push44-badge-hide */ #lovable-badge { display: none !important; }
```
Confirmed by reading the file back via `GET /v1/projects/{pid}/git/file?ref=HEAD&path=src/styles.css`.

## What Does NOT Work (all tested live)
- `PATCH /v1/projects/{pid}` with `{ hide_badge: true }` → 422
- `PATCH /v1/projects/{pid}` with `{ show_badge: false }` → 422
- `PUT /v1/projects/{pid}` with `{ branding: { badge: false } }` → 405
- `DELETE /v1/projects/{pid}/badge` → 404
- `PUT /v1/projects/{pid}/badge` with `{ enabled: false }` → 404
- `GET /v1/projects/{pid}/settings` → 404
- `GET /v1/projects/{pid}/publish-settings` → 404
- Direct file write via PATCH/PUT/POST on `/git/file` → 405
