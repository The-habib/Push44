import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UploadCloud, Archive, History, Settings } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import type { ReactNode } from "react";

const NAV: { to: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; center?: boolean }[] = [
  { to: "/dashboard",    icon: Home,        label: "Home"     },
  { to: "/repositories", icon: Archive,     label: "Repos"    },
  { to: "/push",         icon: UploadCloud, label: "Push",    center: true },
  { to: "/history",      icon: History,     label: "History"  },
  { to: "/settings",     icon: Settings,    label: "Settings" },
];

const NAV_SIDEBAR = [
  { to: "/dashboard",    icon: Home,        label: "Dashboard"   },
  { to: "/push",         icon: UploadCloud, label: "Push"        },
  { to: "/repositories", icon: Archive,     label: "Repositories"},
  { to: "/history",      icon: History,     label: "History"     },
  { to: "/settings",     icon: Settings,    label: "Settings"    },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/push":         "Push to GitHub",
  "/repositories": "Repositories",
  "/history":      "Push History",
  "/settings":     "Settings",
};

const SPRING_TAB   = { type: "spring", stiffness: 520, damping: 36 } as const;
const SPRING_NAV   = { type: "spring", stiffness: 400, damping: 32 } as const;
const SPRING_ICON  = { type: "spring", stiffness: 600, damping: 30 } as const;

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
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

