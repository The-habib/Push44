---
name: Lovable Integration Bugs
description: Non-obvious bugs discovered in the Lovable platform integration for Push44, fixed in code review.
---

## 1. Promise.allSettled workspace ID scoping

In `listLovableProjects`, the workspace `ws` variable is only in scope inside the `.map((ws) => ...)` callback. The subsequent `for (const r of results)` loop has no access to it.

**Fix:** Return `{ wsId: ws.id, projects: [...] }` from the `.then()` so the ID travels with the result.

**Why:** A classic JS closure trap — `ws` is a loop variable bound per iteration, but `results` is resolved after all iterations; destructuring it from the fulfilled value is the safe pattern.

## 2. AI message polling must snapshot prior IDs first

`removeLovableBadge` originally picked `assistantMsgs[0]` (the oldest assistant message) as the target. If the conversation has prior messages this latches onto a stale one and the poll either resolves immediately or hangs.

**Fix:** Before `POST /messages`, fetch the message list and save existing assistant IDs into a `Set`. After sending, look for any assistant message whose ID is NOT in that set.

**Why:** The messages endpoint returns all history, not just the current turn. Keying on "new vs pre-existing" is the only reliable way to identify which AI message belongs to our request.

## 3. vercel.json must include a route for every proxy

The Vite dev proxy (in `vite.config.ts`) handles `/api/lovable` during development. In production, Vercel routes requests by `vercel.json`. Adding the Vite plugin without also adding a Vercel route silently drops all Lovable API calls in production.

**Pattern (applied to all platforms):**
```json
{ "src": "/api/lovable/(.*)", "dest": "/api/lovable-proxy?p=$1" }
```
Add this before the `{ "handle": "filesystem" }` entry.

## 4. dashboard.lazy.tsx Platform Record must include all Platform values

`Platform` is a discriminated union in `storage.ts`. Any `Record<Platform, string>` in `dashboard.lazy.tsx` (e.g. `PLATFORM_COLORS`, `PLATFORM_LABELS`) must have a key for every member of the union. TypeScript enforces this at compile time — adding a new platform to the union without updating these maps causes a typecheck error.

**How to apply:** After adding a new platform to `storage.ts`, grep for `Record<Platform` across the codebase and add the new key everywhere.
