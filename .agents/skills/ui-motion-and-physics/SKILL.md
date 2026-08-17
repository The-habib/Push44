---
name: ui-motion-and-physics
description: UI animation, 3D WebGL particle canvases, GSAP ScrollTrigger timelines, Lenis smooth scrolling, Matter.js physics, canvas confetti celebrations, and 120fps GPU performance auditing.
---

# UI Motion, 3D Graphics & Physics Suite

This skill provides physics-based motion scaffolding, 3D WebGL particle canvases, smooth momentum scrolling, and animation performance auditing.

---

## ⚡ Motion CLI Commands

| Tool | Command | Description |
| :--- | :--- | :--- |
| **Three.js Particle Canvas** | `bun run three:particles [outPath]` | Scaffolds an interactive 3D WebGL starfield/particle mesh canvas with mouse rotation. |
| **Lenis Smooth Scroll** | `bun run motion:lenis [outPath]` | Scaffolds high-performance momentum smooth scrolling synchronized with GSAP ScrollTrigger ticker. |
| **Confetti Micro-Interaction** | `bun run motion:confetti [outPath]` | Scaffolds a dual-burst celebratory confetti micro-interaction for successful conversions. |
| **GSAP ScrollTrigger** | `bun run motion:gsap <type> [outPath]` | Scaffolds GSAP ScrollTrigger sections (`scroll-trigger`, `magnetic`) with clean lifecycle context revert. |
| **Motion.dev Spring Physics** | `bun run motion:scaffold <type> [outPath]` | Scaffolds Motion.dev / Framer Motion components (`spring`, `layout-id`, `scroll-reveal`). |
| **GPU Motion Auditor** | `bun run motion:audit <filePath>` | Scans animation code for reflow anti-patterns and ensures 100% composite transforms. |

---

## 🚀 Performance Rules for 120fps Motion

1. **Transform & Opacity Only**: Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`. Animate `x`, `y`, `scale`, `rotate`, and `opacity`.
2. **Spring Physics Over Linear**: Default to spring parameters (`stiffness: 300, damping: 28, mass: 0.5`).
3. **Scroll Momentum**: Synchronize Lenis smooth scroll ticker directly with GSAP (`gsap.ticker.add((time) => lenis.raf(time * 1000))`).
