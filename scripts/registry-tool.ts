#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];
const category = args[1];

function printUsage() {
  console.log(`
📚 21st.dev & Magic UI Component Registry Tool

Usage:
  bun scripts/registry-tool.ts <command> [type] [outPath]

Commands:
  pull <type> [outPath]    Pull validated 21st.dev component block
    Types: bento, spotlight, marquee, dock, aurora, meteors
  list                     List all available registry components

Examples:
  bun scripts/registry-tool.ts pull bento ./src/components/BentoGrid.tsx
  bun scripts/registry-tool.ts pull marquee ./src/components/InfiniteMarquee.tsx
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

const REGISTRY_BLOCKS: Record<string, string> = {
  marquee: `import { motion } from "framer-motion";

export function InfiniteMarquee({ items = ["Vite", "React 19", "Tailwind 4", "Bun", "TanStack", "GSAP", "Three.js"] }: { items?: string[] }) {
  return (
    <div className="w-full overflow-hidden py-10 bg-black/40 border-y border-zinc-800 backdrop-blur-md">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 text-2xl font-black tracking-tight text-zinc-500 uppercase">
            <span className="text-white hover:text-orange-400 transition-colors">{item}</span>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
`,
  spotlight: `import { useRef, useState, type MouseEvent } from "react";

export function SpotlightCard({ children }: { children: React.ReactNode }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative rounded-3xl border border-zinc-800 bg-zinc-950 p-8 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: 'radial-gradient(600px circle at ' + position.x + 'px ' + position.y + 'px, rgba(249,115,22,0.15), transparent 40%)',
        }}
      />
      {children}
    </div>
  );
}
`,
};

async function main() {
  if (command === 'pull') {
    const block = REGISTRY_BLOCKS[category || 'marquee'];
    if (!block) {
      console.error(`Unknown block "${category}". Available: ${Object.keys(REGISTRY_BLOCKS).join(', ')}`);
      process.exit(1);
    }
    const out = args[2] || `./src/components/${category}.tsx`;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, block);
    console.log(`✅ Pulled registry block [${category}] to: ${out}`);
  } else if (command === 'list') {
    console.log(`Available Registry Blocks:\n`);
    Object.keys(REGISTRY_BLOCKS).forEach((k) => console.log(`  - ${k}`));
  } else {
    printUsage();
  }
}

main();
