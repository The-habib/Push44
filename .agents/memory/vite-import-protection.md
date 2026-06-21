---
name: Vite Import Protection
description: @lovable.dev/vite-tanstack-config blocks imports matching **/server/** in client code — never put createServerFn files in a server/ subdirectory
---

## The Rule
`@lovable.dev/vite-tanstack-config` (the Vite plugin used in this project) has an import protection plugin that **blocks any import whose resolved path matches `**/server/**`** in the client environment.

The exact error:
```
[import-protection] Import denied in client environment
  Denied by file pattern: **/server/**
  Importer: src/routes/index.tsx
  Import: "src/lib/server/base44"
```

## Why It Matters
TanStack Start uses `createServerFn` to define server-only RPC handlers. The framework is supposed to split these out automatically. BUT the import protection plugin fires before the split and kills builds when the file path itself contains `/server/`.

## How to Apply
- ✅ Put all `createServerFn` files directly in `src/lib/` — e.g. `src/lib/base44-api.ts`, `src/lib/github-api.ts`
- ❌ Never create `src/lib/server/`, `src/server/`, or any `**/server/**` path
- The file *name* can mention server (e.g. `base44-server.ts` is fine), only the *directory* `/server/` is blocked

## createServerFn Call Pattern
```typescript
// Define (in src/lib/*.ts):
export const myFn = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { x } = ctx.data as { x: string };
    return { result: x };
  }
);

// Call (from any route/component):
const result = await myFn({ data: { x: "hello" } });
```
Always pass `{ data: { ... } }` — the `data` wrapper is required by TanStack Start v1.167+.
