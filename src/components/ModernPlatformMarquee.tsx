import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Base44Logo,
  RocketLogo,
  FlootLogo,
  ZiteLogo,
  BoltLogo,
  LovableLogo,
  FramerLogo,
  GitHubLogo,
} from "@/components/BrandLogos";

const PLATFORMS = [
  { name: "Base44", slug: "base44", tag: "React & Vite", logo: Base44Logo, color: "#f97316" },
  { name: "Framer", slug: "framer", tag: "Components & Pages", logo: FramerLogo, color: "#0055ff" },
  { name: "Lovable", slug: "lovable", tag: "Full-Stack Vite", logo: LovableLogo, color: "#f43f5e" },
  { name: "Rocket.new", slug: "rocket-new", tag: "Flutter & APK", logo: RocketLogo, color: "#ef4444" },
  { name: "Floot", slug: "floot", tag: "Next.js & React", logo: FlootLogo, color: "#00d26a" },
  { name: "Zite", slug: "zite", tag: "Enterprise Full-Stack", logo: ZiteLogo, color: "#6366f1" },
  { name: "bolt.new", slug: "bolt-new", tag: "WebContainer Clean", logo: BoltLogo, color: "#2B5CFF" },
  { name: "GitHub", slug: "github", tag: "Direct Trees API", logo: GitHubLogo, color: "#fafaf9" },
];

export function ModernPlatformMarquee() {
  const items = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

  return (
    <div className="relative w-full overflow-hidden py-6 bg-white border-y border-stone-200">
      {/* Left/Right Edge Fade Masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

      <motion.div
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{
          ease: "linear",
          duration: 25,
          repeat: Infinity,
        }}
        className="flex items-center gap-4 w-max"
      >
        {items.map((p, idx) => {
          const Logo = p.logo;
          return (
            <Link
              key={`${p.name}-${idx}`}
              to={p.slug === "github" ? "/" : "/platforms/$platform"}
              params={p.slug === "github" ? undefined : { platform: p.slug }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-orange-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all text-stone-900 font-semibold text-xs whitespace-nowrap group"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Logo size={16} />
              </div>
              <span className="group-hover:text-orange-600 transition-colors">{p.name}</span>
              <span className="text-[10px] text-stone-400 font-normal px-1.5 py-0.5 rounded bg-stone-100 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                {p.tag}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
