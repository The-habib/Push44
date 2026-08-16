---
name: motion-craft-microinteractions
description: >-
  Expert guidelines for high-craft UI animation and micro-interactions.
  Covers physics-based springs (stiffness, damping, mass), gesture velocity preservation,
  layoutId shared element transitions, magnetic buttons, sheet/drawer transitions,
  tactile feedback, 120fps GPU acceleration, and avoiding common animation anti-patterns.
---

# UI Motion Craft & Micro-Interactions Skill

Authoritative engineering and design guidelines for creating high-craft, organic, physics-accurate UI animations and micro-interactions.

---

## 1. Core Physics & Spring Guidelines

Never use linear or arbitrary ease durations for interactive elements. Physical objects in the real world have mass, momentum, and friction.

### 1.1 Recommended Spring Token Presets

```ts
export const SPRING_PRESETS = {
  // Snappy: Best for toggle switches, small button presses, checkboxes, pills
  snappy: { type: "spring", stiffness: 450, damping: 35, mass: 0.8 },

  // Responsive: Best for dropdown menus, tooltips, dialogs, floating badges
  responsive: { type: "spring", stiffness: 300, damping: 28, mass: 1 },

  // Gentle / Natural: Best for page transitions, drawers, bottom sheets, expanding cards
  gentle: { type: "spring", stiffness: 200, damping: 24, mass: 1.2 },

  // Bouncy / Playful: Best for success badges, celebration reactions, playful avatars
  bouncy: { type: "spring", stiffness: 350, damping: 18, mass: 1 },
} as const;
```

### 1.2 The 300ms Rule for Duration Transitions
If using CSS transitions or duration-based easing:
- **Fast micro-interactions** (hover, active, focus): `150ms - 200ms` using `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Medium UI reveals** (dropdowns, accordions): `250ms - 320ms` using `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Avoid sluggish transitions**: Anything exceeding `400ms` feels laggy to user input unless tied to a continuous drag gesture.

---

## 2. Layout & GPU Performance Rules

### 2.1 Hardware-Accelerated Properties Only
To guarantee consistent 60fps / 120fps without triggering browser layout recalculations:
- ✅ **DO animate**: `transform` (`x`, `y`, `scale`, `rotate`), `opacity`, `filter`.
- ❌ **DO NOT animate directly**: `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`.
- ✅ **Expanding containers**: Use `layout` / `layoutId` with Framer Motion or scale transforms with FLIP technique.

### 2.2 Preserving Gesture Velocity
When dragging cards, dismissable sheets, or swipeable lists:
- Do not clamp velocity to zero on release.
- Pass the pointer's release velocity into the spring transition:
```tsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  onDragEnd={(e, info) => {
    if (info.velocity.y > 500 || info.offset.y > 150) {
      dismiss();
    }
  }}
/>
```

---

## 3. Micro-Interaction Patterns

### 3.1 Magnetic Button Effect
```tsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
```

### 3.2 Shared Element Morph (`layoutId`)
When morphing a thumbnail card into an expanded modal, use `layoutId` to maintain visual continuity:
```tsx
<motion.div layoutId={`card-${id}`} className="card-container">
  <motion.img layoutId={`image-${id}`} src={image} />
  <motion.h3 layoutId={`title-${id}`}>{title}</motion.h3>
</motion.div>
```

---

## 4. Accessibility (a11y) & Reduced Motion

Always respect `prefers-reduced-motion`:
```tsx
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();
const transition = shouldReduceMotion ? { duration: 0 } : SPRING_PRESETS.responsive;
```
Or in CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
