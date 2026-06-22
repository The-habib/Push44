import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UploadCloud, Archive, History, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard",    icon: Home,        label: "Dashboard" },
  { to: "/push",         icon: UploadCloud, label: "Push"      },
  { to: "/repositories", icon: Archive,     label: "Repos"     },
  { to: "/history",      icon: History,     label: "History"   },
  { to: "/settings",     icon: Settings,    label: "Settings"  },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/push":         "Push to GitHub",
  "/repositories": "Repositories",
  "/history":      "Push History",
  "/settings":     "Settings",
};

const spring = { type: "spring", stiffness: 360, damping: 30 } as const;

export function AvatarBubble({ name, size = 36, fontSize = 14 }: { name: string; size?: number; fontSize?: number }) {
  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0 select-none"
      style={{ width: size, height: size, fontSize, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
    >
      {initials}
    </div>
  );
}

export function SectionCard({ title, action, children, className = "" }: {
  title?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <motion.section
      className={`bg-white rounded-[20px] p-5 mb-4 border border-black/[0.055] ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-black text-[14px] tracking-tight">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();
  const displayName = creds.displayName || creds.base44Email || creds.githubUsername || "";
  const pageTitle = PAGE_TITLES[pathname] ?? "Push44";

  return (
    <div className="min-h-screen w-full" style={{ background: "#f3f2ee" }}>

      {/* ── Desktop ─────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col sticky top-0 h-screen border-r border-black/[0.07]"
          style={{ background: "#fefefe" }}>

          {/* Logo */}
          <Link to="/dashboard">
            <div className="flex items-center gap-1.5 px-5 py-5 border-b border-black/[0.06] cursor-pointer group">
              <motion.img
                src={appLogo} alt="Push44"
                className="h-8 w-8 rounded-xl object-cover"
                whileHover={{ scale: 1.08 }}
                transition={spring}
              />
              <span className="text-[16px] font-extrabold text-black tracking-tight leading-none">
                Push<span style={{ color: "#8b5cf6" }}>44</span>
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-4 space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to}>
                  <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-sm font-semibold cursor-pointer select-none transition-colors group">
                    {active && (
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-[12px]"
                        style={{ background: "#1a1a1a" }}
                        initial={false}
                        transition={spring}
                      />
                    )}
                    <Icon
                      className="relative z-10 h-[16px] w-[16px] shrink-0"
                      style={{ color: active ? "#ffffff" : "rgba(0,0,0,0.38)" }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="relative z-10 text-[13px]" style={{ color: active ? "#ffffff" : "rgba(0,0,0,0.5)" }}>
                      {label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="px-3 py-4 border-t border-black/[0.06]">
            <Link to="/settings">
              <motion.div
                className="flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 cursor-pointer"
                whileHover={{ background: "#f3f2ee" }}
                transition={{ duration: 0.15 }}
              >
                <div className="relative shrink-0">
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-black truncate leading-tight">{creds.displayName || "Account"}</div>
                  <div className="text-[10px] text-black/35 truncate">{creds.base44Email || creds.githubUsername || "Not connected"}</div>
                </div>
              </motion.div>
            </Link>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-4 border-b border-black/[0.07]"
            style={{ background: "rgba(243,242,238,0.92)", backdropFilter: "blur(12px)" }}>
            <div>
              <h2 className="text-[16px] font-extrabold text-black tracking-tight">{pageTitle}</h2>
            </div>
            <div className="flex items-center gap-2.5">
              <motion.a
                href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
                target="_blank" rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white border border-black/[0.07] flex items-center justify-center text-black/40"
                whileHover={{ scale: 1.06, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                transition={spring}
              >
                <GitHubLogo className="h-3.5 w-3.5" />
              </motion.a>
              <Link to="/settings">
                <motion.div className="relative" whileHover={{ scale: 1.04 }} transition={spring}>
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
                </motion.div>
              </Link>
            </div>
          </header>

          <main className="flex-1 max-w-xl w-full mx-auto px-6 py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen">

        {/* Mobile header */}
        <header className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/[0.06]"
          style={{ background: "#f3f2ee" }}>
          <Link to="/dashboard" className="flex items-center gap-1.5">
            <motion.img src={appLogo} alt="Push44" className="h-9 w-9 rounded-2xl object-cover"
              whileTap={{ scale: 0.92 }} transition={spring} />
            <span className="text-[18px] font-extrabold text-black tracking-tight leading-none">
              Push<span style={{ color: "#8b5cf6" }}>44</span>
            </span>
          </Link>
          <Link to="/settings">
            <motion.div className="relative" whileTap={{ scale: 0.9 }} transition={spring}>
              <AvatarBubble name={displayName} size={38} fontSize={13} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
            </motion.div>
          </Link>
        </header>

        <main className="flex-1 px-4 pt-4 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[0.07] rounded-t-[22px] px-2 pt-2 pb-7"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", boxShadow: "0 -1px 0 rgba(0,0,0,0.06), 0 -8px 28px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-around">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="flex flex-col items-center gap-1 py-1 px-3">
                  <motion.div
                    className="relative h-9 w-10 flex items-center justify-center rounded-[10px]"
                    whileTap={{ scale: 0.84 }}
                    transition={spring}
                  >
                    {active && (
                      <motion.div
                        layoutId="mobile-pill"
                        className="absolute inset-0 rounded-[10px]"
                        style={{ background: "#1a1a1a" }}
                        initial={false}
                        transition={spring}
                      />
                    )}
                    <Icon
                      className="relative z-10 h-[18px] w-[18px]"
                      style={{ color: active ? "#ffffff" : "rgba(0,0,0,0.32)" }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-bold leading-none tracking-tight"
                    style={{ color: active ? "#000" : "rgba(0,0,0,0.3)" }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
