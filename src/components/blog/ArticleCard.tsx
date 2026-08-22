import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight } from "lucide-react";
import { PLATFORM_META, type Article } from "@/seo/data";

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  const pm = PLATFORM_META[article.platform] || PLATFORM_META.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25), ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#e7e2db] p-6 shadow-xs hover:shadow-lg hover:border-[#f50]/40 transition-all duration-200 overflow-hidden"
    >
      {/* Subtle top accent gradient on hover */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#f50] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Click target covering card */}
      <Link to="/blog/$slug" params={{ slug: article.slug }} className="absolute inset-0 z-10">
        <span className="sr-only">Read {article.h1}</span>
      </Link>

      <div>
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-3.5">
          {article.platform !== "general" && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ color: pm.color, backgroundColor: pm.bgColor, border: `1px solid ${pm.color}25` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pm.color }} />
              {pm.name}
            </span>
          )}
          <span className="text-[11px] font-semibold text-[#8c857b] uppercase tracking-wider bg-[#f3efe9] px-2.5 py-0.5 rounded-full">
            {article.category}
          </span>
          {article.difficulty && (
            <span className="text-[10px] font-medium text-[#8c857b] border border-[#e7e2db] px-2 py-0.5 rounded-md capitalize">
              {article.difficulty}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[16px] sm:text-[17px] font-bold text-[#191411] leading-snug tracking-tight mb-2.5 group-hover:text-[#f50] transition-colors duration-150">
          {article.h1}
        </h3>

        {/* Description */}
        <p className="text-[13.5px] text-[#544e47] leading-relaxed line-clamp-2 mb-5">
          {article.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#f3efe9] mt-auto">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8c857b]">
          <Clock size={12} className="text-[#8c857b]" />
          {article.readTime} min read
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#191411] group-hover:text-[#f50] group-hover:translate-x-0.5 transition-all">
          Read Guide
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.div>
  );
}
