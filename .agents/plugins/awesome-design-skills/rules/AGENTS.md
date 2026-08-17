# Awesome Design Skills: AI Design Guidelines

When creating or modifying user interfaces, components, and pages:
1. **Design System Adherence**: Identify the requested visual aesthetic (e.g., Minimal, Neobrutalism, Bento, Glassmorphism, Shadcn, Sleek, Clean, Modern) and adhere strictly to its tokens, typography scales, spacing units, and color harmonies.
2. **Typography & Hierarchy**: Use curated font pairings with explicit tracking (letter-spacing) and line-heights. Never use default unstyled system fonts unless explicitly specified.
3. **Micro-Interactions**: Incorporate purposeful spring animations, hover elevations, active states, and transition curves (`framer-motion` or CSS transitions).
4. **Accessible Contrast & WCAG 2.2 AA**: Ensure all text elements meet AA contrast ratios against backgrounds, visible keyboard focus rings are maintained, and aria labels are present.
5. **No Cliché Tropes**: Avoid textureless gray cards, random gradient text keywords, and generic AI template structures. Every element must be intentional.
6. **Modern Design Scaffolding & Design Token CLI**:
   - Use dedicated CLI commands to scaffold modern design components:
     ```bash
     bun run ui:add <component>         # Official Shadcn UI component installer
     bun run design:bento [outPath]     # Modular Bento Grid with spring hover & glow borders
     bun run design:dock [outPath]      # macOS / Dynamic Island floating spring dock
     bun run design:spotlight [outPath] # Radial cursor-following spotlight card
     bun run design:tilt [outPath]      # 3D perspective gyroscope tilt card
     bun run design:tabs [outPath]      # Sliding layoutId spring indicator tabs
     bun run design:tokens <style>      # Color tokens (apple-sleek, cyber-matrix, warm-editorial, neobrutalism)
     bun run design:audit <filePath>    # Audit component against modern design & a11y standards
     ```
