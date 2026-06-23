---
name: UX Audit Fixes
description: Key UX improvements applied during the audit fix pass — transition modes, nav jitter, query caching, progress bar
---

## AnimatePresence transition mode
Use `mode="popLayout"` on all page-level `AnimatePresence` wrappers (both desktop sidebar layout and mobile layout in AppShell.tsx). `mode="wait"` causes a noticeable blank gap between pages because the old page must fully exit before the new one enters.

**Why:** mode="popLayout" lets both pages animate simultaneously — old slides out while new slides in — matching native app feel.

## Nav tab icon jitter
Bottom nav `Link` items must use `className="w-[20%] flex items-center justify-center shrink-0"` (not `flex-1 min-w-0`). Using `flex-1` allows flex redistribution when the active tab's label expands, causing sibling tabs to jitter.

**Why:** Fixed percentage width ensures tab widths never change during label animations.

## Safe-area bottom padding (mobile)
Main content area bottom padding: `paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))"` instead of a hard-coded `96` px value.

## TanStack Query for API calls
Dashboard uses `useQuery` (queryKey: `["base44-apps", token]` and `["github-repos", token]`) with `staleTime: 5min, gcTime: 10min`. This caches data between route navigations — no re-fetch on tab switch. The QueryClient is already set up in router.tsx and passed as context.

## Push progress bar
`pushFilesToGitHub` accepts `onProgress?: (done, total) => void` in its data param. Called after each BATCH of blobs. push.tsx uses `pushProgress` state and renders a progress bar above the push button during `status === "pushing"`.

## Skeleton components
`src/components/Skeleton.tsx` exports: `Skeleton`, `SkeletonCard`, `SkeletonText`, `SkeletonStatCard`, `SkeletonRepoCard`, `SkeletonListItem`. Use these instead of `Loader2` spinners for data-fetching placeholders.

## Flash prevention on protected routes
In OnboardingGuard (`__root.tsx`), add `if (!isLoaded && APP_ROUTES.includes(pathname)) return null` before the AppShell render. This prevents a flash of protected route content before auth state is hydrated from localStorage.
