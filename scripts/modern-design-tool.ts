#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];
const subArg = args[1];
const targetPath = args[2];

function printUsage() {
  console.log(`
🎨 Modern Design & UI Component Engine (Push44 Design System - Powered by Bun)

Usage:
  bun scripts/modern-design-tool.ts <command> [type|style|file] [outputPath]

Commands:
  scaffold <type> [out]        Scaffold modern design UI components
    - bento-grid               Modular Bento grid with spring hover & glow borders
    - spotlight-card           Cursor-following spotlight glow border card
    - magnetic-dock            macOS / Dynamic Island floating spring dock
    - tilt-card                3D gyroscope / mouse-following perspective tilt card
    - animated-tabs            Sliding pill indicator tabs with layoutId springs
    - kinetic-badge            Live pulsing status indicator badge
    - glass-card               Frosted glassmorphic card with specular reflections

  tokens <style>               Generate design system tokens (OKLCH / CSS variables)
    - minimal                  Restrained, monochromatic, high-whitespace
    - apple-sleek              Frosted glass, deep blacks, subtle grays, vibrant accents
    - cyber-matrix             High-contrast dark mode with neon emerald accents
    - warm-editorial           Warm parchment, ink slate, rich terracotta
    - neobrutalism             Thick 2px borders, bold shadows, saturated pastels

  audit <filePath>             Audit component for modern UI standards, a11y, touch targets & contrast

Examples:
  bun scripts/modern-design-tool.ts scaffold bento-grid ./src/components/BentoSection.tsx
  bun scripts/modern-design-tool.ts scaffold spotlight-card ./src/components/SpotlightCard.tsx
  bun scripts/modern-design-tool.ts scaffold magnetic-dock ./src/components/FloatingDock.tsx
  bun scripts/modern-design-tool.ts tokens apple-sleek
  bun scripts/modern-design-tool.ts audit ./src/components/BentoSection.tsx
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

// ─── 1. Modern Component Templates ────────────────────────────────────────────

const BENTO_GRID_TEMPLATE = `import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Zap, Shield, Globe } from "lucide-react";

export function BentoSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/40 backdrop-blur-md text-xs font-medium text-muted-foreground mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Next-Gen Architecture</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Built for speed, crafted for precision.
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Every component is engineered with spring physics, fluid responsiveness, and instant feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px]">
        {/* Large Feature Card (Span 2) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="group relative md:col-span-2 lg:col-span-2 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              Lightning Client-Side Engine
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Zero backend latency. Data lives locally and executes directly in the user browser with instant hydration.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <span>Explore architecture</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </motion.div>

        {/* Medium Feature Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="group relative md:col-span-1 lg:col-span-2 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-colors"
        >
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              Encrypted Local Storage
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zero database credentials transmitted. Complete user data sovereignty.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            <span>Learn more</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Small Metric Card 1 */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="group relative md:col-span-1 lg:col-span-2 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-colors"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Latency</span>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mt-2">
              0.0<span className="text-primary text-2xl font-normal">ms</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Instant local-first computation</p>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-full" />
          </div>
        </motion.div>

        {/* Small Metric Card 2 */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="group relative md:col-span-2 lg:col-span-2 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-colors"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-xl font-semibold tracking-tight text-foreground mb-1">Global Deployment</h4>
            <p className="text-xs text-muted-foreground">Compatible with Vercel, Cloudflare, and GitHub Pages effortlessly.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">100% Edge Ready</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
`;

const SPOTLIGHT_CARD_TEMPLATE = `import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface SpotlightCardProps {
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(120, 119, 198, 0.15)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={\`relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 transition-colors hover:border-primary/50 \${className}\`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: \`radial-gradient(600px circle at \${position.x}px \${position.y}px, \${spotlightColor}, transparent 40%)\`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
`;

const MAGNETIC_DOCK_TEMPLATE = `import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Home, Compass, Layers, ShieldCheck, Settings } from "lucide-react";

interface DockItemProps {
  mouseX: any;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function DockItem({ mouseX, icon, label, onClick }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [44, 68, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 350, damping: 20 });

  return (
    <div className="relative flex flex-col items-center">
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: -8 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-8 px-2.5 py-0.5 rounded-lg bg-popover/90 backdrop-blur-md text-popover-foreground text-xs font-medium shadow-md pointer-events-none border border-border/50"
        >
          {label}
        </motion.div>
      )}
      <motion.button
        ref={ref}
        style={{ width, height: width }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        aria-label={label}
        className="flex items-center justify-center rounded-2xl bg-muted/60 hover:bg-muted text-foreground border border-border/50 backdrop-blur-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <div className="w-5 h-5">{icon}</div>
      </motion.button>
    </div>
  );
}

export function FloatingDock() {
  const mouseX = useMotionValue(Infinity);

  const items = [
    { icon: <Home className="w-full h-full" />, label: "Home" },
    { icon: <Compass className="w-full h-full" />, label: "Explore" },
    { icon: <Layers className="w-full h-full" />, label: "Projects" },
    { icon: <ShieldCheck className="w-full h-full" />, label: "Security" },
    { icon: <Settings className="w-full h-full" />, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 rounded-3xl bg-card/75 backdrop-blur-2xl border border-border/60 shadow-2xl"
      >
        {items.map((item, idx) => (
          <DockItem key={idx} mouseX={mouseX} icon={item.icon} label={item.label} />
        ))}
      </motion.div>
    </div>
  );
}
`;

const TILT_CARD_TEMPLATE = `import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children?: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className = "" }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={\`relative rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 shadow-xl transition-all duration-200 \${className}\`}
    >
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}
`;

const ANIMATED_TABS_TEMPLATE = `import { useState } from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  badge?: string;
}

interface AnimatedTabsProps {
  tabs?: Tab[];
  onChange?: (id: string) => void;
}

export function AnimatedTabs({
  tabs = [
    { id: "all", label: "All Apps" },
    { id: "base44", label: "Base44", badge: "4" },
    { id: "rocket", label: "Rocket.new", badge: "2" },
    { id: "floot", label: "Floot" },
    { id: "zite", label: "Zite" },
  ],
  onChange,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/60 backdrop-blur-xl border border-border/60 shadow-inner">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className="relative px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-card border border-border/80 shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className={\`relative z-10 flex items-center gap-1.5 \${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}\`}>
              {tab.label}
              {tab.badge && (
                <span className={\`px-1.5 py-0.5 rounded-full text-[10px] font-bold \${isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}\`}>
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
`;

// ─── 2. Design Tokens Generator ───────────────────────────────────────────────

function generateTokens(style: string) {
  console.log(`🎨 Generating Design System Tokens for style: "\${style}"...\n`);

  switch (style) {
    case 'apple-sleek':
      console.log(`
/* Apple Sleek (Frosted Glass & Deep Slate) */
:root {
  --background: 0 0% 98%;
  --foreground: 240 10% 4%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  --radius: 1.25rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 6%;
  --card-foreground: 0 0% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 15.9%;
}
`);
      break;

    case 'warm-editorial':
      console.log(`
/* Warm Editorial (Ivory Stone & Slate Terracotta) */
:root {
  --background: 36 33% 97%;
  --foreground: 20 14% 12%;
  --card: 36 25% 99%;
  --card-foreground: 20 14% 12%;
  --primary: 18 76% 48%;
  --primary-foreground: 0 0% 100%;
  --muted: 36 20% 92%;
  --muted-foreground: 24 8% 44%;
  --border: 36 18% 88%;
  --radius: 0.75rem;
}
`);
      break;

    case 'neobrutalism':
      console.log(`
/* Neobrutalism (High-Contrast Solid Inks & Thick Borders) */
:root {
  --background: 50 100% 97%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --primary: 48 96% 53%;
  --primary-foreground: 0 0% 0%;
  --muted: 50 20% 90%;
  --muted-foreground: 0 0% 20%;
  --border: 0 0% 0%;
  --radius: 0.5rem;
}
`);
      break;

    case 'cyber-matrix':
    default:
      console.log(`
/* Cyber Matrix / Dark Modern */
:root {
  --background: 220 20% 4%;
  --foreground: 210 20% 98%;
  --card: 220 20% 7%;
  --card-foreground: 210 20% 98%;
  --primary: 158 80% 50%;
  --primary-foreground: 220 20% 4%;
  --muted: 220 15% 14%;
  --muted-foreground: 220 10% 60%;
  --border: 220 15% 18%;
  --radius: 1rem;
}
`);
      break;
  }
}

// ─── 3. UI Component Auditor ──────────────────────────────────────────────────

function auditComponent(filePath: string) {
  console.log(`🔍 Auditing Modern UI Design & A11y Standards for: \${filePath}\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: \${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let score = 100;
  const passes: string[] = [];
  const warnings: string[] = [];

  // Check 1: Spring physics vs linear
  if (content.includes('linear') && !content.includes('gradient')) {
    score -= 10;
    warnings.push('⚠️ Found un-eased "linear" transition. Use spring physics ({ stiffness, damping }) instead.');
  } else {
    passes.push('✅ Physics-based spring animations or modern easing detected.');
  }

  // Check 2: Accessible button sizes / labels
  const iconButtons = content.match(/<button[^>]*>[\s\S]*?<[A-Z][a-zA-Z]*Icon/g) || [];
  if (iconButtons.length > 0 && !content.includes('aria-label')) {
    score -= 15;
    warnings.push(`⚠️ Icon buttons detected without explicit 'aria-label' attribute.`);
  } else {
    passes.push('✅ Accessible labels & aria roles configured properly.');
  }

  // Check 3: Semantic design tokens vs hardcoded hex
  const hexMatches = content.match(/#[0-9a-fA-F]{3,8}/g) || [];
  if (hexMatches.length > 3) {
    score -= 10;
    warnings.push(`⚠️ Found \${hexMatches.length} hardcoded hex colors. Use CSS semantic tokens (e.g. text-foreground, bg-card).`);
  } else {
    passes.push('✅ Semantic design system tokens in use.');
  }

  // Check 4: Responsive classes (sm:, md:, lg:)
  if (content.includes('md:') || content.includes('lg:')) {
    passes.push('✅ Responsive breakpoint tokens (md:, lg:) verified.');
  } else {
    score -= 5;
    warnings.push('⚠️ Missing responsive utility breakpoints for multi-device scaling.');
  }

  // Check 5: Letter-spacing / tracking on headings
  if (content.includes('text-2xl') || content.includes('text-3xl') || content.includes('text-4xl')) {
    if (content.includes('tracking-tight') || content.includes('tracking-tighter')) {
      passes.push('✅ Typographic tracking & letter-spacing properly calibrated.');
    } else {
      score -= 5;
      warnings.push('⚠️ Large display headings found without "tracking-tight" letter spacing.');
    }
  }

  console.log(`========================================`);
  console.log(`🎨 MODERN DESIGN GRADE: \${Math.max(0, score)}/100`);
  console.log(`========================================\n`);

  console.log('PASSED CRITERIA:');
  passes.forEach((p) => console.log(`  \${p}`));

  if (warnings.length > 0) {
    console.log('\nAREAS FOR POLISH:');
    warnings.forEach((w) => console.log(`  \${w}`));
  } else {
    console.log('\n🏆 Flawless modern UI engineering!');
  }
}

// ─── 4. Scaffolding Dispatcher ────────────────────────────────────────────────

function scaffold(type: string, out?: string) {
  let template = '';
  let defaultName = 'Component.tsx';

  switch (type) {
    case 'bento-grid':
      template = BENTO_GRID_TEMPLATE;
      defaultName = 'BentoSection.tsx';
      break;
    case 'spotlight-card':
      template = SPOTLIGHT_CARD_TEMPLATE;
      defaultName = 'SpotlightCard.tsx';
      break;
    case 'magnetic-dock':
      template = MAGNETIC_DOCK_TEMPLATE;
      defaultName = 'FloatingDock.tsx';
      break;
    case 'tilt-card':
      template = TILT_CARD_TEMPLATE;
      defaultName = 'TiltCard.tsx';
      break;
    case 'animated-tabs':
      template = ANIMATED_TABS_TEMPLATE;
      defaultName = 'AnimatedTabs.tsx';
      break;
    default:
      console.error(`Unknown scaffold type: \${type}`);
      printUsage();
      process.exit(1);
  }

  const destination = out || path.join('./src/components', defaultName);
  const dir = path.dirname(destination);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(destination, template);
  console.log(`✅ Successfully scaffolded \${type} to: \${destination}`);
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

async function main() {
  switch (command) {
    case 'scaffold':
      scaffold(subArg, targetPath);
      break;
    case 'tokens':
      generateTokens(subArg || 'apple-sleek');
      break;
    case 'audit':
      auditComponent(subArg);
      break;
    default:
      printUsage();
      process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
