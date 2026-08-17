#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];
const subArg = args[1];

function printUsage() {
  console.log(`
🏆 Award-Winning Website Creation Suite (Awwwards/FWA Grade - Powered by Bun)

Usage:
  bun scripts/award-site-tool.ts <command> [type] [outPath]

Commands:
  scaffold cursor [out]        Scaffold Magnetic Custom Spring Cursor with velocity trail
  scaffold shader-bg [out]      Scaffold Interactive WebGL Liquid Noise Shader Canvas
  scaffold kinetic-hero [out]   Scaffold Awwwards-style Kinetic Split-Typography Hero Section
  scaffold audio-synth [out]    Scaffold Synthesized Web Audio API Tactile Sound Engine
  audit <filePath>              Evaluate component against Awwwards/FWA design & motion criteria

Examples:
  bun scripts/award-site-tool.ts scaffold cursor ./src/components/MagneticCursor.tsx
  bun scripts/award-site-tool.ts scaffold shader-bg ./src/components/LiquidShaderCanvas.tsx
  bun scripts/award-site-tool.ts scaffold kinetic-hero ./src/components/AwwwardsHero.tsx
  bun scripts/award-site-tool.ts scaffold audio-synth ./src/lib/tactile-audio.ts
  bun scripts/award-site-tool.ts audit ./src/components/AwwwardsHero.tsx
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

// ─── 1. Magnetic Custom Cursor Component ──────────────────────────────────────
const CURSOR_TEMPLATE = `import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState("");

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest("[data-cursor], button, a, input");
      if (interactiveEl) {
        setIsHovered(true);
        const label = interactiveEl.getAttribute("data-cursor") || "";
        setHoverText(label);
      } else {
        setIsHovered(false);
        setHoverText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        scale: isHovered ? (hoverText ? 3.5 : 2) : 1,
        backgroundColor: isHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.6)",
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-difference flex items-center justify-center backdrop-blur-xs"
    >
      {hoverText && (
        <span className="text-[4px] font-bold tracking-widest text-black uppercase select-none">
          {hoverText}
        </span>
      )}
    </motion.div>
  );
}
`;

// ─── 2. Interactive WebGL Liquid Noise Shader ────────────────────────────────
const SHADER_TEMPLATE = `import { useEffect, useRef } from "react";
import * as THREE from "three";

export function LiquidShaderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const uniforms = {
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    };

    const vertexShader = \`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    \`;

    const fragmentShader = \`
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec2 u_resolution;
      varying vec2 vUv;

      // Simplex-inspired procedural liquid noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 mouseDist = uv - u_mouse;
        float d = length(mouseDist);

        float n = snoise(uv * 3.0 + vec2(u_time * 0.15, u_time * 0.1));
        float warp = snoise(uv * 5.0 + vec2(n, u_time * 0.08) + mouseDist * 0.4);

        // Awwwards-grade luxury color palette (Deep Onyx into Sunset Amber)
        vec3 colorA = vec3(0.04, 0.04, 0.06);
        vec3 colorB = vec3(0.98, 0.45, 0.09); // Electric Amber
        vec3 colorC = vec3(0.40, 0.15, 0.95); // Royal Violet

        vec3 finalColor = mix(colorA, colorB, clamp(warp * 0.6 + 0.3 - d * 0.5, 0.0, 1.0));
        finalColor = mix(finalColor, colorC, clamp(n * 0.4, 0.0, 1.0));

        gl_FragColor = vec4(finalColor, 1.0);
      }
    \`;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = (time: number) => {
      uniforms.u_time.value = time * 0.001;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      uniforms.u_mouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height
      );
    };

    const handleResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.u_resolution.value.set(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 overflow-hidden" />;
}
`;

// ─── 3. Awwwards Kinetic Split-Typography Hero ───────────────────────────────
const HERO_TEMPLATE = `import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AwwwardsKineticHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Staggered word/letter reveal
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll(".char-wrap");
        tl.from(words, {
          yPercent: 120,
          rotateZ: 4,
          opacity: 0,
          stagger: 0.03,
          duration: 1.2,
        });
      }

      tl.from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
      }, "-=0.8");

      tl.from(ctaRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      }, "-=0.6");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const headline = "CRAFTING DIGITAL MASTERPIECES";

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-black text-white"
    >
      <div className="max-w-5xl mx-auto z-10">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-zinc-300">
          ✨ Awwwards Site of the Day Caliber
        </div>

        <h1
          ref={headlineRef}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-8 flex flex-wrap justify-center gap-x-4 overflow-hidden"
        >
          {headline.split(" ").map((word, wIdx) => (
            <span key={wIdx} className="inline-flex overflow-hidden py-2">
              {word.split("").map((char, cIdx) => (
                <span key={cIdx} className="char-wrap inline-block">
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-12"
        >
          Pioneering the intersection of artificial intelligence, fluid WebGL graphics, and physics-driven micro-interactions.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            data-cursor="EXPLORE"
            className="px-10 py-5 rounded-full bg-white text-black font-semibold text-base hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            Experience the Future
          </button>
        </div>
      </div>
    </section>
  );
}
`;

