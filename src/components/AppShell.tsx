import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UploadCloud, Archive, History, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import type { ReactNode } from "react";

const NAV = [
  { to: "/",            icon: Home,        label: "Dashboard" },
  { to: "/push",        icon: UploadCloud, label: "Push"      },
  { to: "/repositories",icon: Archive,     label: "Repos"     },
  { to: "/history",     icon: History,     label: "History"   },
  { to: "/settings",    icon: Settings,    label: "Settings"  },
] as const;

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
      className={`bg-white rounded-3xl p-5 mb-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-black text-[15px]">{title}</h3>
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

  return (
    <div className="min-h-screen w-full" style={{ background: "#f3f2ee" }}>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">
        <aside className="w-60 shrink-0 flex flex-col sticky top-0 h-screen border-r border-black/[0.06] bg-white">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-black/[0.06]">
            <motion.img
              src={appLogo} alt="Push44"
              className="h-9 w-9 rounded-xl object-cover"
              whileHover={{ scale: 1.07 }}
              transition={spring}
            />
            <span className="text-[18px] font-extrabold text-black tracking-tight">
              Push<span style={{ color: "#8b5cf6" }}>44</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to}>
                  <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer select-none">
                    {active && (
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "#dce99a" }}
                        initial={false}
                        transition={spring}
                      />
                    )}
                    <Icon
                      className="relative z-10 h-[17px] w-[17px] shrink-0"
                      style={{ color: active ? "#000" : "rgba(0,0,0,0.4)" }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="relative z-10" style={{ color: active ? "#000" : "rgba(0,0,0,0.45)" }}>
                      {label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-black/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <AvatarBubble name={displayName} size={34} fontSize={12} />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-black truncate">{creds.displayName || "Account"}</div>
                <div className="text-[11px] text-black/40 truncate">{creds.base44Email || creds.githubUsername || "Not connected"}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 flex items-center justify-end gap-3 px-8 py-4 border-b border-black/[0.06] bg-white/90 backdrop-blur-sm">
            <motion.a
              href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
              target="_blank" rel="noreferrer"
              className="h-9 w-9 rounded-xl bg-[#f3f2ee] flex items-center justify-center text-black/40"
              whileHover={{ scale: 1.06, background: "#1a1a1a" }}
              transition={spring}
            >
              <GitHubLogo className="h-4 w-4" />
            </motion.a>
            <div className="relative">
              <AvatarBubble name={displayName} size={34} fontSize={12} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto px-8 py-7">
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

      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link to="/" className="flex items-center gap-2.5">
            <motion.img src={appLogo} alt="Push44" className="h-10 w-10 rounded-2xl object-cover"
              whileTap={{ scale: 0.92 }} transition={spring} />
            <span className="text-[20px] font-extrabold text-black tracking-tight">
              Push<span style={{ color: "#8b5cf6" }}>44</span>
            </span>
          </Link>
          <Link to="/settings">
            <motion.div className="relative" whileTap={{ scale: 0.9 }} transition={spring}>
              <AvatarBubble name={displayName} size={42} fontSize={15} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
            </motion.div>
          </Link>
        </header>

        <main className="flex-1 px-4 pt-2 pb-28">
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur-xl border-t border-black/[0.06] rounded-t-[24px] shadow-[0_-1px_0_rgba(0,0,0,0.06),0_-8px_32px_rgba(0,0,0,0.07)] px-2 pt-2 pb-6 z-50">
          <div className="flex items-center justify-around">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="flex flex-col items-center gap-1 py-1 px-3">
                  <motion.div
                    className="relative h-9 w-10 flex items-center justify-center rounded-full"
                    whileTap={{ scale: 0.86 }}
                    transition={spring}
                  >
                    {active && (
                      <motion.div
                        layoutId="mobile-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "#dce99a" }}
                        initial={false}
                        transition={spring}
                      />
                    )}
                    <Icon
                      className="relative z-10 h-[19px] w-[19px]"
                      style={{ color: active ? "#000" : "rgba(0,0,0,0.35)" }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-semibold leading-none"
                    style={{ color: active ? "#000" : "rgba(0,0,0,0.35)" }}
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
