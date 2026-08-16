# UI Motion & Animation Engineering Standards

When creating or modifying interactive UI components, animations, transitions, or scroll experiences:

1. **Physics-Based Over Linear**: Default to spring physics (`stiffness: 300, damping: 28`) or custom ease curves (`cubic-bezier(0.16, 1, 0.3, 1)`). Never use un-eased linear transitions for UI interactions.
2. **GPU Hardware Acceleration**: Only animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Never animate layout-triggering properties (`width`, `height`, `margin`, `top`, `left`) directly.
3. **Scroll Animations**:
   - Use **Framer Motion / Motion v12** (`useScroll`, `useTransform`, `whileInView`) for declarative React component reveals.
   - Use **GSAP + ScrollTrigger** for complex multi-stage pinned timelines and horizontal scrubbing.
   - Do not mix GSAP and Framer Motion in the same component tree.
4. **Micro-Interactions**: Incorporate magnetic pull, hover elevation, spring pressed states, and tactile active responses on clickable elements.
5. **Accessibility**: Always respect `prefers-reduced-motion` by reducing durations or disabling non-essential motion.
