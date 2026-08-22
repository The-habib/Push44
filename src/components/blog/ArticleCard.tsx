import { useRef, useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
import { PLATFORM_META, type Article } from "@/seo/data";
import { PlatformLogo } from "@/components/BrandLogos";

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  const pm = PLATFORM_META[article.platform] || PLATFORM_META.general;
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2), ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#e7e2db] p-6 shadow-xs hover:shadow-xl hover:border-[#f50]/40 transition-all duration-300 overflow-hidden"
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 85, 0, 0.08), transparent 70%)`,
        }}
      />

      {/* Top Flame Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#f50] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Full Card Link Target */}
      <Link to="/blog/$slug" params={{ slug: article.slug }} className="absolute inset-0 z-20">
        <span className="sr-only">Read {article.h1}</span>
      </Link>

      <div className="relative z-10">
        {/* Badges Header */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {article.platform !== "general" && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs"
              style={{ color: pm.color, backgroundColor: pm.bgColor, border: `1px solid ${pm.color}30` }}
            >
              <PlatformLogo platform={article.platform} size={14} className="shrink-0" />
              {pm.name}
            </span>
          )}
          <span className="text-[11px] font-bold text-[#8c857b] uppercase tracking-wider bg-[#f3efe9] px-2.5 py-0.5 rounded-full border border-[#eae4dc]">
            {article.category}
          </span>
          {article.difficulty && (
            <span className="text-[10px] font-medium text-[#8c857b] bg-white border border-[#e7e2db] px-2 py-0.5 rounded-md capitalize ml-auto">
              {article.difficulty}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[17px] font-bold text-[#191411] leading-snug tracking-tight mb-2.5 group-hover:text-[#f50] transition-colors duration-200">
          {article.h1}
        </h3>

        {/* Description */}
        <p className="text-[13.5px] text-[#544e47] leading-relaxed line-clamp-2 mb-6">
          {article.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#f3efe9] mt-auto">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8c857b]">
          <Clock size={12} className="text-[#8c857b]" />
          {article.readTime} min read
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#191411] group-hover:text-[#f50] transition-all">
          Read Guide
          <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.div>
  );
}
