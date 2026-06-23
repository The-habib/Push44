import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UploadCloud, Archive, History, Settings } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import type { ReactNode } from "react";

type NavItem = {
  to: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
};

const NAV: NavItem[] = [
  { to: "/dashboard",    icon: Home,        label: "Home"     },
  { to: "/push",         icon: UploadCloud, label: "Push"     },
  { to: "/repositories", icon: Archive,     label: "Repos"    },
  { to: "/history",      icon: History,     label: "History"  },
  { to: "/settings",     icon: Settings,    label: "Settings" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/push":         "Push to GitHub",
  "/repositories": "Repositories",
  "/history":      "Push History",
  "/settings":     "Settings",
};

const SP = { type: "spring", stiffness: 500, damping: 38 } as const;   // pill slide
const ST = { type: "spring", stiffness: 600, damping: 30 } as const;   // tap
const SN = { type: "spring", stiffness: 400, damping: 32 } as const;   // nav hover
const EO = [0.22, 1, 0.36, 1] as const;                                 // ease-out

/* ─── shared ──────────────────────────────────────────────── */
export function AvatarBubble({ name, size = 36, fontSize = 14 }: { name: string; size?: number; fontSize?: number }) {
  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0 select-none"
      style={{ width: size, height: size, fontSize, background: "linear-gradient(135deg,#f97316,#ea580c)" }}
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: EO }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[#1a1a1a] text-[14px] tracking-tight">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

/* ─── floating bottom nav ────────────────────────────────── */
function FloatingNav({ pathname }: { pathname: string }) {
  const reduced = useReducedMotion();

  return (
    /* Outer positioning wrapper */
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)", paddingLeft: 16, paddingRight: 16 }}>

      {/* The floating pill bar */}
      <motion.div
        className="pointer-events-auto flex items-center w-full"
        style={{
          maxWidth: 480,
          borderRadius: 28,
          padding: "6px 6px",
          background: "rgba(28, 25, 23, 0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        initial={{ y: 100, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: EO, delay: 0.05 }}
      >
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex items-center justify-center min-w-0"
            >
              <motion.div
                className="relative flex items-center justify-center h-11 w-full rounded-[20px] overflow-hidden"
                whileTap={reduced ? {} : { scale: 0.88 }}
                transition={ST}
              >
                {/* Sliding orange pill background */}
                {active && (
                  <motion.div
                    layoutId="fnav-pill"
                    className="absolute inset-0 rounded-[20px]"
                    style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
                    initial={false}
                    transition={SP}
                  />
                )}

                {/* Icon + expanding label */}
                <div className="relative z-10 flex items-center gap-[5px] px-1">
                  <span style={{ color: active ? "#fff" : "rgba(255,255,255,0.38)", display: "flex" }}>
                    <Icon
                      className="h-[19px] w-[19px] shrink-0"
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                  </span>

                  {/* Label: width-clips in/out so the pill expands smoothly */}
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.span
                        key={label}
                        className="text-[12px] font-bold text-white whitespace-nowrap overflow-hidden"
                        style={{ lineHeight: 1 }}
                        initial={{ opacity: 0, maxWidth: 0 }}
                        animate={{ opacity: 1, maxWidth: 72 }}
                        exit={{ opacity: 0, maxWidth: 0 }}
                        transition={{ duration: 0.24, ease: EO }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ─── app shell ──────────────────────────────────────────── */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();

  const displayName    = creds.displayName || creds.base44Email || creds.githubUsername || "";
  const pageTitle      = PAGE_TITLES[pathname] ?? "Push44";
  const fullyConnected = !!((creds.base44Token || creds.rocketToken) && creds.githubToken);

  return (
    <div className="min-h-screen w-full" style={{ background: "#faf7f3" }}>

      {/* ═══════════════════════════════════════════
          DESKTOP ≥ 1024px  — sidebar layout
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-60 shrink-0 flex flex-col sticky top-0 h-screen border-r border-[#f0ece4]"
          style={{ background: "#fffcf8" }}>

          <Link to="/dashboard">
            <div className="flex items-center gap-2 px-5 py-[18px] border-b border-[#f0ece4] cursor-pointer">
              <motion.img src={appLogo} alt="Push44"
                className="h-8 w-8 rounded-xl object-cover shrink-0"
                whileHover={{ scale: 1.07 }} transition={SN} />
              <span className="text-[16px] font-black text-[#1a1a1a] tracking-tight leading-none">
                Push<span className="text-[#f97316]">44</span>
              </span>
            </div>
          </Link>

          <nav className="flex-1 px-2.5 py-4 space-y-0.5" aria-label="Main navigation">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} aria-current={active ? "page" : undefined}>
                  <motion.div
                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] cursor-pointer select-none"
                    whileHover={active ? {} : { background: "rgba(249,115,22,0.06)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                  >
                    {active && (
                      <motion.div layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-[12px] bg-[#f97316]"
                        initial={false} transition={SP} />
                    )}
                    <span className="relative z-10 flex shrink-0"
                      style={{ color: active ? "#fff" : "rgba(0,0,0,0.38)" }}>
                      <Icon className="h-[15px] w-[15px]" strokeWidth={active ? 2.5 : 2} />
                    </span>
                    <span className="relative z-10 text-[13px] font-semibold"
                      style={{ color: active ? "#fff" : "rgba(0,0,0,0.5)" }}>
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-5 pt-3 border-t border-[#f0ece4]">
            <Link to="/settings">
              <motion.div
                className="flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 cursor-pointer"
                whileHover={{ background: "#fff4ed" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.14 }}
              >
                <div className="relative shrink-0">
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-[#1a1a1a] truncate leading-tight">{creds.displayName || "Account"}</div>
                  <div className="text-[10px] text-[#9a8880] truncate">{creds.base44Email || creds.githubUsername || "Not connected"}</div>
                </div>
              </motion.div>
            </Link>
          </div>
        </aside>

        {/* Desktop main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-[14px] border-b border-[#f0ece4]"
            style={{ background: "rgba(250,247,243,0.93)", backdropFilter: "blur(14px)" }}>
            <h2 className="text-[16px] font-black text-[#1a1a1a] tracking-tight">{pageTitle}</h2>
            <div className="flex items-center gap-2.5">
              <motion.a
                href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
                target="_blank" rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white border border-[#f0ece4] flex items-center justify-center"
                style={{ color: "#9a8880" }}
                whileHover={{ scale: 1.06, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                transition={SN}
              >
                <GitHubLogo className="h-3.5 w-3.5" />
              </motion.a>
              <Link to="/settings">
                <motion.div className="relative" whileHover={{ scale: 1.04 }} transition={SN}>
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#faf7f3] ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`} />
                </motion.div>
              </Link>
            </div>
          </header>

          <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.26, ease: EO }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE + TABLET < 1024px  — floating nav
      ═══════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-screen">

        {/* Top header bar */}
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 border-b border-[#ede9e1]/70"
          style={{
            height: 56,
            background: "rgba(255,252,248,0.93)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <motion.img src={appLogo} alt="Push44"
              className="h-8 w-8 rounded-[10px] object-cover shrink-0"
              whileTap={{ scale: 0.88 }} transition={ST} />
            <span className="text-[15px] font-black text-[#1a1a1a] tracking-tight leading-none">
              Push<span style={{ color: "#f97316" }}>44</span>
            </span>
          </Link>

          <Link to="/settings">
            <motion.div className="relative" whileTap={{ scale: 0.88 }} transition={ST}>
              <AvatarBubble name={displayName} size={36} fontSize={13} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                style={{ boxShadow: "0 0 0 2px rgba(255,252,248,1)" }}
              />
            </motion.div>
          </Link>
        </header>

        {/* Page content — padded away from fixed header and floating nav */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4" style={{ paddingTop: 68, paddingBottom: 96 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.26, ease: EO }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating pill bottom nav */}
        <FloatingNav pathname={pathname} />
      </div>
    </div>
  );
}