// ─── 4. Zero-Dependency Web Audio Tactile Sound Engine ────────────────────────
const AUDIO_TEMPLATE = `// ─── Zero-Dependency Web Audio API Sound Synthesizer ──────────────────────────
// Produces crisp, high-fidelity tactile UI micro-sounds with zero external asset latency.

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Crisp mechanical tactile click
  playClick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  // Soft harmonic pop (hover)
  playPop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  // Conversion / Success chord
  playSuccess() {
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.06;
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
`;

// ─── 5. Awwwards Component Auditor ────────────────────────────────────────────
function auditAwwwardsComponent(filePath: string) {
  console.log(`🏆 Auditing component against Awwwards / FWA criteria: ${filePath}...\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let score = 100;
  const breakdown: { category: string; passed: boolean; note: string }[] = [];

  // 1. Typography & Hierarchy
  const hasDisplayType = content.includes('tracking-tighter') || content.includes('letter-spacing') || content.includes('font-black');
  if (hasDisplayType) {
    breakdown.push({ category: 'Design Craft', passed: true, note: 'Carefully tracked headline typography detected.' });
  } else {
    score -= 10;
    breakdown.push({ category: 'Design Craft', passed: false, note: 'Untracked generic typography. Add letter-spacing / tracking-tight.' });
  }

  // 2. Motion & Physics
  const hasSpringOrGSAP = content.includes('spring') || content.includes('gsap') || content.includes('framer-motion');
  if (hasSpringOrGSAP) {
    breakdown.push({ category: 'Motion Craft', passed: true, note: 'Physics springs / GSAP custom easing detected.' });
  } else {
    score -= 15;
    breakdown.push({ category: 'Motion Craft', passed: false, note: 'No physics springs or GSAP easing found.' });
  }

  // 3. GPU Compositing
  const hasReflow = /(?:width|height|top|left)\s*:/g.test(content);
  if (!hasReflow) {
    breakdown.push({ category: 'GPU Performance', passed: true, note: '100% composite transforms (x, y, scale, rotate, opacity).' });
  } else {
    score -= 15;
    breakdown.push({ category: 'GPU Performance', passed: false, note: 'Layout-triggering animations found. Animate transform instead.' });
  }

  // 4. Creative Interactivity (Cursor, Shaders, Sound)
  const hasCreative = content.includes('data-cursor') || content.includes('Shader') || content.includes('sound') || content.includes('THREE');
  if (hasCreative) {
    breakdown.push({ category: 'Creativity & Polish', passed: true, note: 'High-craft interactive elements (shaders, audio, or magnetic cursor) present.' });
  } else {
    score -= 10;
    breakdown.push({ category: 'Creativity & Polish', passed: false, note: 'Consider adding magnetic cursor hooks, ambient WebGL, or sound micro-interactions.' });
  }

  console.log(`========================================`);
  console.log(`🌟 AWWWARDS ESTIMATED SCORE: ${Math.max(0, score)}/100`);
  console.log(`========================================\n`);

  breakdown.forEach((b) => {
    const symbol = b.passed ? '✅' : '⚠️';
    console.log(`${symbol} [${b.category}] ${b.note}`);
  });
  console.log();
}

async function main() {
  if (command === 'scaffold') {
    switch (subArg) {
      case 'cursor': {
        const out = args[2] || './MagneticCursor.tsx';
        fs.writeFileSync(out, CURSOR_TEMPLATE);
        console.log(`✅ Generated Magnetic Spring Cursor at: ${out}`);
        break;
      }
      case 'shader-bg': {
        const out = args[2] || './LiquidShaderCanvas.tsx';
        fs.writeFileSync(out, SHADER_TEMPLATE);
        console.log(`✅ Generated Liquid Noise Shader Canvas at: ${out}`);
        break;
      }
      case 'kinetic-hero': {
        const out = args[2] || './AwwwardsHero.tsx';
        fs.writeFileSync(out, HERO_TEMPLATE);
        console.log(`✅ Generated Awwwards Kinetic Split-Typography Hero at: ${out}`);
        break;
      }
      case 'audio-synth': {
        const out = args[2] || './tactile-audio.ts';
        fs.writeFileSync(out, AUDIO_TEMPLATE);
        console.log(`✅ Generated Synthesized Web Audio Engine at: ${out}`);
        break;
      }
      default:
        console.error(`Unknown scaffold type: ${subArg}. Options: cursor, shader-bg, kinetic-hero, audio-synth`);
        process.exit(1);
    }
  } else if (command === 'audit') {
    if (!subArg) {
      console.error('Please specify a file to audit.');
      process.exit(1);
    }
    auditAwwwardsComponent(subArg);
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
