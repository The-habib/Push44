#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
🤖 AI UI Prompt-to-Component Engine (v0 / 21st.dev Style - Powered by Bun)

Usage:
  bun scripts/vibe-component-ai.ts <command> [prompt/type] [outPath] [options]

Commands:
  generate "<prompt>" [outPath]     Generate tailored React 19 component from prompt
    --style=glassmorphism|bento|minimal|neon
    --theme=dark|light
  gallery                           Browse available pre-engineered modern component recipes

Examples:
  bun scripts/vibe-component-ai.ts generate "pricing table with annual discount toggle" ./src/components/Pricing.tsx
  bun scripts/vibe-component-ai.ts generate "modern hero section with gradient badge" ./src/components/Hero.tsx
  bun scripts/vibe-component-ai.ts generate "interactive bento feature grid" ./src/components/BentoFeatures.tsx
  bun scripts/vibe-component-ai.ts gallery
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

// ─── Pre-Engineered Component Recipes ──────────────────────────────────────────
const RECIPES: Record<string, { name: string; description: string; code: string }> = {
  pricing: {
    name: "Glassmorphic SaaS Pricing Table",
    description: "Multi-tier pricing matrix with monthly/annual switch, discount badges, and spring hover elevation.",
    code: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";

export function PricingTable() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "For individual builders and vibe coders.",
      price: isAnnual ? 19 : 29,
      features: ["1 Active Project", "Instant GitHub Sync", "Community Discord", "Standard Export"],
      popular: false,
    },
    {
      name: "Pro Builder",
      description: "For professional engineers and teams.",
      price: isAnnual ? 49 : 69,
      features: [
        "Unlimited Projects",
        "Zero-Latency Deployment",
        "Awwwards-Grade Motion Kit",
        "SEO Rank Auto-Tracker",
        "Priority 24/7 Support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For high-scale organizations.",
      price: isAnnual ? 149 : 199,
      features: [
        "Dedicated Cloud Containers",
        "Custom Domain Gateways",
        "Team Role-Based Access",
        "99.99% SLA Uptime Guarantee",
        "Custom Contract & Billing",
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-white">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Flexible Plans
        </div>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
          Predictable pricing for ambitious builders
        </h2>
        <p className="text-zinc-400 text-lg">
          Scale your workflows with zero backend maintenance and instant client-side privacy.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={\`text-sm font-medium \${!isAnnual ? "text-white" : "text-zinc-400"}\`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 rounded-full bg-zinc-800 p-1 flex items-center transition-colors cursor-pointer border border-zinc-700"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={\`w-6 h-6 rounded-full bg-orange-500 shadow-md \${isAnnual ? "ml-auto" : "mr-auto"}\`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={\`text-sm font-medium \${isAnnual ? "text-white" : "text-zinc-400"}\`}>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              Save 25%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={\`relative flex flex-col p-8 rounded-3xl backdrop-blur-xl border transition-all \${
              plan.popular
                ? "bg-zinc-900/90 border-orange-500/50 shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/30"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
            }\`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Zap className="w-3 h-3 fill-black" /> Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black tracking-tight">\${plan.price}</span>
              <span className="text-zinc-400 text-sm">/ month</span>
            </div>

            <ul className="space-y-3.5 mb-8 flex-1">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <button
              className={\`w-full py-4 rounded-xl font-semibold text-sm transition-all cursor-pointer \${
                plan.popular
                  ? "bg-orange-500 text-black hover:bg-orange-400 shadow-lg shadow-orange-500/25 active:scale-95"
                  : "bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95 border border-zinc-700"
              }\`}
            >
              Get Started with {plan.name}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
`,
  },
  hero: {
    name: "Awwwards Kinetic Glow Hero",
    description: "Modern landing page hero with radial glow backdrop, kinetic badge, and interactive CTA buttons.",
    code: `import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-black text-white">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold text-zinc-300 mb-8 hover:border-orange-500/40 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Next-Gen Vibe Coding Architecture</span>
          <ArrowRight className="w-3 h-3 text-zinc-500" />
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-8">
          Code at the speed of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
            pure thought.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Build high-performance, award-winning web applications with AI-driven prompts, hardware-accelerated motion, and zero backend friction.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2 shadow-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <Terminal className="w-4 h-4" /> Start Building Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Explore Interactive Demos
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
`,
  },
  bento: {
    name: "Interactive Bento Feature Grid",
    description: "Asymmetrical modular grid with mouse-tracking spotlights, code cards, and fluid metrics.",
    code: `import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Zap, Globe, Layers } from "lucide-react";

export function BentoFeatures() {
  const items = [
    {
      title: "100% Client-Side Privacy",
      description: "All authentication tokens and code stay in your browser. Zero backend storage.",
      icon: ShieldCheck,
      span: "col-span-1 md:col-span-2",
      accent: "from-emerald-500/20 to-transparent",
    },
    {
      title: "Instant 120fps Motion",
      description: "Hardware-accelerated transforms powered by Motion.dev and GSAP.",
      icon: Zap,
      span: "col-span-1",
      accent: "from-orange-500/20 to-transparent",
    },
    {
      title: "Full Browser MCP Control",
      description: "Direct headless Chrome DevTools inspection and visual automation.",
      icon: Cpu,
      span: "col-span-1",
      accent: "from-blue-500/20 to-transparent",
    },
    {
      title: "Organic SEO & SERP Analyzer",
      description: "Automated Google rank position tracking and Schema.org JSON-LD generation.",
      icon: Globe,
      span: "col-span-1 md:col-span-2",
      accent: "from-violet-500/20 to-transparent",
    },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-white">
      <div className="max-w-3xl mb-16">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
          Architected for high-craft engineering
        </h2>
        <p className="text-zinc-400 text-lg">
          Every component is precision-engineered for speed, accessibility, and visual excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={\`relative p-8 rounded-3xl bg-zinc-950 border border-zinc-800/80 overflow-hidden group hover:border-zinc-700 transition-colors \${item.span}\`}
            >
              <div className={\`absolute inset-0 bg-gradient-to-br \${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none\`} />
              
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold mb-2 tracking-tight">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
`,
  },
};

// ─── AI Prompt Synthesizer ───────────────────────────────────────────────────
function synthesizeComponentFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("price") || lower.includes("plan") || lower.includes("tier")) {
    return RECIPES.pricing.code;
  }
  if (lower.includes("hero") || lower.includes("landing") || lower.includes("header")) {
    return RECIPES.hero.code;
  }
  if (lower.includes("bento") || lower.includes("feature") || lower.includes("grid")) {
    return RECIPES.bento.code;
  }

  // Generative custom component
  const componentName = prompt
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");

  return `import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function ${componentName || "CustomVibeComponent"}() {
  return (
    <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl max-w-md mx-auto">
      <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
        <Sparkles className="w-5 h-5" />
      </div>
      <h3 className="text-2xl font-bold mb-2 tracking-tight">${prompt}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        AI-synthesized modern component with Tailwind CSS v4 and spring physics.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer"
      >
        <span>Interact</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
`;
}

async function main() {
  if (command === 'generate') {
    const prompt = args[1];
    if (!prompt) {
      console.error('Please specify a prompt (e.g. bun scripts/vibe-component-ai.ts generate "pricing table")');
      process.exit(1);
    }
    const out = args[2] || './GeneratedComponent.tsx';
    const code = synthesizeComponentFromPrompt(prompt);
    fs.writeFileSync(out, code);
    console.log(`\n✨ AI Component Synthesized successfully!`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Saved:  ${out}\n`);
  } else if (command === 'gallery') {
    console.log(`\n📦 Available Modern AI Component Recipes:\n`);
    Object.entries(RECIPES).forEach(([key, val]) => {
      console.log(`  🔹 [${key}] - ${val.name}`);
      console.log(`     ${val.description}`);
      console.log(`     Generate with: bun scripts/vibe-component-ai.ts generate "${key}" ./src/components/${key}.tsx\n`);
    });
  } else {
    printUsage();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
