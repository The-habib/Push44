---
name: award-winning-site-creator
description: Craft Awwwards, FWA, and CSS Design Awards-caliber websites with interactive WebGL liquid noise shaders, magnetic spring cursors, kinetic split-typography, tactile Web Audio synthesizer micro-interactions, and automated 100-point Awwwards design scoring.
---

# Award-Winning Site Creator (Awwwards / FWA Grade)

This skill provides direct guidelines, generator recipes, and audit tooling to design and code award-winning websites with AI.

---

## 🏆 Core Capabilities & CLI Commands

All commands are powered by Bun in this workspace:

| Capability | Command | Description |
| :--- | :--- | :--- |
| **Liquid WebGL Shader** | `bun run award:shader [outPath]` | Interactive GPU fragment shader featuring procedural simplex liquid noise and mouse displacement. |
| **Magnetic Spring Cursor** | `bun run award:cursor [outPath]` | Custom velocity-tracking cursor that snaps magnetically to interactive elements with spring physics. |
| **Kinetic Hero Section** | `bun run award:hero [outPath]` | Awwwards-style staggered letter-by-letter kinetic headline reveals with fluid clamp scaling. |
| **Tactile Sound Synthesizer** | `bun run award:audio [outPath]` | Zero-dependency Web Audio API synthesizer for tactile mechanical clicks, pops, and chords. |
| **Awwwards Design Auditor** | `bun run award:audit <filePath>` | Evaluates code against official Awwwards criteria (Design Craft, Motion, GPU Compositing, Polish) with a 0-100 score. |

---

## 🎨 Craft Standards for Award-Winning Sites

1. **Fluid Typography & Tracking**:
   - Always use tight letter tracking (`tracking-tighter` / `letter-spacing: -0.04em`) on display headlines.
   - Use `clamp()` for responsive font sizing (`clamp(32px, 5vw, 64px)`).
2. **GPU Hardware Acceleration**:
   - Only animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.
   - Never animate layout-triggering properties (`width`, `height`, `margin`, `top`, `left`).
3. **Harmonic Spring Physics**:
   - Default to spring physics (`stiffness: 300, damping: 28`) or custom ease curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
4. **Tactile Micro-Interactions**:
   - Trigger zero-latency synthesized Web Audio pops on hover and crisp clicks on active states.
   - Trigger particle explosion confetti on conversion events (`bun run motion:confetti`).
