import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton, ScaleIn } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, GitBranch, FileText, Lock, MessageSquare, Loader2,
  ChevronDown, Plus, Check, AlertCircle, ExternalLink,
} from "lucide-react";
import { GitHubLogo, Base44Logo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps, fetchBase44AppFiles } from "@/lib/base44-api";
import { listGitHubRepos, createGitHubRepo, pushFilesToGitHub } from "@/lib/github-api";
import { addHistory } from "@/lib/storage";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/push")({
  component: PushPage,
});

interface App { id: string; name: string; updated_at: string }
interface Repo { full_name: string; default_branch: string; html_url: string }
interface FileEntry { path: string; content: string }

type PushStatus = "idle" | "fetching-files" | "pushing" | "done" | "error";

function PushPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [apps, setApps] = useState<App[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [newRepoName, setNewRepoName] = useState("");
  const [isPrivateRepo, setIsPrivateRepo] = useState(true);
  const [branch, setBranch] = useState("main");
  const [commitMsg, setCommitMsg] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState<PushStatus>("idle");
  const [commitHash, setCommitHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [wakingSandbox, setWakingSandbox] = useState(false);

  const isConnected = !!(creds.base44Token && creds.githubToken);

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.defaultBranch) setBranch(creds.defaultBranch);
    if (isConnected) { loadApps(); loadRepos(); }
  }, [isLoaded, isConnected]);

  async function loadApps() {
    if (!creds.base44Token) return;
    setLoadingApps(true);
    try {
      const data = await listBase44Apps({ data: { token: creds.base44Token } });
      setApps(data);
    } catch (e: any) { toast.error("Failed to load Base44 apps: " + e.message); }
    finally { setLoadingApps(false); }
  }

  async function loadRepos() {
    if (!creds.githubToken) return;
    setLoadingRepos(true);
    try {
      const data = await listGitHubRepos({ data: { token: creds.githubToken } });
      setRepos(data.map((r) => ({ full_name: r.full_name, default_branch: r.default_branch, html_url: r.html_url })));
    } catch (e: any) { toast.error("Failed to load GitHub repos: " + e.message); }
    finally { setLoadingRepos(false); }
  }

  async function handleSelectApp(app: App) {
    setSelectedApp(app);
    setFiles([]);
    setCommitMsg(`Push ${app.name} to GitHub`);
    setLoadingFiles(true);
    setWakingSandbox(false);
    const wakeTimer = setTimeout(() => setWakingSandbox(true), 3000);
    try {
      const f = await fetchBase44AppFiles({ data: { token: creds.base44Token!, appId: app.id } });
      setFiles(f);
    } catch (e: any) { toast.error("Failed to fetch app files: " + e.message); }
    finally { clearTimeout(wakeTimer); setLoadingFiles(false); setWakingSandbox(false); }
  }

  async function handleCreateRepo() {
    if (!newRepoName.trim()) { toast.error("Enter a repository name"); return; }
    try {
      const repo = await createGitHubRepo({ data: { token: creds.githubToken!, name: newRepoName.trim(), isPrivate: isPrivateRepo } });
      setSelectedRepo(repo); setBranch(repo.default_branch);
      setRepos((prev) => [repo, ...prev]); setShowNewRepo(false); setNewRepoName("");
      toast.success(`Repo "${repo.full_name}" created!`);
    } catch (e: any) { toast.error("Failed to create repo: " + e.message); }
  }

  async function handlePush() {
    if (!selectedApp) { toast.error("Select a Base44 app"); return; }
    if (!selectedRepo) { toast.error("Select a GitHub repository"); return; }
    if (!commitMsg.trim()) { toast.error("Enter a commit message"); return; }
    if (files.length === 0) { toast.error("No files to push"); return; }
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
  }

  if (!isLoaded) return null;

  if (!isConnected) {
    return (
      <AppShell>
        <AnimatedCorner variant="push" />
        <ScaleIn>
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
            <motion.div
              className="h-16 w-16 rounded-3xl bg-[#e9e4f8] flex items-center justify-center"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Lock className="h-8 w-8 text-[#8b5cf6]" />
            </motion.div>
            <h2 className="text-xl font-extrabold text-black">Not connected</h2>
            <p className="text-sm text-black/60">Connect your Base44 account and GitHub token in Settings.</p>
            <MotionButton onClick={() => navigate({ to: "/settings" })} className="bg-[#8b5cf6] text-white font-bold px-6 py-3 rounded-3xl">
              Go to Settings
            </MotionButton>
          </div>
        </ScaleIn>
      </AppShell>
    );
  }

  if (status === "done") {
    return (
      <AppShell>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
          <ScaleIn>
            <motion.div
              className="h-20 w-20 rounded-full bg-[#dcfce7] flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Check className="h-10 w-10 text-[#22c55e]" strokeWidth={3} />
            </motion.div>
          </ScaleIn>
          <FadeUp delay={0.1}>
            <h2 className="text-2xl font-extrabold text-black">Pushed!</h2>
          </FadeUp>
          <FadeUp delay={0.18}>
            <p className="text-sm text-black/60">
              {files.length} files pushed to <strong>{selectedRepo?.full_name}</strong> on branch <strong>{branch}</strong>
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <div className="font-mono text-xs bg-[#f7f6f1] px-4 py-2 rounded-xl text-black/70">commit {commitHash}</div>
          </FadeUp>
          {selectedRepo && (
            <FadeUp delay={0.3}>
              <a href={`${selectedRepo.html_url}/tree/${branch}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[#8b5cf6] font-semibold text-sm">
                <GitHubLogo className="h-4 w-4" />View on GitHub<ExternalLink className="h-3 w-3" />
              </a>
            </FadeUp>
          )}
          <FadeUp delay={0.36}>
            <MotionButton
              onClick={() => { setStatus("idle"); setSelectedApp(null); setFiles([]); setCommitMsg(""); }}
              className="bg-[#1a1a1a] text-white font-bold px-6 py-3 rounded-3xl"
            >
              Push another
            </MotionButton>
          </FadeUp>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AnimatedCorner variant="push" />
      <Toaster position="top-center" richColors />

      <div className="relative z-10">
        {/* Hero */}
        <FadeUp delay={0.05}>
          <section className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5" style={{ backgroundColor: "#e9e4f8" }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 280" preserveAspectRatio="none">
              <motion.path
                d="M30 100 C 120 60, 260 120, 380 80 L 380 280 L 0 280 Z"
                fill="#d8cef0" opacity="0.6"
                animate={{ d: ["M30 100 C 120 60, 260 120, 380 80 L 380 280 L 0 280 Z", "M30 120 C 140 70, 240 130, 380 90 L 380 280 L 0 280 Z", "M30 100 C 120 60, 260 120, 380 80 L 380 280 L 0 280 Z"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
            <div className="relative z-10 max-w-[60%]">
              <h2 className="text-[34px] leading-[1.02] font-extrabold text-black tracking-tight">
                Ready to<br /><span className="text-[#7c3aed]">push?</span>
              </h2>
              <p className="mt-3 text-[13px] text-black/70 leading-snug">Review your changes before shipping them to GitHub.</p>
            </div>
            <motion.div
              className="absolute right-4 top-6 h-[120px] w-[120px] rounded-[28px] bg-[#1a1a1a] flex items-center justify-center shadow-xl"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <GitHubLogo className="h-16 w-16 text-white" />
            </motion.div>
          </section>
        </FadeUp>

        {/* Step 1: Select App */}
        <FadeUp delay={0.12}>
          <SectionCard title="1. Select Base44 App">
            {loadingApps ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#8b5cf6]" />
              </div>
            ) : apps.length === 0 ? (
              <div className="text-center py-4 text-sm text-black/50">
                No apps found. Create a project in Base44 first.<br />
                <button onClick={loadApps} className="mt-2 text-[#8b5cf6] font-semibold text-xs">Retry</button>
              </div>
            ) : (
              <StaggerContainer className="space-y-2">
                {apps.map((app) => (
                  <StaggerItem key={app.id}>
                    <motion.button
                      onClick={() => handleSelectApp(app)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                        selectedApp?.id === app.id ? "border-[#8b5cf6] bg-[#f3efff]" : "border-[#eee] bg-white"
                      }`}
                      whileHover={{ x: 2, backgroundColor: selectedApp?.id === app.id ? undefined : "#fafaf7" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
                      <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
                        <Base44Logo size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-black truncate">{app.name}</div>
                        <div className="text-[11px] text-black/40">
                          {new Date(app.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedApp?.id === app.id && (
                          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                            <Check className="h-4 w-4 text-[#8b5cf6] shrink-0" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            <AnimatePresence>
              {loadingFiles && selectedApp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1 mt-3"
                >
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {wakingSandbox ? "Waking up sandbox…" : "Fetching files from Base44…"}
                  </div>
                  {wakingSandbox && (
                    <div className="text-[11px] text-black/35 ml-5 leading-snug">
                      Sandbox was sleeping — auto-waking it. This takes ~30s.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>
        </FadeUp>

        {/* Step 2: Repo */}
        <FadeUp delay={0.18}>
          <SectionCard title="2. Target Repository">
            {selectedRepo ? (
              <div>
                <div className="flex items-center gap-3 border border-[#eee] rounded-xl p-2.5 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                    <GitHubLogo className="h-5 w-5 text-white" />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-black truncate">{selectedRepo.full_name}</span>
                  <button onClick={() => setSelectedRepo(null)} className="text-xs text-black/40 hover:text-black">Change</button>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 text-black/40" />
                  <input value={branch} onChange={(e) => setBranch(e.target.value)}
                    className="flex-1 text-xs font-mono bg-[#f7f6f1] rounded-lg px-3 py-1.5 outline-none" placeholder="branch name" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <motion.button
                  onClick={() => setShowNewRepo(!showNewRepo)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[#eee] transition-colors"
                  whileHover={{ borderColor: "#8b5cf6" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-9 w-9 rounded-lg bg-[#f3f2ee] flex items-center justify-center">
                    <Plus className="h-5 w-5 text-black" />
                  </div>
                  <span className="text-sm font-bold text-black">Create new repository</span>
                  <motion.div className="ml-auto" animate={{ rotate: showNewRepo ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                    <ChevronDown className="h-4 w-4 text-black/40" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showNewRepo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-[#eee] p-3 space-y-2 overflow-hidden"
                    >
                      <input placeholder="repository-name" value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""))}
                        className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm font-mono outline-none focus:border-[#8b5cf6]" />
                      <div className="flex items-center gap-2">
                        {[true, false].map((priv) => (
                          <motion.button key={String(priv)} onClick={() => setIsPrivateRepo(priv)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${isPrivateRepo === priv ? (priv ? "border-[#8b5cf6] bg-[#f3efff] text-[#7c3aed]" : "border-[#1a1a1a] bg-[#f3f2ee] text-black") : "border-[#eee] bg-white text-black/60"}`}
                            whileTap={{ scale: 0.95 }}>
                            {priv && <Lock className="h-3 w-3" />}
                            {priv ? "Private" : "Public"}
                          </motion.button>
                        ))}
                        <MotionButton onClick={handleCreateRepo} className="ml-auto bg-[#1a1a1a] text-white font-bold text-xs px-4 py-2 rounded-lg">Create</MotionButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loadingRepos ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#8b5cf6]" />
                  </div>
                ) : (
                  <StaggerContainer className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {repos.map((r) => (
                      <StaggerItem key={r.full_name}>
                        <motion.button
                          onClick={() => { setSelectedRepo(r); setBranch(r.default_branch); }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#eee] transition-colors text-left"
                          whileHover={{ backgroundColor: "#fafaf7", x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        >
                          <GitHubLogo className="h-4 w-4 text-black/50 shrink-0" />
                          <span className="text-sm font-medium text-black truncate">{r.full_name}</span>
                          <span className="text-[10px] text-black/40 shrink-0">{r.default_branch}</span>
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </div>
            )}
          </SectionCard>
        </FadeUp>

        {/* Step 3: Files */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}>
              <SectionCard title={`3. Files to Push (${files.length})`}>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {files.map((f, i) => (
                    <motion.div key={f.path}
                      className="flex items-center gap-2.5 py-1"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.01, duration: 0.2 }}
                    >
                      <span className="text-[#22c55e] font-bold font-mono text-sm w-4">+</span>
                      <FileText className="h-3.5 w-3.5 text-black/40 shrink-0" />
                      <span className="font-mono text-[12px] text-black/75 truncate">{f.path}</span>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Commit */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}>
              <SectionCard title="4. Commit Message">
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-black/40" />
                  <textarea value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)}
                    placeholder="Describe your changes…" rows={3}
                    className="w-full rounded-xl bg-[#f7f6f1] pl-9 pr-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-[#8b5cf6]/30" />
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="flex items-start gap-3 bg-[#fee2e2] rounded-3xl p-4 mb-5"
            >
              <AlertCircle className="h-5 w-5 text-[#ef4444] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-[#ef4444]">Push failed</div>
                <div className="text-xs text-[#ef4444]/80 mt-0.5">{errorMsg}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Push button */}
        <FadeUp delay={0.3}>
          <motion.button
            onClick={handlePush}
            disabled={status === "pushing" || !selectedApp || !selectedRepo || files.length === 0 || loadingFiles}
            className="w-full bg-gradient-to-b from-[#a78bfa] to-[#8b5cf6] rounded-3xl py-4 flex items-center justify-center gap-2 shadow-lg mb-3 disabled:opacity-50"
            whileHover={{ scale: 1.02, boxShadow: "0 16px 48px rgba(139,92,246,0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            {status === "pushing"
              ? <Loader2 className="h-5 w-5 text-white animate-spin" />
              : <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
                  <Cloud className="h-5 w-5 text-white" />
                </motion.div>
            }
            <span className="text-white font-bold text-[15px]">
              {status === "pushing" ? `Pushing ${files.length} files…` : "Push to GitHub"}
            </span>
          </motion.button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-black/60 font-medium">
            <Lock className="h-3 w-3" /><span>Secure</span>
            <span className="text-black/40">•</span><span>Private</span>
            <span className="text-black/40">•</span><span>Encrypted</span>
          </div>
        </FadeUp>
      </div>
    </AppShell>
  );
}
