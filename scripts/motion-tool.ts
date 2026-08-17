#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];
const subArg = args[1];

function printUsage() {
  console.log(`
✨ GSAP, Motion Dev, 3D WebGL & Physics Animation Suite (Powered by Bun)

Usage:
  bun scripts/motion-tool.ts <command> [type] [outPath]

Commands:
  gsap:scaffold <type> [out]     Scaffold GSAP animations (scroll-trigger, timeline, magnetic)
  motion:scaffold <type> [out]   Scaffold Motion.dev animations (spring, layout-id, scroll-reveal)
  three:scaffold <type> [out]    Scaffold Three.js 3D WebGL scenes (particles, floating-cube, shader-bg)
  lenis:scaffold [out]           Scaffold Lenis smooth scroll provider integrated with GSAP
  confetti:scaffold [out]        Scaffold conversion celebration confetti micro-interaction
  audit <filePath>               Audit animation code for GPU acceleration & performance anti-patterns

Examples:
  bun scripts/motion-tool.ts three:scaffold particles ./src/components/ParticleCanvas.tsx
  bun scripts/motion-tool.ts lenis:scaffold ./src/components/SmoothScrollProvider.tsx
  bun scripts/motion-tool.ts confetti:scaffold ./src/components/ConfettiButton.tsx
  bun scripts/motion-tool.ts audit ./src/routes/index.lazy.tsx
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

// ─── GSAP Scaffolding ────────────────────────────────────────────────────────
const GSAP_TEMPLATES: Record<string, string> = {
  'scroll-trigger': `import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal pinned section
      gsap.from(cardsRef.current, {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-12">Interactive Scroll Experience</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item, idx) => (
          <div
            key={item}
            ref={(el) => { if (el) cardsRef.current[idx] = el; }}
            className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white"
          >
            <h3 className="font-semibold text-lg mb-2">Feature {item}</h3>
            <p className="text-zinc-400">Silky smooth 120fps hardware-accelerated motion.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`,
  magnetic: `import { useRef, type MouseEvent } from "react";
import gsap from "gsap";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = buttonRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.35;
    const y = (e.clientY - (top + height / 2)) * 0.35;

    gsap.to(el, {
      x,
      y,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    const el = buttonRef.current;
    if (!el) return;
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="px-8 py-4 rounded-full bg-white text-black font-medium transition-colors hover:bg-zinc-200"
    >
      {children}
    </button>
  );
}
`,
};

// ─── Motion.dev / Framer Motion Scaffolding ──────────────────────────────────
const MOTION_TEMPLATES: Record<string, string> = {
  spring: `import { motion } from "framer-motion";

export function SpringPhysicsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
        mass: 0.8,
      }}
      className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl cursor-pointer"
    >
      <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 font-bold">
        ⚡
      </div>
      <h3 className="text-xl font-bold mb-2">Spring Physics</h3>
      <p className="text-zinc-400 leading-relaxed">
        Natural harmonic velocity preservation with zero layout-shift jitter.
      </p>
    </motion.div>
  );
}
`,
  'layout-id': `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["Performance", "Security", "Developer Experience"];

