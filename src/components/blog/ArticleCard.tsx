import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PLATFORM_META, type Article } from "@/seo/data";

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  const pm = PLATFORM_META[article.platform] || PLATFORM_META.general;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col gap-4 bg-white/70 backdrop-blur-xl border border-[#f0ece4] rounded-[20px] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-orange-200/50 transition-all duration-300"
    >
      <div className="flex items-center gap-3 flex-wrap">
        {article.platform !== "general" && (
          <span 
            className="text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md"
            style={{ color: pm.color, backgroundColor: pm.bgColor, borderColor: `${pm.color}33` }}
          >
            {pm.name}
          </span>
        )}
        <span className="text-xs text-stone-500 font-medium tracking-wide uppercase">
          {article.category}
        </span>
      </div>
      
      <Link to="/blog/$slug" params={{ slug: article.slug }} className="absolute inset-0 z-10">
        <span className="sr-only">Read {article.h1}</span>
      </Link>
      
      <h3 className="text-[19px] font-bold text-stone-800 leading-snug tracking-tight group-hover:text-orange-600 transition-colors">
        {article.h1}
      </h3>
      
      <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mt-auto">
        {article.description}
      </p>
      
      <div className="flex items-center gap-3 text-xs text-stone-400 font-medium pt-2 border-t border-stone-100 mt-2">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {article.readTime} min read
        </span>
        <span>&middot;</span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {article.views.toLocaleString()} views
        </span>
      </div>
    </motion.div>
  );
}