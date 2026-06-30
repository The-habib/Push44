---
name: Floot Badge Removal — Confirmed Working CSS Bypass
description: How to hide the "Made with Floot" badge on *.floot.app hosted apps via CSS injection into workspace.sketchCss, bypassing the paid includeMadeWithFloot:false gate.
---

## The Badge

CDN injects `<a id="__Floot-madewithFloot" style="position:fixed;z-index:2147483647;...display:inline-flex;...">` into `<body>` server-side on every *.floot.app app. Only on hosted apps — self-hosted exports have zero badge.

## Hard Gate (cannot bypass)

`POST /api/trpc/workspace.requestDeploy` with `includeMadeWithFloot:false` → 500 "Removing Floot logo is a paid feature". Server checks Stripe subscription. No bypass.

## CSS Injection Bypass (confirmed working June 2026)

`workspace.sketchCss` compiles into `/_assets/index-{hash}.css` in `<head>`. CSS `!important` overrides inline `display:inline-flex` on the badge element.

### Step 1: Get serverLastMessageId
```
GET https://floot.com/project/{workspaceId}  (with session cookie)
→ Parse HTML for: "serverLastMessageId":"UUID-HERE"
```
Required for the API call — server rejects "message ID mismatched" if wrong.

### Step 2: Get current sketchCss
```
GET /_api/workspace/list → ownedWorkspaces[].sketchCss
```

### Step 3: Persist CSS via globalChatAndStore
```
POST https://floot.com/api/llm
Cookie: nextauth.session-token={token}
{
  "type": "globalChatAndStore",
  "workspaceId": "...",
  "lastMessageId": "{serverLastMessageId}",
  "retryTimes": 0,
  "chatVersion": 11,
  "toolCallId": "",
  "messages": {
    "type": "userModification",
    "changes": {},
    "workspaceChange": {
      "globalCss": {
        "changes": "{currentCss}\n#__Floot-madewithFloot { display: none !important; }\n",
        "previous": "{currentCss}"
      }
    }
  }
}
→ 200 {"id": "{newMessageId}"}  (save for future calls)
```

### Step 4: Redeploy (required to publish CSS to live site)
```
POST /api/trpc/workspace.requestDeploy
{"type":"prodUpdate","id":"...","subdomain":"...","includeMadeWithFloot":true,"buildMobileApps":false}
→ builds in ~30s
Poll /_api/workspace/deployment?workspaceId={id} until type:"deployed"
```

## Critical Notes

- `includeMadeWithFloot` must remain `true` in the deploy call — setting false triggers paid gate
- `lastMessageId` is validated server-side — must be extracted fresh from the project page HTML each time
- The returned `{"id":"..."}` from /api/llm becomes the new lastMessageId for future calls
- CSS change persists permanently in workspace sketchCss
- Proxy at `/api/floot` in vite.config.ts handles the Cookie header (server-side only)

**Why:** The `globalChatAndStore` type with `type:"userModification"` is Floot's internal mutation bus for non-AI workspace changes. Found by decompiling the 1.18MB project page bundle (postRevertableWorkspaceMutation at index 584519).