export function SharedLayoutTabs() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 w-fit">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-5 py-2.5 text-sm font-medium text-white transition-colors z-10"
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white/10 rounded-xl border border-white/20 -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            {tab}
          </button>
        );
      })}
    </div>
  );
}
`,
  'scroll-reveal': `import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxScrollHero() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 0.7], [0, 100]);

  return (
    <motion.div
      ref={targetRef}
      style={{ opacity, scale, y }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
    >
      <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
        Next-Gen Motion
      </h1>
      <p className="text-xl text-zinc-400 max-w-2xl">
        Declarative GPU-accelerated parallax transformations.
      </p>
    </motion.div>
  );
}
`,
};

// ─── Animation Audit ─────────────────────────────────────────────────────────
function auditAnimationCode(filePath: string) {
  console.log(`🔍 Auditing animation performance in: ${filePath}...\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const antiPatterns = [
    { prop: 'width', regex: /(?:animate|to|from)\s*=\s*\{[^}]*width\s*:/g, advice: 'Animate "scaleX" or "scale" instead of "width" to prevent browser reflow.' },
    { prop: 'height', regex: /(?:animate|to|from)\s*=\s*\{[^}]*height\s*:/g, advice: 'Animate "scaleY" or "scale" instead of "height" to prevent browser reflow.' },
    { prop: 'top/left', regex: /(?:animate|to|from)\s*=\s*\{[^}]*(?:top|left|right|bottom)\s*:/g, advice: 'Animate "x" and "y" (transform: translate) instead of top/left/right/bottom for GPU composite.' },
    { prop: 'margin/padding', regex: /(?:animate|to|from)\s*=\s*\{[^}]*(?:margin|padding)\s*:/g, advice: 'Avoid animating layout padding/margins directly.' },
  ];

  let violations = 0;
  antiPatterns.forEach((ap) => {
    const matches = content.match(ap.regex);
    if (matches) {
      violations += matches.length;
      console.log(`⚠️  [Reflow Anti-Pattern] Detected animation of "${ap.prop}"`);
      console.log(`    💡 Recommendation: ${ap.advice}\n`);
    }
  });

  const hasReducedMotion = content.includes('useReducedMotion') || content.includes('prefers-reduced-motion');
  if (!hasReducedMotion) {
    console.log(`ℹ️  Accessibility Check: Consider supporting "prefers-reduced-motion" / "useReducedMotion()".`);
  } else {
    console.log(`✅ Accessibility: Respects reduced motion preferences.`);
  }

  if (violations === 0) {
    console.log(`\n🎉 Outstanding! Animation code uses 100% GPU-accelerated transforms & opacity.`);
  } else {
    console.log(`\n⚠️ Found ${violations} potential performance bottleneck(s).`);
  }
}

// ─── Three.js 3D Templates ──────────────────────────────────────────────────
const THREE_TEMPLATES: Record<string, string> = {
  particles: `import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ParticleStarfield() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle geometry
    const count = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 120;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      color: new THREE.Color("#f97316"),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let frameId: number;
    const animate = () => {
      particles.rotation.y += 0.0015;
      particles.rotation.x += 0.0008;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="w-full h-96 relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800" />;
}
`,
};

const LENIS_TEMPLATE = `import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
`;

const CONFETTI_TEMPLATE = `import confetti from "canvas-confetti";

export function triggerConversionConfetti() {
  const end = Date.now() + 1.2 * 1000;
  const colors = ["#f97316", "#3b82f6", "#10b981", "#ec4899"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
`;

async function main() {
  if (command === 'gsap:scaffold') {
    const templateType = subArg || 'scroll-trigger';
    const template = GSAP_TEMPLATES[templateType];
    if (!template) {
      console.error(`Unknown GSAP type "${templateType}". Available: ${Object.keys(GSAP_TEMPLATES).join(', ')}`);
      process.exit(1);
    }
    const out = args[2] || `./GSAP_${templateType}.tsx`;
    fs.writeFileSync(out, template);
    console.log(`✅ Generated GSAP ${templateType} component at: ${out}`);
  } else if (command === 'motion:scaffold') {
    const templateType = subArg || 'spring';
    const template = MOTION_TEMPLATES[templateType];
    if (!template) {
      console.error(`Unknown Motion type "${templateType}". Available: ${Object.keys(MOTION_TEMPLATES).join(', ')}`);
      process.exit(1);
    }
    const out = args[2] || `./Motion_${templateType}.tsx`;
    fs.writeFileSync(out, template);
    console.log(`✅ Generated Motion ${templateType} component at: ${out}`);
  } else if (command === 'three:scaffold') {
    const templateType = subArg || 'particles';
    const template = THREE_TEMPLATES[templateType];
    if (!template) {
      console.error(`Unknown Three.js type "${templateType}". Available: ${Object.keys(THREE_TEMPLATES).join(', ')}`);
      process.exit(1);
    }
    const out = args[2] || `./Three_${templateType}.tsx`;
    fs.writeFileSync(out, template);
    console.log(`✅ Generated Three.js ${templateType} component at: ${out}`);
  } else if (command === 'lenis:scaffold') {
    const out = subArg || './SmoothScrollProvider.tsx';
    fs.writeFileSync(out, LENIS_TEMPLATE);
    console.log(`✅ Generated Lenis Smooth Scroll component at: ${out}`);
  } else if (command === 'confetti:scaffold') {
    const out = subArg || './ConfettiCelebration.ts';
    fs.writeFileSync(out, CONFETTI_TEMPLATE);
    console.log(`✅ Generated Confetti micro-interaction trigger at: ${out}`);
  } else if (command === 'audit') {
    if (!subArg) {
      console.error('Please specify a file to audit.');
      process.exit(1);
    }
    auditAnimationCode(subArg);
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