function BottomNavItem({
  to,
  icon: Icon,
  label,
  active,
  center,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active: boolean;
  center?: boolean;
}) {
  const reduced = useReducedMotion();

  if (center) {
    return (
      <Link to={to} aria-current={active ? "page" : undefined} className="flex flex-col items-center relative -top-4">
        <motion.div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: "linear-gradient(145deg, #f97316, #ea580c)",
          }}
          animate={reduced ? {} : {
            scale: active ? 1.08 : 1,
            boxShadow: active
              ? "0 8px 28px rgba(249,115,22,0.55), 0 2px 8px rgba(0,0,0,0.12)"
              : "0 6px 20px rgba(249,115,22,0.38), 0 2px 8px rgba(0,0,0,0.1)",
          }}
          whileTap={reduced ? {} : { scale: 0.9 }}
          transition={SPRING_TAB}
        >
          {active && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.28), transparent 65%)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <Icon
            className="relative z-10 h-[22px] w-[22px] text-white"
            strokeWidth={active ? 2.5 : 2}
          />
        </motion.div>
        <motion.span
          className="text-[9px] font-bold mt-1 leading-none tracking-tight"
          animate={{ color: active ? "#f97316" : "rgba(0,0,0,0.3)", opacity: active ? 1 : 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </Link>
    );
  }

  return (
    <Link to={to} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-0.5 py-1 flex-1">
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: 44, height: 36 }}
        whileTap={reduced ? {} : { scale: 0.85 }}
        transition={SPRING_ICON}
      >
        {active && (
          <motion.div
            layoutId="mobile-nav-pill"
            className="absolute inset-0 rounded-[10px]"
            style={{ background: "rgba(249,115,22,0.12)" }}
            initial={false}
            transition={SPRING_TAB}
          />
        )}
        <motion.div
          animate={reduced ? {} : {
            scale: active ? 1.18 : 1,
            y: active ? -1 : 0,
          }}
          transition={SPRING_ICON}
        >
          <span style={{ color: active ? "#f97316" : "rgba(0,0,0,0.28)", display: "flex" }}>
            <Icon
              className="h-[19px] w-[19px] relative z-10 transition-none"
              strokeWidth={active ? 2.5 : 2}
            />
          </span>
        </motion.div>
        {active && (
          <motion.span
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-[#f97316]"
            layoutId="mobile-nav-dot"
            initial={false}
            transition={SPRING_TAB}
          />
        )}
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.span
            key="active-label"
            className="text-[10px] font-bold leading-none tracking-tight text-[#f97316]"
            initial={{ opacity: 0, y: 3, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3, scale: 0.85 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {label}
          </motion.span>
        ) : (
          <motion.span
            key="inactive-label"
            className="text-[10px] font-semibold leading-none tracking-tight"
            style={{ color: "rgba(0,0,0,0.22)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();
  const displayName = creds.displayName || creds.base44Email || creds.githubUsername || "";
  const pageTitle = PAGE_TITLES[pathname] ?? "Push44";
  const fullyConnected = !!((creds.base44Token || creds.rocketToken) && creds.githubToken);

  return (
    <div className="min-h-screen w-full" style={{ background: "#faf7f3" }}>

      {/* ── Desktop ─────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col sticky top-0 h-screen border-r border-[#f0ece4]"
          style={{ background: "#fffcf8" }}>

          {/* Logo */}
          <Link to="/dashboard">
            <div className="flex items-center gap-1 px-5 py-5 border-b border-[#f0ece4] cursor-pointer group">
              <motion.img
                src={appLogo} alt="Push44"
                className="h-8 w-8 rounded-xl object-cover"
                whileHover={{ scale: 1.08 }}
                transition={SPRING_NAV}
              />
              <span className="text-[16px] font-black text-[#1a1a1a] tracking-tight leading-none">
                Push<span className="text-[#f97316]">44</span>
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-4 space-y-0.5" aria-label="Main navigation">
            {NAV_SIDEBAR.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} aria-current={active ? "page" : undefined}>
                  <motion.div
                    className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-sm font-semibold cursor-pointer select-none"
                    whileHover={active ? {} : { background: "rgba(249,115,22,0.06)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-[12px]"
                        style={{ background: "#f97316" }}
                        initial={false}
                        transition={SPRING_TAB}
                      />
                    )}
                    <Icon
                      className="relative z-10 h-[16px] w-[16px] shrink-0"
                      style={{ color: active ? "#ffffff" : "rgba(0,0,0,0.35)" }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="relative z-10 text-[13px]" style={{ color: active ? "#ffffff" : "rgba(0,0,0,0.45)" }}>
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="px-3 py-4 border-t border-[#f0ece4]">
            <Link to="/settings">
              <motion.div
                className="flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 cursor-pointer"
                whileHover={{ background: "#fff4ed" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
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

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-4 border-b border-[#f0ece4]"
            style={{ background: "rgba(250,247,243,0.92)", backdropFilter: "blur(12px)" }}>
            <div>
              <h2 className="text-[16px] font-black text-[#1a1a1a] tracking-tight">{pageTitle}</h2>
            </div>
            <div className="flex items-center gap-2.5">
              <motion.a
                href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
                target="_blank" rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white border border-[#f0ece4] flex items-center justify-center text-[#9a8880]"
                whileHover={{ scale: 1.06, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                transition={SPRING_NAV}
              >
                <GitHubLogo className="h-3.5 w-3.5" />
              </motion.a>
              <Link to="/settings">
                <motion.div className="relative" whileHover={{ scale: 1.04 }} transition={SPRING_NAV}>
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#faf7f3] ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`} />
                </motion.div>
              </Link>
            </div>
          </header>

          <main className="flex-1 max-w-xl w-full mx-auto px-6 py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen">

        {/* Floating pill header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
          <motion.div
            className="pointer-events-auto w-full"
            style={{ maxWidth: 480 }}
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="flex items-center justify-between px-2 py-1.5 rounded-full"
              style={{
                background: "rgba(255,252,248,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 0 0 1px rgba(240,236,228,0.9), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Logo + wordmark */}
              <Link to="/dashboard" className="flex items-center gap-1 pl-2 pr-3 py-1">
                <motion.img src={appLogo} alt="Push44" className="h-7 w-7 rounded-[9px] object-cover"
                  whileTap={{ scale: 0.9, rotate: -4 }} transition={SPRING_NAV} />
                <span className="text-[14px] font-black text-[#1a1a1a] tracking-tight leading-none">
                  Push<span style={{ color: "#f97316" }}>44</span>
                </span>
              </Link>

              {/* Avatar */}
              <Link to="/settings">
                <motion.div className="relative mr-1" whileTap={{ scale: 0.88 }} transition={SPRING_NAV}>
                  <AvatarBubble name={displayName} size={34} fontSize={12} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                    style={{ boxShadow: "0 0 0 2px rgba(255,252,248,0.9)" }} />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        <main className="flex-1 px-4 pt-20 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 5, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom nav */}
        <motion.nav
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px]"
          aria-label="Main navigation"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "rgba(255,252,248,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 -1px 0 rgba(0,0,0,0.06), 0 -12px 40px rgba(0,0,0,0.07)",
            paddingBottom: "env(safe-area-inset-bottom, 8px)",
          }}
        >
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.2), transparent)" }} />

          <div className="flex items-end justify-around px-2 pt-2 pb-2">
            {NAV.map(({ to, icon, label, center }) => {
              const active = pathname === to;
              return (
                <BottomNavItem
                  key={to}
                  to={to}
                  icon={icon}
                  label={label}
                  active={active}
                  center={!!center}
                />
              );
            })}
          </div>
        </motion.nav>
      </div>
    </div>
  );
}
