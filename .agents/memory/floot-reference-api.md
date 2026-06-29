---
name: Floot Reference API — File Access
description: Undocumented /_api/workspace/reference endpoint that reads actual source files from any Floot workspace. This is the key to full Floot integration.
---

## The Endpoint

`POST https://floot.com/_api/workspace/reference`

Requires session cookie (via the `/api/floot` proxy in vite.config.ts).

## Two Actions

### getInfo — get project structure
```json
{
  "action": "getInfo",
  "sourceWorkspaceId": "{uuid}",
  "include": ["items", "dependencies"]
}
```
Returns:
```json
{
  "name": "...",
  "designChoices": "...",
  "items": {
    "components": ["Button", "Form", ...],
    "helpers": ["themeMode", "useDebounce", ...],
    "pages": ["_index"],
    "endpoints": [],
    "statics": []
  }
}
```

### readItems — get file content
```json
{
  "action": "readItems",
  "sourceWorkspaceId": "{uuid}",
  "itemNames": ["pages/_index", "helpers/themeMode", "components/Button"]
}
```
Returns:
```json
{
  "items": {
    "pages/_index": { "code": "import React...", "css": ".page { ... }" },
    "helpers/themeMode": { "code": "export function ..." },
    "components/Button": { "code": "...", "css": "..." }
  }
}
```

## Critical Schema Details
- Discriminator field is `action` (NOT `type`)
- Workspace field is `sourceWorkspaceId` (NOT `workspaceId`)
- These are Zod discriminated union — wrong field names give "Invalid discriminator value" error

## File Type → Extension Mapping
- `pages/` → `.tsx` code + `.module.css` css (if present)
- `helpers/` → `.ts` code only
- `components/` → `.tsx` code + `.module.css` css (if present)
- `endpoints/` → `.ts` code only
- `statics/` → path as-is (already has extension in name), map to `static/` dir

## File Content Checks
Use `item.code !== undefined` (not `.trim()`) to preserve intentionally empty files.

## Discovery Method
Found by reverse-engineering the Floot project page JS bundle (1.18MB).
Key strings: `aA`, `a$`, `aD = td.gM("action", [aA, a$])` in bundle.

**Why:** This endpoint is designed for the Floot AI to reference other projects as inspiration — it reads files from any workspace by ID. It works perfectly for Push44's needs.

## How to Apply
See `src/lib/floot-api.ts` — `fetchFlootAppFiles` uses `getInfo` then batched `readItems` (10 per batch).
