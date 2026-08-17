---
name: vibe-ai-component-engine
description: AI-driven prompt-to-component generation engine (v0 and 21st.dev style). Generates production-ready React 19 components with Tailwind CSS v4, Lucide icons, and Framer Motion spring physics from natural language descriptions.
---

# Vibe AI Component Engine (v0 / 21st.dev Style)

This skill enables on-demand synthesis of modern React 19 components from natural language prompts, curated recipes, and 21st.dev component block registries.

---

## 🤖 Generator Commands & Workflows

| Command | Usage | Description |
| :--- | :--- | :--- |
| **Prompt-to-Component** | `bun run ai:ui "<prompt>" [outPath]` | Synthesizes custom React 19 component with Tailwind CSS v4, Lucide icons, and Framer Motion. |
| **Recipe Gallery** | `bun run ai:gallery` | Lists available pre-engineered patterns (Pricing tables, Hero sections, Bento grids). |
| **21st.dev Registry Pull** | `bun run registry:get <type> [outPath]` | Pulls verified UI blocks (`marquee`, `spotlight`, etc.) into your codebase. |

---

## 💡 Common Prompts & Recipes

```bash
# Glassmorphic SaaS Pricing Table with monthly/annual toggle
bun run ai:ui "pricing table with annual discount toggle" ./src/components/PricingTable.tsx

# Kinetic Glow Hero Section with CTA buttons
bun run ai:ui "modern hero section with gradient badge" ./src/components/HeroSection.tsx

# Interactive Bento Grid with spotlight glow
bun run ai:ui "interactive bento feature grid" ./src/components/BentoGrid.tsx

# Infinite GPU-accelerated Marquee Ribbon
bun run registry:get marquee ./src/components/InfiniteMarquee.tsx

# Radial Mouse-Tracking Spotlight Card
bun run registry:get spotlight ./src/components/SpotlightCard.tsx
```

---

## 📐 Synthesis Architecture Rules

1. **Client-Side & React 19 Compatible**: Ensure no server-side secrets or direct SSR-unsafe state at render time.
2. **Tailwind CSS v4 & Lucide Icons**: Use standard Tailwind CSS v4 utility classes and Lucide React icons.
3. **Motion Integration**: Wrap interactive cards in `motion.div` with spring hover elevations (`whileHover={{ y: -4 }}`).
