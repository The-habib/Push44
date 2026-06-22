import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, GitBranch, FileText, Lock, MessageSquare, Loader2,
  ChevronDown, Plus, Check, AlertCircle, ExternalLink,
  File, FileCode2, FileJson, Image, Braces,
} from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps, fetchBase44AppFiles } from "@/lib/base44-api";
import { listRocketApps, fetchRocketAppFiles } from "@/lib/rocket-api";
import { listGitHubRepos, createGitHubRepo, pushFilesToGitHub } from "@/lib/github-api";
import { addHistory } from "@/lib/storage";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/push")({
  head: () => ({
    meta: [
      { title: "Push to GitHub · Push44" },
      { name: "description", content: "Select a Base44 or Rocket.new app, pick a GitHub repo and push all source files in one atomic commit." },
    ],
  }),
  component: PushPage,
});

type Platform = "base44" | "rocket";
interface App  { id: string; name: string; updated_at: string; icon?: string }
interface Repo { full_name: string; default_branch: string; html_url: string }
interface FileEntry { path: string; content: string }
type PushStatus = "idle" | "pushing" | "done" | "error";

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <motion.div
      className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
      animate={{
        background: done ? "#22c55e" : active ? "#f97316" : "#f0ece4",
        color: done || active ? "#fff" : "#9a8880",
      }}
      transition={{ duration: 0.2 }}
    >
      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
    </motion.div>
  );
}

