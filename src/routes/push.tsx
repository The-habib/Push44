import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton } from "@/components/PageTransition";
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

export const Route = createFileRoute("/push")({ component: PushPage });

interface App  { id: string; name: string; updated_at: string }
interface Repo { full_name: string; default_branch: string; html_url: string }
interface FileEntry { path: string; content: string }
type PushStatus = "idle" | "pushing" | "done" | "error";

function PushPage() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [apps, setApps]               = useState<App[]>([]);
  const [repos, setRepos]             = useState<Repo[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [newRepoName, setNewRepoName] = useState("");
  const [isPrivate, setIsPrivate]     = useState(true);
  const [branch, setBranch]           = useState("main");
  const [commitMsg, setCommitMsg]     = useState("");
  const [files, setFiles]             = useState<FileEntry[]>([]);
  const [status, setStatus]           = useState<PushStatus>("idle");
  const [commitHash, setCommitHash]   = useState("");
  const [errorMsg, setErrorMsg]       = useState("");
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [loadingApps, setLA]          = useState(false);
  const [loadingRepos, setLR]         = useState(false);
  const [loadingFiles, setLF]         = useState(false);
  const [wakingSandbox, setWaking]    = useState(false);

  const isConnected = !!(creds.base44Token && creds.githubToken);

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.defaultBranch) setBranch(creds.defaultBranch);
    if (isConnected) { loadApps(); loadRepos(); }
  }, [isLoaded, isConnected]);

  const loadApps = async () => {
    if (!creds.base44Token) return;
    setLA(true);
    try { setApps(await listBase44Apps({ data: { token: creds.base44Token } })); }
    catch (e: any) { toast.error("Failed to load apps: " + e.message); }
    finally { setLA(false); }
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
    try { setFiles(await fetchBase44AppFiles({ data: { token: creds.base44Token!, appId: app.id } })); }
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

  if (!isConnected) {
    return (
      <AppShell>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#ede9fe] flex items-center justify-center">
            <Lock className="h-7 w-7 text-[#8b5cf6]" />
          </div>
          <h2 className="text-xl font-extrabold text-black">Not connected</h2>
          <p className="text-[13px] text-black/50 max-w-[240px]">Connect your Base44 account and GitHub token in Settings.</p>
          <MotionButton onClick={() => navigate({ to: "/settings" })}
            className="bg-[#8b5cf6] text-white font-bold px-6 py-3 rounded-2xl text-[13px]">
            Go to Settings
          </MotionButton>
        </div>
      </AppShell>
    );
  }

  if (status === "done") {
    return (
      <AppShell>
        <AnimatedCorner variant="push" />
        <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4 text-center">
          <motion.div className="h-20 w-20 rounded-full bg-[#dcfce7] flex items-center justify-center"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
            <Check className="h-10 w-10 text-[#22c55e]" strokeWidth={3} />
          </motion.div>
          <FadeUp delay={0.1}>
            <h2 className="text-[24px] font-extrabold text-black">Pushed!</h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-[13px] text-black/50">
              {files.length} files → <strong>{selectedRepo?.full_name}</strong> on <strong>{branch}</strong>
            </p>
          </FadeUp>
          <FadeUp delay={0.22}>
            <div className="font-mono text-xs bg-[#f7f6f1] px-4 py-2 rounded-xl text-black/60">commit {commitHash}</div>
          </FadeUp>
          {selectedRepo && (
            <FadeUp delay={0.28}>
              <a href={`${selectedRepo.html_url}/tree/${branch}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-[#8b5cf6] font-semibold text-[13px]">
                <GitHubLogo className="h-4 w-4" /> View on GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </FadeUp>
          )}
          <FadeUp delay={0.34}>
            <MotionButton
              onClick={() => { setStatus("idle"); setSelectedApp(null); setFiles([]); setCommitMsg(""); }}
              className="bg-[#1a1a1a] text-white font-bold px-6 py-3 rounded-2xl text-[13px]">
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

      <FadeUp>
        <h1 className="text-[26px] font-extrabold text-black tracking-tight mb-1">Push to GitHub</h1>
        <p className="text-[13px] text-black/45 mb-5">Select an app, pick a repo, and ship it.</p>
      </FadeUp>

      {/* Step 1 */}
      <FadeUp delay={0.06}>
        <SectionCard title="1 — Select Base44 App">
          {loadingApps ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#8b5cf6]" /></div>
          ) : apps.length === 0 ? (
            <div className="text-center py-4 text-[13px] text-black/45">
              No apps found.{" "}
              <button onClick={loadApps} className="text-[#8b5cf6] font-semibold">Retry</button>
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
              {apps.map((app) => {
                const active = selectedApp?.id === app.id;
                return (
                  <StaggerItem key={app.id}>
                    <motion.button
                      onClick={() => handleSelectApp(app)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-colors"
                      style={{ borderColor: active ? "#8b5cf6" : "#eeece6", background: active ? "#f5f2ff" : "#fff" }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    >
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
                        <Base44Logo size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-black truncate">{app.name}</div>
                        <div className="text-[11px] text-black/35">
                          {new Date(app.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                            <Check className="h-4 w-4 text-[#8b5cf6]" strokeWidth={3} />
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-3 text-[12px] text-black/45 overflow-hidden">
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                {wakingSandbox ? "Waking sandbox — takes ~30s…" : "Fetching files from Base44…"}
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>
      </FadeUp>

      {/* Step 2 */}
      <FadeUp delay={0.12}>
        <SectionCard title="2 — Target Repository">
          {selectedRepo ? (
            <div>
              <div className="flex items-center gap-3 border border-[#eee] rounded-xl p-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                  <GitHubLogo className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-[13px] font-semibold text-black truncate">{selectedRepo.full_name}</span>
                <button onClick={() => setSelectedRepo(null)} className="text-[11px] text-black/35 hover:text-black font-medium">Change</button>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-black/35" />
                <input value={branch} onChange={(e) => setBranch(e.target.value)}
                  className="flex-1 text-[12px] font-mono bg-[#f7f6f1] rounded-lg px-3 py-2 outline-none border border-transparent focus:border-[#8b5cf6]/30"
                  placeholder="branch" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <motion.button
                onClick={() => setShowNewRepo(!showNewRepo)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-[#e5e3dc] text-left"
                whileHover={{ borderColor: "#8b5cf6" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <div className="h-9 w-9 rounded-xl bg-[#f3f2ee] flex items-center justify-center">
                  <Plus className="h-5 w-5 text-black" />
                </div>
                <span className="text-[13px] font-bold text-black flex-1">Create new repository</span>
                <motion.div animate={{ rotate: showNewRepo ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                  <ChevronDown className="h-4 w-4 text-black/35" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showNewRepo && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-[#eee] p-3 space-y-2 overflow-hidden">
                    <input placeholder="repository-name" value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                      className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-2.5 text-[13px] font-mono outline-none focus:border-[#8b5cf6]/40" />
                    <div className="flex items-center gap-2">
                      {[true, false].map((priv) => (
                        <motion.button key={String(priv)} onClick={() => setIsPrivate(priv)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border-2 transition-colors"
                          style={{ borderColor: isPrivate === priv ? "#8b5cf6" : "#eee", background: isPrivate === priv ? "#f0ebff" : "#fff", color: isPrivate === priv ? "#7c3aed" : "#999" }}
                          whileTap={{ scale: 0.95 }}>
                          {priv && <Lock className="h-3 w-3" />}
                          {priv ? "Private" : "Public"}
                        </motion.button>
                      ))}
                      <MotionButton onClick={handleCreateRepo} className="ml-auto bg-[#1a1a1a] text-white font-bold text-[12px] px-4 py-2 rounded-lg">Create</MotionButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingRepos ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-[#8b5cf6]" /></div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {repos.map((r) => (
                    <motion.button key={r.full_name}
                      onClick={() => { setSelectedRepo(r); setBranch(r.default_branch); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#eee] text-left"
                      whileHover={{ backgroundColor: "#fafaf7", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    >
                      <GitHubLogo className="h-4 w-4 text-black/40 shrink-0" />
                      <span className="text-[13px] font-medium text-black truncate flex-1">{r.full_name}</span>
                      <span className="text-[10px] text-black/35 shrink-0">{r.default_branch}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </FadeUp>

      {/* Step 3: Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <SectionCard title={`3 — Files to Push (${files.length})`}>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {files.map((f, i) => (
                  <motion.div key={f.path} className="flex items-center gap-2 py-0.5"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.008, 0.3) }}>
                    <span className="text-[#22c55e] font-bold font-mono text-[13px] w-4 shrink-0">+</span>
                    <FileText className="h-3.5 w-3.5 text-black/30 shrink-0" />
                    <span className="font-mono text-[11px] text-black/60 truncate">{f.path}</span>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Commit message */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <SectionCard title="4 — Commit Message">
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-black/30" />
                <textarea value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)}
                  rows={3} placeholder="Describe your changes…"
                  className="w-full rounded-xl bg-[#f7f6f1] pl-9 pr-4 py-3 text-[13px] outline-none resize-none focus:ring-2 focus:ring-[#8b5cf6]/20" />
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-4 mb-4">
            <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-bold text-[#ef4444]">Push failed</div>
              <div className="text-[12px] text-[#ef4444]/70 mt-0.5">{errorMsg}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push button */}
      <FadeUp delay={0.2}>
        <motion.button
          onClick={handlePush}
          disabled={status === "pushing" || !selectedApp || !selectedRepo || files.length === 0 || loadingFiles}
          className="w-full rounded-3xl py-4 flex items-center justify-center gap-2.5 font-bold text-[15px] text-white mb-4 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}
          whileHover={{ scale: 1.015, boxShadow: "0 12px 40px rgba(139,92,246,0.35)" }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
        >
          {status === "pushing"
            ? <><Loader2 className="h-5 w-5 animate-spin" />Pushing {files.length} files…</>
            : <><Cloud className="h-5 w-5" />Push to GitHub</>
          }
        </motion.button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-black/35 font-medium">
          <Lock className="h-3 w-3" /><span>Credentials never leave your browser</span>
        </div>
      </FadeUp>
    </AppShell>
  );
}
