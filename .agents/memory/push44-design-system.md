---
name: Push44 Design System
description: Glassmorphism pattern, floating nav architecture, background, and card conventions for all inner-page UI
---

## Glassmorphism Card Pattern
All inner-page white cards now use:
```tsx
style={{
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
}}
```
Use `rgba(255,255,255,0.96)` for modals/overlays (higher opacity).

**Why:** The warm cream background (#faf8f5) with radial gradient mesh means pure white cards look flat; semi-transparent glass cards pick up background depth.

**How to apply:** Any new card using `bg-white rounded-[XX]` should be converted. Keep the border (usually `border-[#f0ece4]`). Do NOT remove the border — it provides crisp edge definition against the gradient background.

## Floating Glass Bottom Nav
- Architecture: In-flow flex child of `h-[100dvh]` flex column — NOT `position:fixed`
- Visual pill: `borderRadius:28px`, `backdrop-filter:blur(32px)`, `background:rgba(255,255,255,0.88)`
- Active tab: `layoutId="fnav-pill"` orange gradient pill, label expands with AnimatePresence
- Nav tabs must use `w-[20%]` not `flex-1` to prevent icon jitter on label show/hide
- Safe area: `paddingBottom: max(env(safe-area-inset-bottom, 0px), 16px)`

## Background
- Base: `linear-gradient(145deg, #faf8f5 0%, #f5f2ec 50%, #f8f5f0 100%)`  
- Mesh overlay (fixed, pointer-events-none): two radial gradients — orange tint top-left, indigo tint bottom-right, both very subtle

## Desktop Sidebar
- Frosted: `rgba(255,255,255,0.75)` with `backdrop-filter:blur(24px)`
- Active item: `layoutId="sidebar-pill"` orange gradient `rounded-[14px]`, animated via spring

## Header (mobile)
- Height 58px, `rgba(250,248,245,0.88)` + `blur(28px)`
- `boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.05)"`

## Orange Accent
- Primary: `#f97316`
- Gradient buttons: `linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)`
- Button shadow: `0 4px 20px rgba(249,115,22,0.35)`

## Settings Modals
- Use `rgba(255,255,255,0.96)` + `blur(32px)` for modal panels
- Border: `border-white/80` (not the solid #f0ece4)
