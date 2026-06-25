import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UploadCloud, Archive, History, Settings } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import { useEffect, useRef, type ReactNode } from "react";

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

const SP = { type: "spring", stiffness: 500, damping: 38 } as const;
const ST = { type: "spring", stiffness: 600, damping: 30 } as const;
const SN = { type: "spring", stiffness: 400, damping: 32 } as const;
const EO = [0.22, 1, 0.36, 1] as const;

const PAGE_X = 18;
const pageVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * PAGE_X }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.26, ease: EO } },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -PAGE_X * 0.5, transition: { duration: 0.08, ease: [0.4, 0, 1, 1] } }),
};

export function AvatarBubble({ name, size = 36, fontSize = 14 }: { name: string; size?: number; fontSize?: number }) {
  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0 select-none"
      style={{
        width: size, height: size, fontSize,
        background: "linear-gradient(135deg,#fb923c 0%,#f97316 50%,#ea580c 100%)",
        boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
      }}
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
      className={`rounded-[22px] p-5 mb-4 ${className}`}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EO }}
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

let navHasShown = false;

function BottomNav({ pathname }: { pathname: string }) {
  const reduced = useReducedMotion();
  const isFirst = !navHasShown;
  if (isFirst) navHasShown = true;

  return (
    <div
      className="shrink-0 flex items-center justify-center"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <motion.div
        className="flex items-center w-full overflow-hidden"
        style={{
          maxWidth: 420,
          borderRadius: 28,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
          padding: "4px",
        }}
        initial={isFirst && !reduced ? { opacity: 0, y: 32, scale: 0.86 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.4, 0.64, 1], delay: 0.05 }}
      >
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className="w-[20%] flex items-center justify-center shrink-0"
            >
              <motion.div
                className="relative flex items-center justify-center h-11 w-full overflow-hidden"
                style={{ borderRadius: 22 }}
                whileTap={reduced ? {} : { scale: 0.80, rotate: -1.5 }}
                transition={{ type: "spring", stiffness: 700, damping: 22 }}
              >
                {active && (
                  <motion.div
                    layoutId="fnav-pill"
                    className="absolute inset-0"
                    style={{
                      borderRadius: 22,
                      background: "linear-gradient(140deg, #fb923c 0%, #f97316 45%, #ea580c 100%)",
                      boxShadow: "0 6px 20px rgba(249,115,22,0.45), 0 2px 8px rgba(249,115,22,0.30)",
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 620, damping: 26, mass: 0.75 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-[5px] px-1.5">
                  <motion.span
                    style={{ display: "flex" }}
                    animate={{
                      color: active ? "#fff" : "rgba(26,26,26,0.35)",
                      scale: active ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.25, ease: EO }}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 1.75} />
                  </motion.span>
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.span
                        key={label}
                        className="text-[11px] font-bold text-white whitespace-nowrap overflow-hidden"
                        style={{ lineHeight: 1 }}
                        initial={{ opacity: 0, x: -8, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: -6, width: 0 }}
                        transition={{ duration: 0.26, ease: EO }}
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

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();
  const reduced = useReducedMotion();

  const displayName    = creds.displayName || creds.base44Email || creds.githubUsername || "";
  const pageTitle      = PAGE_TITLES[pathname] ?? "Push44";
  const fullyConnected = !!((creds.base44Token || creds.rocketToken || creds.flootToken || creds.ziteSession) && creds.githubToken);

  const prevPathRef = useRef(pathname);
  const dirRef      = useRef(1);
  if (prevPathRef.current !== pathname) {
    const prevIdx = NAV.findIndex(n => n.to === prevPathRef.current);
    const currIdx = NAV.findIndex(n => n.to === pathname);
    if (prevIdx !== -1 && currIdx !== -1) {
      dirRef.current = currIdx > prevIdx ? 1 : -1;
    }
    prevPathRef.current = pathname;
  }
  const direction = reduced ? 0 : dirRef.current;

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div
      className="w-full"
      style={{
        background: "linear-gradient(145deg, #faf8f5 0%, #f5f2ec 50%, #f8f5f0 100%)",
        minHeight: "100dvh",
      }}
    >
      {/* Subtle background mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(249,115,22,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.03) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      {/* ═══════════════ DESKTOP ≥ 1024px ═══════════════ */}
      <div className="hidden lg:flex min-h-[100dvh] relative z-10">
        <aside
          className="w-64 shrink-0 flex flex-col sticky top-0 h-screen"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "2px 0 20px rgba(0,0,0,0.04)",
          }}
        >
          <Link to="/dashboard">
            <div className="flex items-center gap-2.5 px-5 py-5 cursor-pointer" style={{ borderBottom: "1px solid rgba(0,0,0,0.055)" }}>
              <motion.img src={appLogo} alt="Push44"
                className="h-9 w-9 rounded-[14px] object-cover shrink-0"
                style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.25)" }}
                whileHover={{ scale: 1.07 }} transition={SN} />
              <span className="text-[17px] font-black text-[#1a1a1a] tracking-[-0.02em] leading-none">
                Push<span className="text-[#f97316]">44</span>
              </span>
            </div>
          </Link>

          <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Main navigation">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} aria-current={active ? "page" : undefined}>
                  <motion.div
                    className="relative flex items-center gap-3 px-3.5 py-3 rounded-[14px] cursor-pointer select-none"
                    whileHover={active ? {} : { background: "rgba(249,115,22,0.06)", x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-[14px]"
                        style={{
                          background: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
                          boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                        }}
                        initial={false}
                        transition={SP}
                      />
                    )}
                    <span className="relative z-10 flex shrink-0"
                      style={{ color: active ? "#fff" : "rgba(0,0,0,0.32)" }}>
                      <Icon className="h-[15px] w-[15px]" strokeWidth={active ? 2.5 : 2} />
                    </span>
                    <span className="relative z-10 text-[13.5px] font-semibold"
                      style={{ color: active ? "#fff" : "rgba(0,0,0,0.45)" }}>
                      {label}
                    </span>
                    {active && (
                      <motion.span
                        className="relative z-10 ml-auto h-1 w-1 rounded-full bg-white/60"
                        layoutId="sidebar-dot"
                        initial={false}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-5 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.055)" }}>
            <Link to="/settings">
              <motion.div
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 cursor-pointer"
                whileHover={{ background: "rgba(249,115,22,0.06)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.14 }}
              >
                <div className="relative shrink-0">
                  <AvatarBubble name={displayName} size={34} fontSize={11} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                    style={{ boxShadow: "0 0 0 2px white" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1a1a1a] truncate leading-tight">{creds.displayName || "Account"}</div>
                  <div className="text-[10.5px] text-[#9a8880] truncate">{creds.base44Email || creds.githubUsername || "Not connected"}</div>
                </div>
              </motion.div>
            </Link>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          <header
            className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-[15px]"
            style={{
              background: "rgba(250,248,245,0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0,0,0,0.055)",
              boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h2 className="text-[16px] font-black text-[#1a1a1a] tracking-[-0.02em]">{pageTitle}</h2>
            <div className="flex items-center gap-2.5">
              <motion.a
                href={creds.githubUsername ? `https://github.com/${creds.githubUsername}` : "https://github.com"}
                target="_blank" rel="noreferrer"
                className="h-8 w-8 rounded-[10px] flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", color: "#9a8880" }}
                whileHover={{ scale: 1.06, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                transition={SN}
              >
                <GitHubLogo className="h-3.5 w-3.5" />
              </motion.a>
              <Link to="/settings">
                <motion.div className="relative" whileHover={{ scale: 1.04 }} transition={SN}>
                  <AvatarBubble name={displayName} size={32} fontSize={11} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                    style={{ boxShadow: "0 0 0 2px rgba(250,248,245,1)" }}
                  />
                </motion.div>
              </Link>
            </div>
          </header>

          <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-7">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={pathname}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ═══════════════ MOBILE + TABLET < 1024px ═══════════════ */}
      <div className="lg:hidden h-[100dvh] flex flex-col overflow-hidden relative z-10">

        <header
          className="shrink-0 flex items-center justify-between px-4"
          style={{
            height: 58,
            background: "rgba(250,248,245,0.88)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderBottom: "1px solid rgba(0,0,0,0.055)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <motion.img
              src={appLogo}
              alt="Push44"
              className="h-8 w-8 rounded-[11px] object-cover shrink-0"
              style={{ boxShadow: "0 3px 10px rgba(249,115,22,0.22)" }}
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.88 }}
              transition={ST}
            />
            <span className="text-[15.5px] font-black text-[#1a1a1a] tracking-[-0.02em] leading-none">
              Push<span style={{ color: "#f97316" }}>44</span>
            </span>
          </Link>

          <Link to="/settings">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.88 }}
              transition={ST}
            >
              <AvatarBubble name={displayName} size={36} fontSize={13} />
              <motion.span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${fullyConnected ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                style={{ boxShadow: "0 0 0 2px rgba(250,248,245,1)" }}
                animate={{ scale: fullyConnected ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              />
            </motion.div>
          </Link>
        </header>

        <div className="flex-1 relative overflow-hidden">
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto"
            style={{ overflowX: "clip" }}
          >
            <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-4">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={pathname}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <BottomNav pathname={pathname} />
      </div>
    </div>
  );
}
