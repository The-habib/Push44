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

const SPRING_PILL = { type: "spring", stiffness: 480, damping: 38 } as const;
const SPRING_TAP  = { type: "spring", stiffness: 600, damping: 32 } as const;
const SPRING_NAV  = { type: "spring", stiffness: 400, damping: 32 } as const;
const EASE_OUT    = [0.22, 1, 0.36, 1] as const;

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
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0 select-none"
      style={{
        width: size,
        height: size,
        fontSize,
        background: "linear-gradient(135deg,#f97316,#ea580c)",
      }}
    >
      {initials}
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
      className={`bg-white rounded-[20px] p-5 mb-4 border border-black/[0.055] ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
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

/* ─── Bottom nav item ─────────────────────────────────────────────── */
function BottomNavItem({ to, icon: Icon, label, active }: NavItem & { active: boolean }) {
  const reduced = useReducedMotion();
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className="flex-1 flex flex-col items-center justify-center py-2 gap-[5px] min-w-0 relative select-none"
    >
      {/* Icon container */}
      <motion.div
        className="relative flex items-center justify-center w-10 h-8 rounded-[10px]"
        whileTap={reduced ? {} : { scale: 0.82 }}
        transition={SPRING_TAP}
      >
        {/* Sliding pill background */}
        {active && (
          <motion.div
            layoutId="bottom-nav-pill"
            className="absolute inset-0 rounded-[10px]"
            style={{ background: "rgba(249,115,22,0.13)" }}
            initial={false}
            transition={SPRING_PILL}
          />
        )}

        {/* Icon */}
        <span
          className="relative z-10 flex items-center justify-center transition-none"
          style={{ color: active ? "#f97316" : "rgba(0,0,0,0.3)" }}
        >
          <motion.span
            animate={reduced ? {} : { scale: active ? 1.12 : 1 }}
            transition={SPRING_PILL}
            className="flex"
          >
            <Icon
              className="h-[19px] w-[19px]"
              strokeWidth={active ? 2.5 : 1.9}
            />
          </motion.span>
        </span>
      </motion.div>

      {/* Label */}
      <span
        className="text-[10px] leading-none font-semibold tracking-tight truncate max-w-full px-0.5"
        style={{ color: active ? "#f97316" : "rgba(0,0,0,0.3)", fontWeight: active ? 700 : 500 }}
      >
        {label}
      </span>

      {/* Active dot indicator */}
      {active && (
        <motion.span
          layoutId="bottom-nav-dot"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-4 rounded-full"
          style={{ background: "#f97316" }}
          initial={false}
          transition={SPRING_PILL}
        />
      )}
    </Link>
  );
}

/* ─── App Shell ───────────────────────────────────────────────────── */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();

  const displayName = creds.displayName || creds.base44Email || creds.githubUsername || "";
  const pageTitle   = PAGE_TITLES[pathname] ?? "Push44";
  const fullyConnected = !!((creds.base44Token || creds.rocketToken) && creds.githubToken);

  return (
    <div className="min-h-screen w-full" style={{ background: "#faf7f3" }}>

      {/* ════════════════════════════════════════════════════
          DESKTOP / LARGE TABLET  ≥ 1024 px
      ════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen">

        {/* Sidebar */}
        <aside
          className="w-60 shrink-0 flex flex-col sticky top-0 h-screen border-r border-[#f0ece4]"
          style={{ background: "#fffcf8" }}
        >
          {/* Brand */}
          <Link to="/dashboard">
            <div className="flex items-center gap-2 px-5 py-[18px] border-b border-[#f0ece4] cursor-pointer">
              <motion.img
                src={appLogo}
                alt="Push44"
                className="h-8 w-8 rounded-xl object-cover shrink-0"
                whileHover={{ scale: 1.07 }}
                transition={SPRING_NAV}
              />
              <span className="text-[16px] font-black text-[#1a1a1a] tracking-tight leading-none">
                Push<span className="text-[#f97316]">44</span>
              </span>
            </div>
          </Link>

          {/* Nav items */}
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
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-[12px] bg-[#f97316]"
                        initial={false}
                        transition={SPRING_PILL}
                      />
                    )}
                    <span
                      className="relative z-10 flex items-center shrink-0"
                      style={{ color: active ? "#fff" : "rgba(0,0,0,0.38)" }}
                    >
                      <Icon className="h-[15px] w-[15px]" strokeWidth={active ? 2.5 : 2} />
                    </span>
                    <span
                      className="relative z-10 text-[13px] font-semibold"
                      style={{ color: active ? "#fff" : "rgba(0,0,0,0.5)" }}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
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
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-[#1a1a1a] truncate leading-tight">
                    {creds.displayName || "Account"}
                  </div>
                  <div className="text-[10px] text-[#9a8880] truncate">
                    {creds.base44Email || creds.githubUsername || "Not connected"}
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header
            className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-[14px] border-b border-[#f0ece4]"
            style={{ background: "rgba(250,247,243,0.93)", backdropFilter: "blur(14px)" }}
          >
            <h2 className="text-[16px] font-black text-[#1a1a1a] tracking-tight">{pageTitle}</h2>
            <div className="flex items-center gap-2.5">
              <motion.a
                href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white border border-[#f0ece4] flex items-center justify-center"
                style={{ color: "#9a8880" }}
                whileHover={{ scale: 1.06, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                transition={SPRING_NAV}
              >
                <GitHubLogo className="h-3.5 w-3.5" />
              </motion.a>
              <Link to="/settings">
                <motion.div className="relative" whileHover={{ scale: 1.04 }} transition={SPRING_NAV}>
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#faf7f3] ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                  />
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
                transition={{ duration: 0.26, ease: EASE_OUT }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MOBILE + TABLET  < 1024 px  (bottom nav layout)
      ════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-screen">

        {/* ── Top bar ─────────────────────────────────── */}
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-[#f0ece4]/80"
          style={{
            background: "rgba(255,252,248,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <motion.img
              src={appLogo}
              alt="Push44"
              className="h-8 w-8 rounded-[10px] object-cover shrink-0"
              whileTap={{ scale: 0.9 }}
              transition={SPRING_NAV}
            />
            <span className="text-[15px] font-black text-[#1a1a1a] tracking-tight leading-none">
              Push<span style={{ color: "#f97316" }}>44</span>
            </span>
          </Link>

          <Link to="/settings">
            <motion.div
              className="relative"
              whileTap={{ scale: 0.88 }}
              transition={SPRING_NAV}
            >
              <AvatarBubble name={displayName} size={36} fontSize={13} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                style={{ boxShadow: "0 0 0 2px rgba(255,252,248,0.95)" }}
              />
            </motion.div>
          </Link>
        </header>

        {/* ── Page content ────────────────────────────── */}
        {/* pt accounts for header (~56px), pb accounts for bottom nav (~68px) */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-[64px] pb-[76px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.26, ease: EASE_OUT }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Bottom nav ──────────────────────────────── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#ede9e1]"
          aria-label="Main navigation"
          style={{
            background: "rgba(255,252,248,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="flex items-stretch h-[60px] max-w-2xl mx-auto px-1">
            {NAV.map(({ to, icon, label }) => (
              <BottomNavItem
                key={to}
                to={to}
                icon={icon}
                label={label}
                active={pathname === to}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