function SectionShell({ step, label, active, done, children }: { step: number; label: string; active: boolean; done: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      className="bg-white rounded-[24px] border mb-3 overflow-hidden"
      animate={{ borderColor: active ? "rgba(249,115,22,0.3)" : "#f0ece4" }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f7f4f0]">
        <StepBadge n={step} active={active} done={done} />
        <span className="text-[14px] font-black text-[#1a1a1a]">{label}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

function fileIcon(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (["tsx", "jsx"].includes(ext)) return { Icon: FileCode2, color: "#06b6d4" };
  if (["ts", "js", "mjs"].includes(ext)) return { Icon: FileCode2, color: "#f59e0b" };
  if (ext === "json") return { Icon: FileJson, color: "#10b981" };
  if (["css", "scss", "sass"].includes(ext)) return { Icon: Braces, color: "#a855f7" };
  if (["md", "mdx", "txt"].includes(ext)) return { Icon: FileText, color: "#6b7280" };
  if (["png", "jpg", "jpeg", "svg", "webp", "gif", "ico"].includes(ext)) return { Icon: Image, color: "#f97316" };
  return { Icon: File, color: "#9a8880" };
}

function FileBrowser({ files }: { files: { path: string; content: string }[] }) {
  const totalLines = files.reduce((acc, f) => acc + f.content.split("\n").length, 0);
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-3"
    >
      <div className="bg-white rounded-[22px] border border-[#f0ece4] overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>

        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5f2ee]">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full flex items-center justify-center"
              style={{ background: "#22c55e" }}>
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-black text-[#1a1a1a]">{files.length} files ready</span>
          </div>
          <span className="text-[11px] text-[#9a8880] font-medium">{totalLines.toLocaleString()} lines</span>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
          {sorted.map((file, i) => {
            const { Icon, color } = fileIcon(file.path);
            const lines = file.content.split("\n").length;
            const parts = file.path.split("/");
            const name = parts.pop() ?? file.path;
            const dir = parts.join("/");
            return (
              <motion.div
                key={file.path}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.012, 0.3), duration: 0.2 }}
                className="flex items-center gap-2.5 px-4 py-2 border-b border-[#f9f7f5] last:border-0"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[#1a1a1a] truncate">{name}</div>
                  {dir && <div className="text-[10px] text-[#9a8880] truncate">{dir}/</div>}
                </div>
                <span className="text-[10px] text-[#b5afa8] shrink-0 font-mono">{lines}L</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function PlatformToggle({
  platform, onChange, hasBase44, hasRocket,
}: {
  platform: Platform;
  onChange: (p: Platform) => void;
  hasBase44: boolean;
  hasRocket: boolean;
}) {
  const opts: { value: Platform; label: string; color: string; grad: string }[] = [
    { value: "base44", label: "Base44",     color: "#f97316", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
    { value: "rocket", label: "Rocket.new", color: "#6366f1", grad: "linear-gradient(135deg,#6366f1,#4f46e5)" },
  ];

  return (
    <div className="flex bg-[#f5f2ee] rounded-2xl p-1 mb-4 gap-1">
      {opts.map(({ value, label, grad }) => {
        const active = platform === value;
        const connected = value === "base44" ? hasBase44 : hasRocket;
        return (
          <motion.button
            key={value}
            onClick={() => onChange(value)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold relative"
            whileTap={{ scale: 0.97 }}
          >
            {active && (
              <motion.div
                layoutId="platform-tab"
                className="absolute inset-0 rounded-xl shadow-sm"
                style={{ background: value === "rocket" ? "#6366f1" : "#f97316" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {value === "base44"
                ? <Base44Logo size={14} white={active} />
                : <RocketLogo size={14} white={active} />
              }
              <span className={active ? "text-white" : "text-[#9a8880]"}>{label}</span>
              {connected && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: active ? "rgba(255,255,255,0.7)" : "#22c55e" }}
                />
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function PushPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [platform, setPlatform]         = useState<Platform>("base44");
  const [apps, setApps]                 = useState<App[]>([]);
  const [appsError, setAppsError]       = useState("");
  const [repos, setRepos]               = useState<Repo[]>([]);
  const [selectedApp, setSelectedApp]   = useState<App | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [newRepoName, setNewRepoName]   = useState("");
  const [isPrivate, setIsPrivate]       = useState(true);
  const [branch, setBranch]             = useState("main");
  const [commitMsg, setCommitMsg]       = useState("");
  const [files, setFiles]               = useState<FileEntry[]>([]);
  const [status, setStatus]             = useState<PushStatus>("idle");
  const [commitHash, setCommitHash]     = useState("");
  const [errorMsg, setErrorMsg]         = useState("");
  const [showNewRepo, setShowNewRepo]   = useState(false);
  const [loadingApps, setLA]            = useState(false);
  const [loadingRepos, setLR]           = useState(false);
  const [loadingFiles, setLF]           = useState(false);
  const [wakingSandbox, setWaking]      = useState(false);

  const hasBase44 = !!creds.base44Token;
  const hasRocket = !!creds.rocketToken;
  const isConnected = !!((hasBase44 || hasRocket) && creds.githubToken);

  const step1done = !!selectedApp && files.length > 0;
  const step2done = !!selectedRepo;

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.defaultBranch) setBranch(creds.defaultBranch);
    if (hasBase44 && !hasRocket) setPlatform("base44");
    if (!hasBase44 && hasRocket) setPlatform("rocket");
    if (isConnected) { loadRepos(); }
  }, [isLoaded, isConnected]);

  useEffect(() => {
    if (!isLoaded || !isConnected) return;
    setApps([]); setSelectedApp(null); setFiles([]);
    loadApps();
  }, [platform, isLoaded]);

  const loadApps = async () => {
    if (platform === "base44") {
      if (!creds.base44Token) return;
      setLA(true);
      try { setApps(await listBase44Apps({ data: { token: creds.base44Token } })); }
      catch (e: any) { toast.error("Failed to load Base44 apps: " + e.message); }
      finally { setLA(false); }
    } else {
      if (!creds.rocketToken) return;
      setLA(true);
      try { setAppsError(""); setApps(await listRocketApps({ data: { token: creds.rocketToken } })); }
      catch (e: any) { setAppsError(e.message ?? "Unknown error"); }
      finally { setLA(false); }
    }
  };

  const loadRepos = async () => {
    if (!creds.githubToken) return;
    setLR(true);
    try {
      const data = await listGitHubRepos({ data: { token: creds.githubToken } });
      setRepos(data.map((r: any) => ({ full_name: r.full_name, default_branch: r.default_branch, html_url: r.html_url })));
    } catch (e: any) { toast.error("Failed to load repos: " + e.message); }
    finally { setLR(false); }
  };

  const handleSelectApp = async (app: App) => {
    setSelectedApp(app); setFiles([]); setCommitMsg(`Push ${app.name} to GitHub`);
    setLF(true); setWaking(false);
    const t = setTimeout(() => setWaking(true), 3000);
    try {
      if (platform === "base44") {
        setFiles(await fetchBase44AppFiles({ data: { token: creds.base44Token!, appId: app.id } }));
      } else {
        setFiles(await fetchRocketAppFiles({ data: { token: creds.rocketToken!, appId: app.id } }));
      }
    }
    catch (e: any) { toast.error("Failed to fetch files: " + e.message); }
    finally { clearTimeout(t); setLF(false); setWaking(false); }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) { toast.error("Enter a repository name"); return; }
    try {
      const r = await createGitHubRepo({ data: { token: creds.githubToken!, name: newRepoName.trim(), isPrivate } });
      setSelectedRepo(r); setBranch(r.default_branch);
      setRepos((p) => [r, ...p]); setShowNewRepo(false); setNewRepoName("");
      toast.success(`Repo "${r.full_name}" created!`);
    } catch (e: any) { toast.error("Create repo failed: " + e.message); }
  };

  const handlePush = async () => {
    if (!selectedApp || !selectedRepo || !commitMsg.trim() || files.length === 0) return;
    const [owner, repo] = selectedRepo.full_name.split("/");
    setStatus("pushing"); setErrorMsg("");
    try {
      const result = await pushFilesToGitHub({ data: { token: creds.githubToken!, owner, repo, branch, files, commitMessage: commitMsg } });
      setCommitHash(result.shortSha); setStatus("done");
      addHistory({ id: result.commitSha, appName: selectedApp.name, repo: selectedRepo.full_name, branch, commitMessage: commitMsg, commitHash: result.shortSha, filesCount: files.length, status: "success", timestamp: Date.now() });
      toast.success(`Pushed ${files.length} files to ${selectedRepo.full_name}`);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Push failed"); setStatus("error");
      addHistory({ id: Date.now().toString(), appName: selectedApp.name, repo: selectedRepo.full_name, branch, commitMessage: commitMsg, commitHash: "", filesCount: files.length, status: "failed", error: e.message, timestamp: Date.now() });
      toast.error("Push failed: " + e.message);
    }
  };

  if (!isLoaded) return null;

  /* ─── Not connected ─── */
  if (!isConnected) {
    return (
      <AppShell>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <motion.div
            className="h-20 w-20 rounded-[28px] bg-[#fff4ed] flex items-center justify-center"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Lock className="h-9 w-9 text-[#f97316]" />
          </motion.div>
          <div>
            <h2 className="text-[20px] font-black text-[#1a1a1a] mb-1.5">Not connected</h2>
            <p className="text-[13px] text-[#6b6360] max-w-[220px] leading-relaxed">Connect a platform (Base44 or Rocket.new) and GitHub in Settings first.</p>
          </div>
          <MotionButton
            onClick={() => navigate({ to: "/settings" })}
            className="flex items-center gap-2 bg-[#f97316] text-white font-bold px-6 py-3.5 rounded-2xl text-[13px]"
            style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}
          >
            Go to Settings <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
          </MotionButton>
        </div>
      </AppShell>
    );
  }

  /* ─── Done ─── */
  if (status === "done") {
    const platformColor = platform === "rocket" ? "#6366f1" : "#f97316";
    const platformGrad  = platform === "rocket"
      ? "linear-gradient(135deg,#6366f1,#4f46e5)"
      : "linear-gradient(135deg,#fb923c,#f97316)";

    return (
      <AppShell>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col min-h-[72vh] pt-4 pb-2">

          <FadeUp>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <motion.div
                  className="h-20 w-20 rounded-full"
                  style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.2)" }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 360, damping: 20 }}
                >
                  <div className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full"
                  style={{ background: platformColor }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 18 }}
                />
              </div>

              <motion.h2
                className="text-[30px] font-black text-[#1a1a1a] tracking-tight leading-none mb-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4 }}
              >
                Shipped!
              </motion.h2>
              <motion.p
                className="text-[13px] text-[#9a8880]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Your code is live on GitHub
              </motion.p>
            </div>
          </FadeUp>

          <FadeUp delay={0.16}>
            <div className="bg-white rounded-[22px] border border-[#f0ece4] overflow-hidden mb-3"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>

              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />

              <div className="px-5 py-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: platformGrad }}>
                    {platform === "rocket"
                      ? <RocketLogo size={20} white />
                      : <Base44Logo size={20} white />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#9a8880] font-medium uppercase tracking-wide mb-0.5">
                      {platform === "rocket" ? "Rocket.new project" : "Base44 app"} pushed
                    </div>
                    <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{selectedApp?.name ?? "App"}</div>
                  </div>
                </div>

                <div className="h-px bg-[#f5f2ee]" />

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl px-3 py-2.5" style={{ background: "#faf7f3" }}>
                    <div className="text-[22px] font-black text-[#1a1a1a] leading-none">{files.length}</div>
                    <div className="text-[10px] text-[#9a8880] font-bold uppercase tracking-wide mt-0.5">Files</div>
                  </div>
                  <div className="rounded-xl px-3 py-2.5" style={{ background: "#faf7f3" }}>
                    <div className="text-[22px] font-black text-[#1a1a1a] leading-none">
                      {files.reduce((acc, f) => acc + f.content.split("\n").length, 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#9a8880] font-bold uppercase tracking-wide mt-0.5">Lines</div>
                  </div>
                  <div className="rounded-xl px-3 py-2.5" style={{ background: "#faf7f3" }}>
                    <div className="text-[15px] font-black text-[#1a1a1a] leading-none truncate">{branch}</div>
                    <div className="text-[10px] text-[#9a8880] font-bold uppercase tracking-wide mt-0.5">Branch</div>
                  </div>
                  <div className="rounded-xl px-3 py-2.5" style={{ background: "#faf7f3" }}>
                    <div className="text-[14px] font-black text-[#1a1a1a] leading-none font-mono">{commitHash}</div>
                    <div className="text-[10px] text-[#9a8880] font-bold uppercase tracking-wide mt-0.5">Commit</div>
                  </div>
                </div>

                <div className="h-px bg-[#f5f2ee]" />

                <div className="flex items-center gap-2.5">
                  <GitHubLogo size={16} className="text-[#6b6360] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#1a1a1a] truncate">{selectedRepo?.full_name}</div>
                  </div>
                  <span className="text-[10px] font-bold text-[#9a8880] bg-[#f5f2ee] px-2 py-0.5 rounded-full shrink-0">{branch}</span>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.24}>
            <div className="space-y-2.5">
              {selectedRepo && (
                <a
                  href={`${selectedRepo.html_url}/tree/${branch}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[16px] border border-[#f0ece4] bg-white text-[13px] font-bold text-[#1a1a1a]"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <GitHubLogo size={16} className="text-[#1a1a1a]" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3 text-[#9a8880]" />
                </a>
              )}
              <MotionButton
                onClick={() => { setStatus("idle"); setSelectedApp(null); setFiles([]); setCommitMsg(""); }}
                className="w-full py-3.5 rounded-[16px] text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
              >
                Push another app
              </MotionButton>
            </div>
          </FadeUp>
        </div>
      </AppShell>
    );
  }

  const platformColor = platform === "rocket" ? "#6366f1" : "#f97316";
  const platformLabel = platform === "rocket" ? "Rocket.new" : "Base44";
  const platformConnected = platform === "rocket" ? hasRocket : hasBase44;

  /* ─── Main flow ─── */
  return (
    <AppShell>
      <AnimatedCorner variant="push" />
      <Toaster position="top-center" richColors />

      <FadeUp>
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#9a8880] tracking-widest uppercase mb-1">Deploy</p>
          <h1 className="text-[26px] font-black text-[#1a1a1a] tracking-tight">Push to GitHub</h1>
          <p className="text-[13px] text-[#9a8880] mt-0.5">Select a platform, pick an app, and ship it.</p>
        </div>
      </FadeUp>

      {/* Step 1 — Select app */}
      <FadeUp delay={0.06}>
        <SectionShell step={1} label={`Select ${platformLabel} App`} active={!step1done} done={step1done}>

          {/* Platform toggle — always visible */}
          <PlatformToggle
            platform={platform}
            onChange={(p) => {
              setPlatform(p);
              setSelectedApp(null);
              setFiles([]);
            }}
            hasBase44={hasBase44}
            hasRocket={hasRocket}
          />

          {/* If selected platform not connected */}
          {!platformConnected ? (
            <div className="text-center py-5">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: platform === "rocket" ? "linear-gradient(135deg,#ede9fe,#ddd6fe)" : "#fff4ed" }}
              >
                {platform === "rocket"
                  ? <RocketLogo size={24} />
                  : <Base44Logo size={24} />
                }
              </div>
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">{platformLabel} not connected</p>
              <p className="text-[11px] text-[#9a8880] mb-3">Connect your account in Settings to continue.</p>
              <button
                onClick={() => navigate({ to: "/settings" })}
                className="text-[12px] font-bold px-4 py-2 rounded-xl text-white"
                style={{ background: platformColor }}
              >
                Go to Settings →
              </button>
            </div>
          ) : loadingApps ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-[#9a8880]">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: platformColor }} />
              Loading {platformLabel} apps…
            </div>
          ) : apps.length === 0 ? (
            <div className="py-4 space-y-3">
              <div className="text-center">
                <p className="text-[13px] text-[#9a8880] mb-2">No apps found.</p>
                <button onClick={loadApps} style={{ color: platformColor }} className="font-bold text-[13px]">Try again →</button>
              </div>
              {appsError && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-[#991b1b] mb-1">Debug — API response:</p>
                  <pre className="text-[10px] text-[#7f1d1d] whitespace-pre-wrap break-all leading-snug max-h-48 overflow-y-auto">{appsError}</pre>
                </div>
              )}
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
              {apps.map((app) => {
                const active = selectedApp?.id === app.id;
                return (
                  <StaggerItem key={app.id}>
                    <motion.button
                      onClick={() => handleSelectApp(app)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left"
                      animate={{
                        borderColor: active ? platformColor : "#f0ece4",
                        background: active
                          ? platform === "rocket" ? "#eef2ff" : "#fff4ed"
                          : "#fafafa",
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    >
                      <div className="h-9 w-9 rounded-xl shrink-0 overflow-hidden">
                        {app.icon ? (
                          <img
                            src={app.icon}
                            alt={app.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const t = e.currentTarget;
                              t.style.display = "none";
                              if (t.nextElementSibling) (t.nextElementSibling as HTMLElement).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: platform === "rocket"
                              ? "linear-gradient(135deg,#6366f1,#4f46e5)"
                              : "linear-gradient(135deg,#fb923c,#f97316)",
                            display: app.icon ? "none" : "flex",
                          }}
                        >
                          {platform === "rocket"
                            ? <RocketLogo size={18} white />
                            : <Base44Logo size={18} white />
                          }
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{app.name}</div>
                        <div className="text-[11px] text-[#9a8880]">
                          {new Date(app.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                            <Check className="h-4 w-4" style={{ color: platformColor }} strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          <AnimatePresence>
            {loadingFiles && selectedApp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-4 pt-3 border-t border-[#f0ece4] text-[12px] text-[#9a8880] overflow-hidden"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" style={{ color: platformColor }} />
                <span>
                  {platform === "base44"
                    ? (wakingSandbox ? "Waking sandbox — takes ~30s…" : "Fetching files from Base44…")
                    : "Fetching files from Rocket.new…"
                  }
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionShell>
      </FadeUp>

      {/* File browser */}
      <AnimatePresence>
        {files.length > 0 && <FileBrowser files={files} />}
      </AnimatePresence>

      {/* Step 2 — Target repo */}
      <FadeUp delay={0.12}>
        <SectionShell step={2} label="Target Repository" active={step1done && !step2done} done={step2done}>
          {selectedRepo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#faf7f3] border border-[#f0ece4] rounded-2xl p-3.5">
                <div className="h-9 w-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <GitHubLogo className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-[13px] font-bold text-[#1a1a1a] truncate">{selectedRepo.full_name}</span>
                <button onClick={() => setSelectedRepo(null)} className="text-[11px] font-semibold text-[#9a8880] hover:text-[#ef4444] transition-colors">Change</button>
              </div>
              <div className="flex items-center gap-2 bg-[#faf7f3] rounded-xl px-3 py-2 border border-[#f0ece4]">
                <GitBranch className="h-3.5 w-3.5 text-[#c8b8a2] shrink-0" />
                <input
                  value={branch} onChange={(e) => setBranch(e.target.value)}
                  className="flex-1 text-[12px] font-mono bg-transparent outline-none text-[#1a1a1a] placeholder:text-[#c8b8a2]"
                  placeholder="branch name"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <motion.button
                onClick={() => setShowNewRepo(!showNewRepo)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed text-left"
                animate={{ borderColor: showNewRepo ? "#f97316" : "#e8e0d8" }}
                whileHover={{ borderColor: "#f97316" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <div className="h-9 w-9 rounded-xl bg-[#faf7f3] flex items-center justify-center">
                  <Plus className="h-5 w-5 text-[#1a1a1a]" />
                </div>
                <span className="text-[13px] font-bold text-[#1a1a1a] flex-1">Create new repo</span>
                <motion.div animate={{ rotate: showNewRepo ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                  <ChevronDown className="h-4 w-4 text-[#c8b8a2]" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showNewRepo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-[#f0ece4] p-4 space-y-3 overflow-hidden bg-[#fafafa]"
                  >
                    <input
                      placeholder="repository-name" value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                      className="w-full rounded-xl border border-[#f0ece4] bg-white px-4 py-2.5 text-[13px] font-mono outline-none focus:border-[#f97316]/40"
                    />
                    <div className="flex items-center gap-2">
                      {[true, false].map((priv) => (
                        <motion.button
                          key={String(priv)} onClick={() => setIsPrivate(priv)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border-2 transition-colors"
                          animate={{
                            borderColor: isPrivate === priv ? "#f97316" : "#f0ece4",
                            background: isPrivate === priv ? "#fff4ed" : "#fff",
                            color: isPrivate === priv ? "#f97316" : "#9a8880",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {priv && <Lock className="h-3 w-3" />}
                          {priv ? "Private" : "Public"}
                        </motion.button>
                      ))}
                      <MotionButton onClick={handleCreateRepo}
                        className="ml-auto bg-[#1a1a1a] text-white font-bold text-[12px] px-4 py-2 rounded-xl">
                        Create repo
                      </MotionButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingRepos ? (
                <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-[#f97316]" /></div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
                  {repos.map((r) => (
                    <motion.button key={r.full_name}
                      onClick={() => { setSelectedRepo(r); setBranch(r.default_branch); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#f0ece4] text-left bg-white"
                      whileHover={{ background: "#fff4ed", borderColor: "rgba(249,115,22,0.2)", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    >
                      <GitHubLogo className="h-4 w-4 text-[#9a8880] shrink-0" />
                      <span className="text-[13px] font-medium text-[#1a1a1a] truncate flex-1">{r.full_name}</span>
                      <span className="text-[10px] font-mono text-[#9a8880] shrink-0 bg-[#faf7f3] px-2 py-0.5 rounded">{r.default_branch}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionShell>
      </FadeUp>

      {/* Step 3 — Commit message */}
      <FadeUp delay={0.16}>
        <SectionShell step={3} label="Commit Message" active={step1done && step2done} done={false}>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-[#c8b8a2]" />
            <textarea
              value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)}
              rows={3} placeholder="Describe your changes…"
              className="w-full rounded-xl bg-[#faf7f3] pl-9 pr-4 py-3 text-[13px] outline-none resize-none border border-[#f0ece4] focus:border-[#f97316]/40 text-[#1a1a1a] placeholder:text-[#c8b8a2]"
            />
          </div>
        </SectionShell>
      </FadeUp>

      {/* Error */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-4 mb-4">
            <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-bold text-[#ef4444]">Push failed</div>
              <div className="text-[12px] text-[#ef4444]/70 mt-0.5 leading-relaxed">{errorMsg}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push CTA */}
      <FadeUp delay={0.2}>
        <motion.button
          onClick={handlePush}
          disabled={status === "pushing" || !selectedApp || !selectedRepo || files.length === 0 || loadingFiles}
          className="w-full rounded-3xl py-4 flex items-center justify-center gap-2.5 font-bold text-[15px] text-white mb-3 disabled:opacity-35"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 24px rgba(249,115,22,0.4)" }}
          whileHover={{ scale: 1.015, boxShadow: "0 8px 32px rgba(249,115,22,0.5)" }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
        >
          {status === "pushing"
            ? <><Loader2 className="h-5 w-5 animate-spin" />Pushing {files.length} files…</>
            : <><Cloud className="h-5 w-5" />Push to GitHub</>
          }
        </motion.button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#9a8880] font-medium pb-2">
          <Lock className="h-3 w-3" />
          <span>Credentials never leave your browser</span>
        </div>
      </FadeUp>
    </AppShell>
  );
}
