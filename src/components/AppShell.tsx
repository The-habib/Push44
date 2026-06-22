import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  UploadCloud,
  Archive,
  History,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/push", icon: UploadCloud, label: "Push" },
  { to: "/repositories", icon: Archive, label: "Repos" },
  { to: "/history", icon: History, label: "History" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function AvatarBubble({
  name,
  size = 36,
  fontSize = 14,
}: {
  name: string;
  size?: number;
  fontSize?: number;
}) {
  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize,
        background: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
      }}
    >
      {initials}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();
  const displayName =
    creds.displayName || creds.base44Email || creds.githubUsername || "";

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#f3f2ee" }}>

      {/* ── Desktop layout ──────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">

        {/* Sidebar */}
        <aside
          className="w-64 shrink-0 flex flex-col sticky top-0 h-screen border-r"
          style={{ backgroundColor: "#ffffff", borderColor: "#e8e6e0" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "#e8e6e0" }}>
            <motion.img
              src={appLogo}
              alt="Push44"
              className="h-10 w-10 rounded-2xl object-cover shrink-0"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            />
            <span className="text-[20px] font-extrabold text-black tracking-tight">
              Push<span className="text-[#8b5cf6]">44</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to}>
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-sm transition-colors relative overflow-hidden ${
                      active
                        ? "text-black"
                        : "text-black/50 hover:text-black"
                    }`}
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: "#dce99a" }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!active && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-black/5 opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 py-4 border-t" style={{ borderColor: "#e8e6e0" }}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <AvatarBubble name={displayName} size={36} fontSize={13} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-black truncate">
                  {creds.displayName || "My Account"}
                </div>
                <div className="text-[11px] text-black/40 truncate">
                  {creds.base44Email || creds.githubUsername || "Not connected"}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop topbar */}
          <header
            className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b bg-white/80 backdrop-blur-sm"
            style={{ borderColor: "#e8e6e0" }}
          >
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <motion.a
                href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-[#f3f2ee] flex items-center justify-center text-black/50"
                whileHover={{ scale: 1.08, backgroundColor: "#1a1a1a", color: "#fff" }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <GitHubLogo className="h-4 w-4" />
              </motion.a>
              <div className="relative">
                <AvatarBubble name={displayName} size={36} fontSize={13} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-8 py-6 max-w-3xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Mobile layout ───────────────────────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-5 pt-4 pb-3 bg-[#f3f2ee]">
          <Link to="/" className="flex items-center gap-2.5">
            <motion.img
              src={appLogo}
              alt="Push44"
              className="h-11 w-11 rounded-2xl object-cover shrink-0 shadow-sm"
              whileTap={{ scale: 0.92, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            />
            <h1 className="text-[22px] font-extrabold text-black tracking-tight">
              Push<span className="text-[#8b5cf6]">44</span>
            </h1>
          </Link>
          <Link to="/settings" className="relative block">
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <AvatarBubble name={displayName} size={44} fontSize={16} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
            </motion.div>
          </Link>
        </header>

        {/* Mobile page content */}
        <main className="flex-1 px-5 pt-2 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.09)] px-4 pt-3 pb-6 z-50">
          <div className="flex items-center justify-between">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="flex flex-col items-center gap-1 flex-1">
                  <motion.span
                    className={`h-9 w-12 rounded-full flex items-center justify-center relative`}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: "#dce99a" }}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        />
                      )}
                    </AnimatePresence>
                    <Icon
                      className={`h-5 w-5 relative z-10 ${active ? "text-black" : "text-black/70"}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.span>
                  <motion.span
                    className={`text-[10px] ${active ? "font-bold text-black" : "text-black/60 font-medium"}`}
                    animate={{ scale: active ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {label}
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={`bg-white rounded-3xl p-5 mb-5 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-black text-base">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
