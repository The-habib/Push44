import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { PLATFORM_META, type Article } from "@/seo/data";

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  const pm = PLATFORM_META[article.platform] || PLATFORM_META.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25), ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 10, padding: "18px", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#d4d4d8"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      {/* Invisible full-size link */}
      <Link to="/blog/$slug" params={{ slug: article.slug }} style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>Read {article.h1}</span>
      </Link>

      {/* Tags */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {article.platform !== "general" && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, color: pm.color, background: pm.bgColor, border: `1px solid ${pm.color}22` }}>
            {pm.name}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 500, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {article.category}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#09090b", lineHeight: 1.35, letterSpacing: "-0.02em", margin: 0 }}>
        {article.h1}
      </h3>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, margin: "0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {article.description}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f4f4f5", marginTop: "auto" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#a1a1aa", fontWeight: 500 }}>
          <Clock size={11} /> {article.readTime} min read
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#f97316" }}>
          Read <ArrowRight size={11} />
        </span>
      </div>
    </motion.div>
  );
}
