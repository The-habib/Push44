# UI Motion, 3D Graphics & Awwwards Engineering Standards

When creating or modifying interactive UI components, animations, transitions, or scroll experiences:

1. **Physics-Based Over Linear**: Default to spring physics (`stiffness: 300, damping: 28`) or custom ease curves (`cubic-bezier(0.16, 1, 0.3, 1)`). Never use un-eased linear transitions for UI interactions.
2. **GPU Hardware Acceleration**: Only animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Never animate layout-triggering properties (`width`, `height`, `margin`, `top`, `left`) directly. Audit with:
   ```bash
   bun run motion:audit <filePath>
   ```
3. **Awwwards / FWA Craftsmanship**:
   - Incorporate interactive WebGL liquid noise shaders (`bun run award:shader`).
   - Use velocity-tracking magnetic custom spring cursors (`bun run award:cursor`).
   - Use kinetic letter-by-letter split typography for hero headlines (`bun run award:hero`).
   - Add zero-latency synthesized tactile sound feedback on interactions (`bun run award:audio`).
   - Audit overall Awwwards grade with:
     ```bash
     bun run award:audit <filePath>
     ```
4. **Scroll & Momentum Animations**:
   - Use **Lenis + GSAP ScrollTrigger** for smooth momentum scroll and pinned timeline scrub reveals (`bun run motion:lenis`, `bun run motion:gsap scroll-trigger`).
   - Use **Motion / Framer Motion** (`useScroll`, `useTransform`, `whileInView`) for declarative React component reveals (`bun run motion:scaffold scroll-reveal`).
5. **3D WebGL & Interactive Particle Canvases**:
   - Use **Three.js** for high-performance 3D starfields and WebGL meshes (`bun run three:particles`).
6. **Micro-Interactions & Celebrations**:
   - Incorporate magnetic buttons (`bun run motion:gsap magnetic`), shared element transitions (`bun run motion:scaffold layout-id`), and confetti bursts on conversion events (`bun run motion:confetti`).
7. **Accessibility**: Always respect `prefers-reduced-motion` by reducing durations or disabling non-essential motion.
