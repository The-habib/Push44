---
name: Push44 Audit Patterns
description: Durable lessons from multi-round audit-fix loops on Push44 codebase.
---

## GitHub blob upload batching
Use `Promise.allSettled` over `Promise.all` for blob batch uploads, but always throw explicitly if any entry is rejected — include file paths AND failure reasons in the error. Never silently drop failed blobs or proceed to tree/commit creation.

**Why:** `Promise.all` gives a cryptic rejection on the first failure with no path info. `allSettled` + explicit throw gives users actionable diagnostics (which files, why) while still aborting before any tree/commit is created (atomic-safe).

**How to apply:** Pattern in `src/lib/github-api.ts` `pushFilesToGitHub`.

## GitHub API fetch timeout
All `ghFetch` calls need `signal: AbortSignal.timeout(GH_TIMEOUT_MS)` (30 s). Without it, stalled uploads hang indefinitely with no user feedback.

**Why:** `fetch()` has no built-in timeout. The `bolt-api.ts` pattern with `AbortSignal.timeout(6000)` was already correct — apply the same to github-api.ts.

## Eye-toggle buttons need aria-labels
Every show/hide password/token button must have `aria-label={showing ? "Hide token" : "Show token"}`.

**Where:** `settings.lazy.tsx` (4 buttons: GH, Zite, Floot, Bolt), `onboarding.lazy.tsx` (2 buttons: GH token, Base44 password).

## OG/Twitter meta in root head()
`src/routes/__root.tsx` head() must include og:title, og:description, og:image, og:url, og:type, twitter:card, twitter:title, twitter:description, twitter:image. Without these, social shares of any app route show blank previews.

## Polling loop guards
Every polling loop must have a max-attempts guard to prevent infinite loops:
- APK polling (`apkPollAttemptsRef`): reset on new build start, max 120 attempts (10 min)
- Floot mobile polling (`attempts >= 60`): already present
- Rocket `fetchAllPages`: `MAX_PAGES = 200` guard on the while loop
