import { createLazyFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  UploadCloud, Search, Check, AlertCircle, Plus, Lock, Globe,
  ExternalLink, RefreshCw, GitBranch, ChevronDown, ChevronRight,
  FileText, CheckCircle, XCircle, FolderOpen, Smartphone, Download,
  Terminal, Loader2,
} from "lucide-react";
import { FileExplorer } from "@/components/FileExplorer";
import { Base44Logo, RocketLogo, FlootLogo, ZiteLogo, GitHubLogo } from "@/components/BrandLogos";
import { RocketModal } from "@/components/RocketModal";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps, fetchBase44AppFiles } from "@/lib/base44-api";
import {
  listRocketApps, fetchRocketAppFiles,
  generateRocketKeystore, triggerRocketApkBuild, checkRocketApkBuildStatus,
  fetchRocketApkBuildLog, downloadRocketApk,
  APK_STATUS, type ApkBuildState,
} from "@/lib/rocket-api";
import {
  listFlootApps, fetchFlootAppFiles,
  getFlootDeploymentStatus, triggerFlootDeploy,
  removeFlootBadge,
  setFlootMobileAppId, triggerFlootMobileBuild,
  getFlootMobileBuildStatus, getFlootMobileDownloadUrl,
  type FlootDeployStatus, type FlootMobileBuildStatus,
} from "@/lib/floot-api";
import { listZiteApps, fetchZiteAppFiles } from "@/lib/zite-api";
import { listGitHubRepos, createGitHubRepo, pushFilesToGitHub } from "@/lib/github-api";
import {
  addHistory, getAppSnapshot, saveAppSnapshot, computeFileDiff,
  getDeletedPaths, getPushPrefs, savePushPrefs, type Platform,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/push")({ component: PushPage });

type PlatformId = "base44" | "rocket" | "zite" | "floot";

interface AppItem  { id: string; applicationId?: string; name: string; updated_at: string; icon?: string }
interface RepoItem { full_name: string; default_branch: string; html_url: string; private: boolean }
interface FileEntry { path: string; content: string }
type PushStatus = "idle" | "pushing" | "done" | "error";

const PLATFORMS: { id: PlatformId; label: string; icon: React.ReactNode; credKey: string; helpUrl: string }[] = [
  { id: "base44", label: "Base44",    icon: <Base44Logo size={18} />, credKey: "base44Token", helpUrl: "https://app.base44.com" },
  { id: "rocket", label: "Rocket.new", icon: <RocketLogo size={18} />, credKey: "rocketToken", helpUrl: "https://rocket.new" },
  { id: "zite",   label: "Zite",      icon: <ZiteLogo size={18} />,   credKey: "ziteSession", helpUrl: "https://build.fillout.com" },
  { id: "floot",  label: "Floot",     icon: <FlootLogo size={18} />,   credKey: "flootToken",  helpUrl: "https://floot.com" },
];

function StepNum({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0,
      background: done ? "#22c55e" : active ? "#f97316" : "#e2e8f0",
      color: done || active ? "#fff" : "#94a3b8",
      transition: "all 0.2s",
    }}>
      {done ? <Check size={12} strokeWidth={3} /> : n}
    </div>
  );
}

function StepCard({ step, n, label, active, done, children }: {
  step: number; n: number; label: string; active: boolean; done: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 12, overflow: "hidden", opacity: !active && !done ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <div className="step-header">
        <StepNum n={n} active={active} done={done} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
        {done && !active && <span style={{ marginLeft: "auto", fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Done</span>}
      </div>
      {(active || done) && children && (
        <div style={{ padding: "16px 18px" }}>{children}</div>
      )}
    </div>
  );
}

export default function PushPage() {
  const { creds, updateCreds } = useApp();
  const navigate = useNavigate();

  const savedPrefs = getPushPrefs();

  // ── Step state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Platform & app ─────────────────────────────────────────────────────────
  const [platform, setPlatform] = useState<PlatformId>(() => {
    if (savedPrefs.platform && ["base44","rocket","zite","floot"].includes(savedPrefs.platform)) return savedPrefs.platform as PlatformId;
    if (creds.base44Token) return "base44";
    if (creds.rocketToken) return "rocket";
    if (creds.ziteSession) return "zite";
    if (creds.flootToken)  return "floot";
    return "base44";
  });
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError]     = useState("");
  const [appSearch, setAppSearch]     = useState("");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);

  // ── Files ──────────────────────────────────────────────────────────────────
  const [files, setFiles]           = useState<FileEntry[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError]     = useState("");
  const [containerSleeping, setContainerSleeping] = useState(false);
  const [containerUrl, setContainerUrl]            = useState("");

  // ── Rocket modal ───────────────────────────────────────────────────────────
  const [showRocketModal, setShowRocketModal] = useState(false);

  // ── Repo ───────────────────────────────────────────────────────────────────
  const [repos, setRepos]             = useState<RepoItem[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [repoSearch, setRepoSearch]     = useState("");
  const [selectedRepo, setSelectedRepo] = useState<RepoItem | null>(() =>
    savedPrefs.lastRepo ? { ...savedPrefs.lastRepo, private: false } : null
  );
  const [isNewRepo, setIsNewRepo]       = useState(false);
  const [newRepoName, setNewRepoName]   = useState("");
  const [isPrivate, setIsPrivate]       = useState(false);
  const [branch, setBranch]             = useState(savedPrefs.branch ?? creds.defaultBranch ?? "main");
  const [commitMsg, setCommitMsg]       = useState("");
  const [showRepoList, setShowRepoList] = useState(false);

  // ── File explorer ──────────────────────────────────────────────────────────
  const [showExplorer, setShowExplorer] = useState(false);

  // ── Push ───────────────────────────────────────────────────────────────────
  const [pushStatus, setPushStatus]   = useState<PushStatus>("idle");
  const [pushProgress, setPushProgress] = useState(0);
  const [pushResult, setPushResult]     = useState<{ commitSha: string; shortSha: string; repoUrl: string } | null>(null);
  const [pushError, setPushError]       = useState("");

  // ── APK Build (Rocket.new only) ────────────────────────────────────────────
  type ApkPhase = "idle" | "keystore" | "resetting" | "queued" | "building" | "done" | "failed";
  const [apkPhase, setApkPhase]       = useState<ApkPhase>("idle");
  const [apkLogs, setApkLogs]         = useState<string[]>([]);
  const [apkError, setApkError]       = useState("");
  const [apkDownloadUrl, setApkDownloadUrl] = useState("");
  const [apkBuildId, setApkBuildId]   = useState<string | undefined>(undefined);
  const [showApkLogs, setShowApkLogs] = useState(false);
  const [showApkPanel, setShowApkPanel] = useState(false);
  const apkPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // ── Floot Publish ──────────────────────────────────────────────────────────
  type FlootPublishPhase = "idle" | "checking" | "subdomain" | "deploying" | "polling" | "done" | "failed";
  const [flootPhase, setFlootPhase]         = useState<FlootPublishPhase>("idle");
  const [flootSubdomain, setFlootSubdomain] = useState("");
  const [flootLiveUrl, setFlootLiveUrl]     = useState("");
  const [flootError, setFlootError]         = useState("");
  const [flootCurrentSub, setFlootCurrentSub] = useState<string | null>(null);
  const [showFlootPanel, setShowFlootPanel] = useState(false);
  const flootPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  type BadgePhase = "idle" | "removing" | "done" | "failed";
  const [badgePhase, setBadgePhase]   = useState<BadgePhase>("idle");
  const [badgeError, setBadgeError]   = useState("");

  // ── Floot Native Mobile Build ───────────────────────────────────────────────
  type FlootMobilePhase = "idle" | "setting" | "polling" | "done" | "failed" | "upgrade";
  const [flootMobilePhase, setFlootMobilePhase]     = useState<FlootMobilePhase>("idle");
  const [flootBundleId, setFlootBundleId]           = useState("");
  const [flootMobileBuildId, setFlootMobileBuildId] = useState("");
  const [flootApkUrl, setFlootApkUrl]               = useState("");
  const [flootMobileError, setFlootMobileError]     = useState("");
  const flootMobilePollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const platformConnected = useCallback((id: PlatformId) => {
    if (id === "base44") return !!creds.base44Token;
    if (id === "rocket") return !!creds.rocketToken;
    if (id === "zite")   return !!creds.ziteSession;
    if (id === "floot")  return !!creds.flootToken;
    return false;
  }, [creds]);

  const loadApps = useCallback(async (pid: PlatformId) => {
    setAppsLoading(true); setAppsError(""); setApps([]); setSelectedApp(null); setFiles([]);
    setContainerSleeping(false);
    try {
      let result: AppItem[] = [];
      if (pid === "base44") {
        if (!creds.base44Token) throw new Error("Connect Base44 in Settings first.");
        result = await listBase44Apps({ data: { token: creds.base44Token } });
      } else if (pid === "rocket") {
        if (!creds.rocketToken) { setShowRocketModal(true); setAppsLoading(false); return; }
        result = await listRocketApps({ data: { token: creds.rocketToken, companyId: creds.rocketCompanyId } });
      } else if (pid === "zite") {
        if (!creds.ziteSession) throw new Error("Connect Zite in Settings first.");
        result = await listZiteApps({ data: { session: creds.ziteSession, csrf: creds.ziteCsrf ?? "" } });
      } else if (pid === "floot") {
        if (!creds.flootToken) throw new Error("Connect Floot in Settings first.");
        result = await listFlootApps({ data: { token: creds.flootToken } });
      }
      setApps(result);
    } catch (e: any) {
      setAppsError(e?.message ?? "Failed to load apps");
    } finally {
      setAppsLoading(false);
    }
  }, [creds]);

  useEffect(() => { loadApps(platform); }, [platform]);

  const selectApp = async (app: AppItem) => {
    setSelectedApp(app);
    setFilesLoading(true); setFilesError(""); setFiles([]);
    setContainerSleeping(false);
    try {
      let result: FileEntry[] = [];
      if (platform === "base44") {
        result = await fetchBase44AppFiles({ data: { token: creds.base44Token!, appId: app.id } });
      } else if (platform === "rocket") {
        result = await fetchRocketAppFiles({ data: { token: creds.rocketToken!, appId: app.id, applicationId: app.applicationId, companyId: creds.rocketCompanyId } });
      } else if (platform === "zite") {
        result = await fetchZiteAppFiles({ data: { session: creds.ziteSession!, csrf: creds.ziteCsrf ?? "", appId: app.id } });
      } else if (platform === "floot") {
        result = await fetchFlootAppFiles({ data: { token: creds.flootToken!, appId: app.id, appName: app.name } });
      }
      setFiles(result);
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      if (msg.toLowerCase().includes("sleeping") || e?.isContainerSleeping) {
        setContainerSleeping(true);
        setContainerUrl(`https://rocket.new/${app.id}`);
      } else {
        setFilesError(msg || "Failed to load files");
        toast.error(msg || "Failed to load files");
      }
    } finally {
      setFilesLoading(false);
    }
  };

  const goToStep2 = async () => {
    if (!selectedApp || files.length === 0) return;
    setStep(2);
    if (repos.length === 0 && !reposLoading) {
      setReposLoading(true);
      try {
        const result = await listGitHubRepos({ data: { token: creds.githubToken! } });
        setRepos(result);
      } catch { /* can still create new */ }
      finally { setReposLoading(false); }
    }
  };

  const push = async () => {
    if (!selectedApp || !creds.githubToken || !creds.githubUsername) return;
    setPushStatus("pushing"); setPushProgress(0); setPushError(""); setPushResult(null);

    let repoFull: string;
    let activeBranch = branch || "main";

    try {
      if (isNewRepo) {
        const name = newRepoName.trim();
        if (!name) { setPushError("Enter a repo name"); setPushStatus("error"); return; }
        const created = await createGitHubRepo({ data: { token: creds.githubToken, name, isPrivate } });
        repoFull = created.full_name;
        activeBranch = created.default_branch || "main";
      } else {
        if (!selectedRepo) { setPushError("Select a repository"); setPushStatus("error"); return; }
        repoFull = selectedRepo.full_name;
      }

      const [owner, repo] = repoFull.split("/");
      const snapshot  = getAppSnapshot(selectedApp.id);
      const diffMap   = computeFileDiff(files, snapshot);
      const changed   = files.filter((f) => diffMap.get(f.path) !== "unchanged");
      const filesToPush = changed.length > 0 ? changed : files;
      const filesToDelete = getDeletedPaths(files, snapshot);
      const message = commitMsg.trim() || `sync: ${selectedApp.name} → ${filesToPush.length} files`;

      const result = await pushFilesToGitHub({
        data: {
          token: creds.githubToken,
          owner, repo,
          branch: activeBranch,
          platform,
          files: filesToPush,
          filesToDelete,
          commitMessage: message,
          authorName: creds.githubName || creds.githubUsername,
          authorEmail: creds.githubEmail,
          onProgress: (done, total) => setPushProgress(Math.round((done / total) * 100)),
        },
      });

      saveAppSnapshot(selectedApp.id, files);
      addHistory({
        id: crypto.randomUUID(),
        appName: selectedApp.name,
        platform: platform as Platform,
        repo: repoFull,
        branch: activeBranch,
        commitMessage: message,
        commitHash: result.shortSha,
        filesCount: files.length,
        stagedCount: filesToPush.length,
        status: "success",
        timestamp: Date.now(),
      });
      savePushPrefs({
        platform: platform as Platform,
        lastRepo: selectedRepo ?? { full_name: repoFull, default_branch: activeBranch, html_url: "" },
        branch: activeBranch,
      });

      setPushResult({ commitSha: result.commitSha, shortSha: result.shortSha, repoUrl: `https://github.com/${repoFull}` });
      setPushStatus("done");
      setStep(3);
    } catch (e: any) {
      const msg = e?.message ?? "Push failed";
      setPushError(msg);
      setPushStatus("error");
      toast.error(msg);
      addHistory({
        id: crypto.randomUUID(),
        appName: selectedApp?.name ?? "",
        platform: platform as Platform,
        repo: isNewRepo ? newRepoName : (selectedRepo?.full_name ?? ""),
        branch: activeBranch,
        commitMessage: commitMsg || "sync",
        commitHash: "",
        filesCount: 0,
        status: "failed",
        error: msg,
        timestamp: Date.now(),
      });
    }
  };

  const reset = () => {
    setStep(1); setPushStatus("idle"); setPushResult(null); setPushError("");
    setSelectedApp(null); setFiles([]); setFilesError("");
    setCommitMsg(""); setContainerSleeping(false);
    setApkPhase("idle"); setApkLogs([]); setApkError(""); setApkDownloadUrl("");
    setShowApkPanel(false);
    stopFlootPolling(); setFlootPhase("idle"); setFlootError(""); setFlootLiveUrl("");
    setFlootCurrentSub(null); setShowFlootPanel(false); setFlootSubdomain("");
    loadApps(platform);
  };

  // ── APK build handler ──────────────────────────────────────────────────────
  const stopApkPolling = () => {
    if (apkPollingRef.current) { clearInterval(apkPollingRef.current); apkPollingRef.current = null; }
  };

  const apkPollOnce = async (threadId: string) => {
    if (!creds.rocketToken) return;
    try {
      const state = await checkRocketApkBuildStatus({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined } });
      if (state.buildId) setApkBuildId(state.buildId);

      if (state.status === APK_STATUS.COMPLETED) {
        stopApkPolling();
        setApkPhase("done");
        const logs = await fetchRocketApkBuildLog({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined, buildId: state.buildId } });
        if (logs.length) setApkLogs(logs);
        const url = await downloadRocketApk({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined } }).catch(() => "");
        if (url) setApkDownloadUrl(url);
        return;
      }
      if (state.status === APK_STATUS.FAILED || state.status === APK_STATUS.QUEUE_BUILD_REJECTED) {
        stopApkPolling();
        const logs = await fetchRocketApkBuildLog({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined, buildId: state.buildId } });
        if (logs.length) setApkLogs(logs);
        setApkError(state.errorMessage || "Build failed. Check logs for details.");
        setApkPhase("failed");
        return;
      }
      if (state.status === APK_STATUS.IN_PROCESS) {
        setApkPhase("building");
        const logs = await fetchRocketApkBuildLog({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined, buildId: state.buildId } });
        if (logs.length) setApkLogs(logs);
      } else if (state.status === APK_STATUS.IN_QUEUE) {
        setApkPhase("queued");
      }
    } catch (e: any) {
      console.warn("[push44:apk] poll error", e?.message);
    }
  };

  const handleApkBuild = async () => {
    if (!selectedApp || !creds.rocketToken) return;
    const threadId = selectedApp.id;
    stopApkPolling();
    setApkLogs([]); setApkError(""); setApkDownloadUrl(""); setApkBuildId(undefined);

    try {
      setApkPhase("keystore");
      await generateRocketKeystore({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined } });

      // Check if we need to reset a stuck state first
      setApkPhase("resetting");
      const status = await checkRocketApkBuildStatus({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined } }).catch(() => null);
      const needsReset = !!status?.isMaxApkBuildFailedAttempt;

      setApkPhase("queued");
      const triggered = await triggerRocketApkBuild({ data: { token: creds.rocketToken, threadId, companyId: creds.rocketCompanyId ?? undefined }, resetFirst: needsReset });
      if (triggered.buildId) setApkBuildId(triggered.buildId);

      apkPollingRef.current = setInterval(() => apkPollOnce(threadId), 5000);
      await apkPollOnce(threadId);
    } catch (e: any) {
      stopApkPolling();
      setApkError(e?.message ?? "Failed to trigger APK build");
      setApkPhase("failed");
    }
  };

  useEffect(() => () => { stopApkPolling(); stopFlootPolling(); }, []);
  useEffect(() => { if (showApkLogs) logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [apkLogs, showApkLogs]);

  // ── Floot publish handlers ──────────────────────────────────────────────────
  const stopFlootPolling = () => {
    if (flootPollingRef.current) { clearInterval(flootPollingRef.current); flootPollingRef.current = null; }
  };

  const SUBDOMAIN_RE = /^[a-z0-9-]{3,}$/;

  const onFlootSubdomainChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFlootSubdomain(slug);
  };

  const flootPollOnce = async (workspaceId: string) => {
    if (!creds.flootToken) return;
    try {
      const status = await getFlootDeploymentStatus({ data: { token: creds.flootToken, workspaceId } });
      if (status.type === "deployed") {
        stopFlootPolling();
        setFlootLiveUrl(`https://${status.subdomain}.floot.app`);
        setFlootCurrentSub(status.subdomain);
        setFlootPhase("done");
      } else if (status.type === "error") {
        stopFlootPolling();
        setFlootError((status as any).message ?? "Build failed on Floot's servers");
        setFlootPhase("failed");
      }
    } catch (e: any) {
      console.warn("[push44:floot] poll error", e?.message);
    }
  };

  const handleFlootPublish = async (subdomain: string, isUpdate = false) => {
    if (!selectedApp || !creds.flootToken) return;
    stopFlootPolling();
    setFlootError("");
    setFlootPhase("deploying");
    try {
      await triggerFlootDeploy({ data: { token: creds.flootToken, workspaceId: selectedApp.id, subdomain, isUpdate } });
      setFlootPhase("polling");
      flootPollingRef.current = setInterval(() => flootPollOnce(selectedApp.id), 10000);
      await flootPollOnce(selectedApp.id);
    } catch (e: any) {
      stopFlootPolling();
      setFlootError(e?.message ?? "Deploy failed");
      setFlootPhase("failed");
    }
  };

  const stopFlootMobilePolling = () => {
    if (flootMobilePollRef.current) { clearInterval(flootMobilePollRef.current); flootMobilePollRef.current = null; }
  };

  const handleFlootMobileBuild = async () => {
    if (!selectedApp || !creds.flootToken) return;
    const bundleId = flootBundleId.trim();
    if (!bundleId) { toast.error("Enter a bundle ID first (e.g. com.mycompany.myapp)"); return; }

    stopFlootMobilePolling();
    setFlootMobilePhase("setting");
    setFlootMobileError("");
    setFlootApkUrl("");
    setFlootMobileBuildId("");

    try {
      await setFlootMobileAppId({
        data: { token: creds.flootToken, workspaceId: selectedApp.id, mobileAppId: bundleId, name: selectedApp.name },
      });

      const generatedSlug = selectedApp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "my-app";
      const subdomain = flootCurrentSub ?? generatedSlug;

      await triggerFlootMobileBuild({
        data: { token: creds.flootToken, workspaceId: selectedApp.id, subdomain, isUpdate: !!flootCurrentSub },
      });

      setFlootMobilePhase("polling");
      let attempts = 0;

      const pollMobile = async () => {
        attempts++;
        try {
          const status = await getFlootMobileBuildStatus({ data: { token: creds.flootToken!, workspaceId: selectedApp.id } });
          if (status.type === "notEnabled") {
            stopFlootMobilePolling();
            setFlootMobilePhase("upgrade");
          } else if (status.type === "completed") {
            stopFlootMobilePolling();
            setFlootMobileBuildId(status.buildId);
            try {
              const url = await getFlootMobileDownloadUrl({
                data: { token: creds.flootToken!, workspaceId: selectedApp.id, buildId: status.buildId },
              });
              setFlootApkUrl(url);
            } catch { /* download URL might arrive later */ }
            setFlootMobilePhase("done");
            toast.success("Native APK is ready to download!");
          } else if (status.type === "failed") {
            stopFlootMobilePolling();
            setFlootMobileError((status as any).message ?? "Build failed");
            setFlootMobilePhase("failed");
          } else if (attempts >= 60) {
            stopFlootMobilePolling();
            setFlootMobileError("Build timed out after 10 minutes");
            setFlootMobilePhase("failed");
          }
        } catch { /* transient network error — keep polling */ }
      };

      flootMobilePollRef.current = setInterval(pollMobile, 10000);
      await pollMobile();
    } catch (e: any) {
      setFlootMobileError(e?.message ?? "Failed to start build");
      setFlootMobilePhase("failed");
    }
  };

  const handleRemoveBadge = async () => {
    if (!selectedApp || !creds.flootToken || !flootCurrentSub) return;
    setBadgePhase("removing");
    setBadgeError("");
    try {
      await removeFlootBadge({ data: { token: creds.flootToken, workspaceId: selectedApp.id } });
      handleFlootPublish(flootCurrentSub, true);
      setBadgePhase("done");
    } catch (e: any) {
      setBadgeError(e?.message ?? "Failed to remove badge");
      setBadgePhase("failed");
    }
  };

  const openFlootPanel = async () => {
    if (!selectedApp || !creds.flootToken) return;
    setShowFlootPanel(true);
    setFlootPhase("checking");
    setFlootSubdomain(""); setFlootError(""); setFlootLiveUrl(""); setFlootCurrentSub(null);
    try {
      const status = await getFlootDeploymentStatus({ data: { token: creds.flootToken, workspaceId: selectedApp.id } });
      if (status.type === "deployed") {
        setFlootCurrentSub(status.subdomain);
        setFlootLiveUrl(`https://${status.subdomain}.floot.app`);
        setFlootPhase("done");
      } else if (status.type === "deploying") {
        setFlootCurrentSub(status.subdomain);
        setFlootPhase("polling");
        flootPollingRef.current = setInterval(() => flootPollOnce(selectedApp.id), 10000);
      } else if (status.type === "error") {
        if ((status as any).subdomain) setFlootCurrentSub((status as any).subdomain);
        setFlootError((status as any).message ?? "Previous build failed");
        setFlootPhase("failed");
      } else {
        setFlootPhase("subdomain");
      }
    } catch {
      setFlootPhase("subdomain");
    }
  };

  // ── Filtered apps ──────────────────────────────────────────────────────────
  const filteredApps = apps.filter((a) =>
    !appSearch || a.name.toLowerCase().includes(appSearch.toLowerCase())
  );
  const filteredRepos = repos.filter((r) =>
    !repoSearch || r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  const pushin = pushStatus === "pushing";
  const canGoStep2 = selectedApp && files.length > 0 && !filesLoading;

  return (
    <div className="page">
      {showExplorer && selectedApp && files.length > 0 && (
        <FileExplorer
          files={files}
          appName={selectedApp.name}
          onClose={() => setShowExplorer(false)}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Push to GitHub</h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Fetch all source files and commit them in one atomic push.</p>
      </div>

      {/* ── Step 1: Platform + App ────────────────────────────────────────── */}
      <StepCard n={1} step={step} label="Select App" active={step === 1} done={step > 1}>
        {/* Platform tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {PLATFORMS.map(({ id, label, icon }) => {
            const connected = platformConnected(id);
            const active = platform === id;
            return (
              <button
                key={id}
                onClick={() => { setPlatform(id); savePushPrefs({ platform: id as Platform }); }}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
                  borderRadius: 7, border: `1px solid ${active ? "#f97316" : "#e2e8f0"}`,
                  background: active ? "#fff7ed" : "#f8fafc", cursor: "pointer",
                  fontWeight: 600, fontSize: 13,
                  color: active ? "#c2410c" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                {icon}{label}
                {!connected && <span style={{ fontSize: 10, background: "#fef2f2", color: "#b91c1c", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>Setup</span>}
              </button>
            );
          })}
        </div>

        {/* Not connected notice */}
        {!platformConnected(platform) && !showRocketModal && (
          <div style={{ padding: "12px 14px", borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#c2410c" }}>Connect {PLATFORMS.find(p => p.id === platform)?.label} in Settings first.</span>
            <Link to="/settings" className="btn btn-primary btn-sm">Settings →</Link>
          </div>
        )}

        {/* App list */}
        {platformConnected(platform) && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input className="input" placeholder="Search apps…" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} style={{ paddingLeft: 30 }} />
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => loadApps(platform)} disabled={appsLoading} title="Refresh">
                <RefreshCw size={13} style={{ animation: appsLoading ? "spin 0.6s linear infinite" : "none" }} />
              </button>
            </div>

            {appsLoading ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" />Loading apps…
              </div>
            ) : appsError ? (
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={14} color="#dc2626" />
                <span style={{ fontSize: 13, color: "#b91c1c" }}>{appsError}</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>
                {apps.length === 0 ? "No apps found." : "No apps match your search."}
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 7 }}>
                {filteredApps.map((app, i) => {
                  const isSelected = selectedApp?.id === app.id;
                  const isLoading  = filesLoading && isSelected;
                  return (
                    <button
                      key={app.id}
                      onClick={() => selectApp(app)}
                      disabled={filesLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, width: "100%",
                        padding: "10px 14px", border: "none", cursor: "pointer", textAlign: "left",
                        background: isSelected ? "#fff7ed" : "transparent",
                        borderBottom: i < filteredApps.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 0.1s",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{app.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {app.updated_at ? new Date(app.updated_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                      {isLoading && <span className="spinner" />}
                      {isSelected && !isLoading && files.length > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316" }}>{files.length} files</span>
                      )}
                      {isSelected && !isLoading && <Check size={14} color="#22c55e" />}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Files error */}
        {filesError && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 7, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <AlertCircle size={14} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#b91c1c" }}>{filesError}</span>
          </div>
        )}

        {/* Container sleeping (Rocket) */}
        {containerSleeping && (
          <div style={{ marginTop: 10, padding: 14, borderRadius: 8, background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#5b21b6", marginBottom: 4 }}>Container is sleeping</div>
            <p style={{ fontSize: 13, color: "#7c3aed", margin: "0 0 10px" }}>Open the app in Rocket.new to wake the container, then try again.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={containerUrl} target="_blank" rel="noopener" className="btn btn-sm" style={{ background: "#7c3aed", color: "#fff", borderColor: "#7c3aed" }}>
                Open in Rocket.new <ExternalLink size={11} />
              </a>
              <button className="btn btn-secondary btn-sm" onClick={() => { setContainerSleeping(false); selectedApp && selectApp(selectedApp); }}>
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Files ready bar + Browse button */}
        {canGoStep2 && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#64748b", flex: 1, minWidth: 0 }}>
              <strong>{selectedApp!.name}</strong> · {files.length} files ready
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowExplorer(true)}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <FolderOpen size={13} /> Browse files
            </button>
            {platform === "rocket" && (
              <button
                className="btn btn-sm"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 5 }}
                onClick={() => { setShowApkPanel(true); setApkPhase("idle"); setApkLogs([]); setApkError(""); setApkDownloadUrl(""); }}
              >
                <Smartphone size={13} /> Build APK
              </button>
            )}
            {platform === "floot" && (
              <button
                className="btn btn-sm"
                style={{ background: "linear-gradient(135deg,#0284c7,#0ea5e9)", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 5 }}
                onClick={openFlootPanel}
              >
                <Globe size={13} /> Publish to Floot
              </button>
            )}
            <button className="btn btn-primary" onClick={goToStep2}>
              Choose Repo →
            </button>
          </div>
        )}
      </StepCard>

      {/* ── Standalone APK Build Panel (Rocket.new, step 1, no push needed) ── */}
      {showApkPanel && platform === "rocket" && selectedApp && step === 1 && (
        <div className="card" style={{ marginBottom: 12, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Smartphone size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Build APK</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{selectedApp.name} — builds on Rocket.new servers</div>
              </div>
            </div>
            <button onClick={() => { stopApkPolling(); setShowApkPanel(false); setApkPhase("idle"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>

          {apkPhase === "idle" && (
            <button
              className="btn btn-primary"
              style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", justifyContent: "center" }}
              onClick={handleApkBuild}
            >
              <Smartphone size={14} />Trigger APK Build
            </button>
          )}

          {(apkPhase === "keystore" || apkPhase === "resetting" || apkPhase === "queued" || apkPhase === "building") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                <Loader2 size={15} color="#7c3aed" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#6d28d9", fontWeight: 600 }}>
                  {apkPhase === "keystore"  && "Generating keystore…"}
                  {apkPhase === "resetting" && "Resetting build state…"}
                  {apkPhase === "queued"    && "Queued — waiting for build slot…"}
                  {apkPhase === "building"  && "Building APK… (3–6 min)"}
                </span>
              </div>
              {apkPhase === "building" && (
                <div style={{ height: 4, borderRadius: 2, background: "#e9d5ff", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "40%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 2, animation: "apkProgress 3s ease-in-out infinite alternate" }} />
                </div>
              )}
              {apkLogs.length > 0 && (
                <button onClick={() => setShowApkLogs(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                  <Terminal size={12} />{showApkLogs ? "Hide" : "Show"} build logs ({apkLogs.length} lines){showApkLogs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              )}
            </div>
          )}

          {apkPhase === "done" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle size={15} color="#16a34a" />
                <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>APK build completed!</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {apkDownloadUrl && (
                  <a href={apkDownloadUrl} target="_blank" rel="noopener" className="btn btn-primary" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", flex: 1, justifyContent: "center" }}>
                    <Download size={13} />Download APK
                  </a>
                )}
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={handleApkBuild}>
                  <RefreshCw size={13} />Rebuild
                </button>
              </div>
              {apkLogs.length > 0 && (
                <button onClick={() => setShowApkLogs(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <Terminal size={12} />{showApkLogs ? "Hide" : "Show"} build logs ({apkLogs.length} lines){showApkLogs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              )}
            </div>
          )}

          {apkPhase === "failed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <XCircle size={14} color="#dc2626" />
                  <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>Build failed</span>
                </div>
                {apkError && <p style={{ fontSize: 12, color: "#b91c1c", margin: "4px 0 0 22px" }}>{apkError}</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#7c3aed,#a855f7)" }} onClick={handleApkBuild}>
                  <RefreshCw size={13} />Retry Build
                </button>
                {apkLogs.length > 0 && (
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowApkLogs(v => !v)}>
                    <Terminal size={13} />{showApkLogs ? "Hide" : "Show"} Logs
                  </button>
                )}
              </div>
            </div>
          )}

          {showApkLogs && apkLogs.length > 0 && (
            <div style={{ marginTop: 10, borderRadius: 8, background: "#0f172a", padding: "12px 14px", maxHeight: 220, overflowY: "auto", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6 }}>
              {apkLogs.map((line, i) => (
                <div key={i} style={{ color: line.toLowerCase().includes("error") ? "#f87171" : line.toLowerCase().includes("warn") ? "#fbbf24" : line.toLowerCase().includes("success") || line.toLowerCase().includes("built") ? "#4ade80" : "#94a3b8" }}>{line}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      )}

      {/* ── Standalone Floot Publish Panel (step 1, before push) ────────── */}
      {showFlootPanel && platform === "floot" && selectedApp && step === 1 && (
        <FlootPublishPanel
          appName={selectedApp.name}
          phase={flootPhase}
          subdomain={flootSubdomain}
          liveUrl={flootLiveUrl}
          currentSub={flootCurrentSub}
          error={flootError}
          onSubdomainChange={onFlootSubdomainChange}
          onPublish={(slug, isUpdate) => handleFlootPublish(slug, isUpdate)}
          onClose={() => { stopFlootPolling(); setShowFlootPanel(false); setFlootPhase("idle"); }}
          badgePhase={badgePhase}
          badgeError={badgeError}
          onRemoveBadge={handleRemoveBadge}
        />
      )}

      {/* ── Step 2: GitHub Repo ───────────────────────────────────────────── */}
      <StepCard n={2} step={step} label="Choose Repository" active={step === 2} done={step === 3 && pushStatus === "done"}>
        {step >= 2 && (
          <>
            {/* New vs existing toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button
                className={`btn${!isNewRepo ? " btn-primary" : " btn-secondary"}`}
                onClick={() => setIsNewRepo(false)}
              >
                <BookOpen14 /> Existing repo
              </button>
              <button
                className={`btn${isNewRepo ? " btn-primary" : " btn-secondary"}`}
                onClick={() => setIsNewRepo(true)}
              >
                <Plus size={14} /> New repo
              </button>
            </div>

            {isNewRepo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label className="label">Repository name</label>
                  <input
                    className="input"
                    placeholder={selectedApp?.name?.toLowerCase().replace(/\s+/g, "-") ?? "my-app"}
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, "-"))}
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} style={{ accentColor: "#f97316" }} />
                  <Lock size={13} color="#64748b" /> Private repository
                </label>
              </div>
            ) : (
              <>
                {/* Selected repo display */}
                {selectedRepo && (
                  <div
                    style={{ padding: "10px 12px", borderRadius: 7, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedRepo.full_name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{selectedRepo.default_branch}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedRepo(null); setShowRepoList(true); }}>Change</button>
                  </div>
                )}

                {/* Repo search */}
                {(!selectedRepo || showRepoList) && (
                  <>
                    <div style={{ position: "relative", marginBottom: 8 }}>
                      <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input className="input" placeholder="Search repos…" value={repoSearch} onChange={(e) => setRepoSearch(e.target.value)} style={{ paddingLeft: 30 }} />
                    </div>
                    {reposLoading ? (
                      <div style={{ textAlign: "center", padding: 16, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span className="spinner" />Loading repos…
                      </div>
                    ) : (
                      <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 7 }}>
                        {filteredRepos.length === 0 ? (
                          <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>No repositories found</div>
                        ) : filteredRepos.map((r, i) => (
                          <button
                            key={r.full_name}
                            onClick={() => { setSelectedRepo(r); setBranch(r.default_branch || "main"); setShowRepoList(false); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 10, width: "100%",
                              padding: "9px 12px", border: "none", cursor: "pointer", textAlign: "left",
                              background: selectedRepo?.full_name === r.full_name ? "#fff7ed" : "transparent",
                              borderBottom: i < filteredRepos.length - 1 ? "1px solid var(--border)" : "none",
                              transition: "background 0.1s",
                            }}
                          >
                            {r.private ? <Lock size={12} color="#94a3b8" /> : <Globe size={12} color="#94a3b8" />}
                            <span style={{ fontWeight: 600, fontSize: 13, flex: 1, textAlign: "left" }}>{r.full_name}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{r.default_branch}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Branch */}
            <div style={{ marginTop: 12 }}>
              <label className="label">Branch</label>
              <div style={{ position: "relative" }}>
                <GitBranch size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input className="input" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} style={{ paddingLeft: 30 }} />
              </div>
            </div>

            {/* Commit message */}
            <div style={{ marginTop: 10 }}>
              <label className="label">Commit message <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span></label>
              <input className="input" placeholder={`sync: ${selectedApp?.name ?? "app"} source files`} value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} />
            </div>

            {/* Actions */}
            <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={push} disabled={pushin || (!selectedRepo && !isNewRepo) || (isNewRepo && !newRepoName.trim())}>
                {pushin ? (
                  <><span className="spinner spinner-sm" />Pushing{pushProgress > 0 ? ` ${pushProgress}%` : "…"}</>
                ) : (
                  <><UploadCloud size={14} />Push {files.length} files</>
                )}
              </button>
            </div>

            {/* Push error */}
            {pushStatus === "error" && pushError && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 7, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <XCircle size={14} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#b91c1c" }}>{pushError}</span>
              </div>
            )}
          </>
        )}
      </StepCard>

      {/* ── Step 3: Result ────────────────────────────────────────────────── */}
      {step === 3 && pushStatus === "done" && pushResult && (
        <>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <CheckCircle size={44} color="#22c55e" style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Pushed successfully!</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              Commit{" "}
              <a href={`${pushResult.repoUrl}/commit/${pushResult.commitSha}`} target="_blank" rel="noopener" style={{ color: "#f97316", fontFamily: "monospace", fontWeight: 700 }}>
                {pushResult.shortSha}
              </a>
              {" "}→{" "}
              <a href={pushResult.repoUrl} target="_blank" rel="noopener" style={{ color: "#f97316", fontWeight: 600 }}>
                {isNewRepo ? newRepoName : selectedRepo?.full_name}
              </a>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={pushResult.repoUrl} target="_blank" rel="noopener" className="btn btn-secondary">
                <ExternalLink size={13} />View on GitHub
              </a>
              <button className="btn btn-primary" onClick={reset}>
                <UploadCloud size={13} />Push another app
              </button>
            </div>
          </div>

          {/* ── APK Build (Rocket.new only) ──────────────────────────────── */}
          {platform === "rocket" && selectedApp && (
            <div className="card" style={{ marginTop: 12, padding: 18 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Smartphone size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Build APK</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Compile a debug APK for {selectedApp.name}</div>
                </div>
              </div>

              {/* Idle state */}
              {apkPhase === "idle" && (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", justifyContent: "center" }}
                  onClick={handleApkBuild}
                >
                  <Smartphone size={14} />Trigger APK Build
                </button>
              )}

              {/* In-progress states */}
              {(apkPhase === "keystore" || apkPhase === "resetting" || apkPhase === "queued" || apkPhase === "building") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                    <Loader2 size={15} color="#7c3aed" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#6d28d9", fontWeight: 600 }}>
                      {apkPhase === "keystore"  && "Generating keystore…"}
                      {apkPhase === "resetting" && "Resetting build state…"}
                      {apkPhase === "queued"    && "Queued — waiting for build slot…"}
                      {apkPhase === "building"  && "Building APK… (this takes 3–6 min)"}
                    </span>
                  </div>
                  {apkPhase === "building" && (
                    <div style={{ height: 4, borderRadius: 2, background: "#e9d5ff", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 2, animation: "apkProgress 3s ease-in-out infinite alternate" }} />
                    </div>
                  )}
                  {/* Live logs toggle */}
                  {apkLogs.length > 0 && (
                    <button
                      onClick={() => setShowApkLogs(v => !v)}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                    >
                      <Terminal size={12} />
                      {showApkLogs ? "Hide" : "Show"} build logs ({apkLogs.length} lines)
                      {showApkLogs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                  )}
                </div>
              )}

              {/* Done state */}
              {apkPhase === "done" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <CheckCircle size={15} color="#16a34a" />
                    <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>APK build completed!</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {apkDownloadUrl && (
                      <a
                        href={apkDownloadUrl}
                        target="_blank"
                        rel="noopener"
                        className="btn btn-primary"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", flex: 1, justifyContent: "center" }}
                      >
                        <Download size={13} />Download APK
                      </a>
                    )}
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={handleApkBuild}
                    >
                      <RefreshCw size={13} />Rebuild
                    </button>
                  </div>
                  <button
                    onClick={() => setShowApkLogs(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <Terminal size={12} />
                    {showApkLogs ? "Hide" : "Show"} build logs ({apkLogs.length} lines)
                    {showApkLogs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                </div>
              )}

              {/* Failed state */}
              {apkPhase === "failed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: apkError ? 4 : 0 }}>
                      <XCircle size={14} color="#dc2626" />
                      <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>Build failed</span>
                    </div>
                    {apkError && <p style={{ fontSize: 12, color: "#b91c1c", margin: "4px 0 0 22px" }}>{apkError}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#7c3aed,#a855f7)" }} onClick={handleApkBuild}>
                      <RefreshCw size={13} />Retry Build
                    </button>
                    {apkLogs.length > 0 && (
                      <button
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={() => setShowApkLogs(v => !v)}
                      >
                        <Terminal size={13} />{showApkLogs ? "Hide" : "Show"} Logs
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Build log terminal */}
              {showApkLogs && apkLogs.length > 0 && (
                <div style={{ marginTop: 10, borderRadius: 8, background: "#0f172a", padding: "12px 14px", maxHeight: 220, overflowY: "auto", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6 }}>
                  {apkLogs.map((line, i) => (
                    <div key={i} style={{ color: line.toLowerCase().includes("error") ? "#f87171" : line.toLowerCase().includes("warn") ? "#fbbf24" : line.toLowerCase().includes("success") || line.toLowerCase().includes("built") ? "#4ade80" : "#94a3b8" }}>
                      {line}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          )}

          {/* ── Floot Publish (Floot only) ────────────────────────────────── */}
          {platform === "floot" && selectedApp && (
            <div style={{ marginTop: 12 }}>
              <FlootPublishPanel
                appName={selectedApp.name}
                phase={flootPhase}
                subdomain={flootSubdomain}
                liveUrl={flootLiveUrl}
                currentSub={flootCurrentSub}
                error={flootError}
                onSubdomainChange={onFlootSubdomainChange}
                onPublish={(slug, isUpdate) => handleFlootPublish(slug, isUpdate)}
                autoOpen={flootPhase === "idle"}
                badgePhase={badgePhase}
                badgeError={badgeError}
                onRemoveBadge={handleRemoveBadge}
              />
              <div style={{ marginTop: 10 }}>
                <FlootMobileBuildPanel
                  appName={selectedApp.name}
                  phase={flootMobilePhase}
                  bundleId={flootBundleId}
                  apkUrl={flootApkUrl}
                  buildId={flootMobileBuildId}
                  error={flootMobileError}
                  onBundleIdChange={setFlootBundleId}
                  onBuild={handleFlootMobileBuild}
                  onReset={() => { stopFlootMobilePolling(); setFlootMobilePhase("idle"); setFlootMobileError(""); setFlootApkUrl(""); setFlootMobileBuildId(""); }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Rocket modal */}
      {showRocketModal && (
        <RocketModal
          onSuccess={(token, email, companyId) => {
            updateCreds({ rocketToken: token, rocketEmail: email, rocketCompanyId: companyId });
            setShowRocketModal(false);
            loadApps("rocket");
          }}
          onClose={() => { setShowRocketModal(false); }}
        />
      )}
    </div>
  );
}

function BookOpen14() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

// ── FlootMobileBuildPanel ─────────────────────────────────────────────────────
const MOBILE_GRADIENT = "linear-gradient(135deg,#7c3aed,#a855f7)";
const BUNDLE_ID_RE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){1,}$/;

interface FlootMobileBuildPanelProps {
  appName: string;
  phase: "idle" | "setting" | "polling" | "done" | "failed" | "upgrade";
  bundleId: string;
  apkUrl: string;
  buildId: string;
  error: string;
  onBundleIdChange: (val: string) => void;
  onBuild: () => void;
  onReset: () => void;
}

function FlootMobileBuildPanel({
  appName, phase, bundleId, apkUrl, buildId, error,
  onBundleIdChange, onBuild, onReset,
}: FlootMobileBuildPanelProps) {
  const bundleOk = BUNDLE_ID_RE.test(bundleId.trim());
  const busy = phase === "setting" || phase === "polling";

  return (
    <div className="card" style={{ padding: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: MOBILE_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Smartphone size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Generate Native App</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{appName} — build Android APK via Floot</div>
        </div>
      </div>

      {/* Idle — bundle ID input */}
      {phase === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Android bundle ID
            </label>
            <input
              className="input"
              placeholder="com.yourcompany.appname"
              value={bundleId}
              onChange={(e) => onBundleIdChange(e.target.value.trim())}
              style={{ fontFamily: "monospace", fontSize: 13 }}
            />
            <div style={{ marginTop: 5, fontSize: 12 }}>
              {!bundleId ? (
                <span style={{ color: "#94a3b8" }}>Unique ID for your app on Android — e.g. com.acme.myapp</span>
              ) : bundleOk ? (
                <span style={{ color: "#7c3aed" }}>✓ Valid bundle ID</span>
              ) : (
                <span style={{ color: "#f97316" }}>At least 2 dot-separated segments (e.g. com.example.app)</span>
              )}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: MOBILE_GRADIENT, justifyContent: "center", opacity: bundleOk ? 1 : 0.5 }}
            disabled={!bundleOk}
            onClick={onBuild}
          >
            <Smartphone size={14} /> Generate Native App
          </button>
          <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
            Requires Floot 100k (ultra) plan. Triggers an Android APK build on Floot's servers (~5–10 min).
          </div>
        </div>
      )}

      {/* Setting bundle ID */}
      {phase === "setting" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#faf5ff", border: "1px solid #e9d5ff" }}>
          <Loader2 size={14} color="#7c3aed" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#6d28d9" }}>Setting bundle ID and queuing build…</span>
        </div>
      )}

      {/* Polling */}
      {phase === "polling" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#faf5ff", border: "1px solid #e9d5ff" }}>
            <Loader2 size={14} color="#7c3aed" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, color: "#6d28d9", fontWeight: 600 }}>Building native app…</div>
              <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>Checking every 10 s — typical build takes 5–10 min.</div>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "#e9d5ff", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "50%", background: MOBILE_GRADIENT, borderRadius: 2, animation: "apkProgress 3s ease-in-out infinite alternate" }} />
          </div>
        </div>
      )}

      {/* Done */}
      {phase === "done" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle size={15} color="#16a34a" />
            <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>APK build complete!</span>
          </div>
          {apkUrl ? (
            <a
              href={apkUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
              style={{ background: MOBILE_GRADIENT, justifyContent: "center" }}
            >
              <Download size={14} /> Download APK
            </a>
          ) : (
            <div style={{ fontSize: 12, color: "#64748b", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              Build ID: <code style={{ fontFamily: "monospace", fontSize: 11 }}>{buildId}</code>
              <br />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Download link not available — check your Floot dashboard.</span>
            </div>
          )}
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={onReset}>
            <RefreshCw size={12} /> Build Again
          </button>
        </div>
      )}

      {/* Upgrade required */}
      {phase === "upgrade" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <AlertCircle size={14} color="#d97706" />
              <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>Floot 100k plan required</span>
            </div>
            <p style={{ fontSize: 12, color: "#78350f", margin: 0, lineHeight: 1.5 }}>
              Native mobile builds are gated to Floot's 100k (ultra) subscription.
              Upgrade your Floot account, then try again.
            </p>
          </div>
          <a
            href="https://floot.com/pricing"
            target="_blank"
            rel="noopener"
            className="btn btn-secondary"
            style={{ justifyContent: "center" }}
          >
            <ExternalLink size={13} /> View Floot Pricing
          </a>
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={onReset}>
            <RefreshCw size={12} /> Try Again
          </button>
        </div>
      )}

      {/* Failed */}
      {phase === "failed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <XCircle size={14} color="#dc2626" />
              <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>Build failed</span>
            </div>
            {error && <p style={{ fontSize: 12, color: "#b91c1c", margin: "4px 0 0 22px" }}>{error}</p>}
          </div>
          <button className="btn btn-primary" style={{ background: MOBILE_GRADIENT, justifyContent: "center" }} onClick={onReset}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ── FlootPublishPanel ────────────────────────────────────────────────────────
type FlootPublishPhaseT = "idle" | "checking" | "subdomain" | "deploying" | "polling" | "done" | "failed";

interface FlootPublishPanelProps {
  appName: string;
  phase: FlootPublishPhaseT;
  subdomain: string;
  liveUrl: string;
  currentSub: string | null;
  error: string;
  onSubdomainChange: (val: string) => void;
  onPublish: (slug: string, isUpdate?: boolean) => void;
  onClose?: () => void;
  autoOpen?: boolean;
  badgePhase?: "idle" | "removing" | "done" | "failed";
  badgeError?: string;
  onRemoveBadge?: () => void;
}

const FLOOT_GRADIENT = "linear-gradient(135deg,#0284c7,#0ea5e9)";
const SUBDOMAIN_VALID = /^[a-z0-9-]{3,}$/;

function FlootPublishPanel({
  appName, phase, subdomain, liveUrl, currentSub,
  error, onSubdomainChange, onPublish, onClose, autoOpen,
  badgePhase = "idle", badgeError = "", onRemoveBadge,
}: FlootPublishPanelProps) {
  const slugOk = SUBDOMAIN_VALID.test(subdomain);

  return (
    <div className="card" style={{ padding: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: FLOOT_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Globe size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Publish to Floot</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{appName} — deploys on Floot's servers</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Checking current status */}
      {phase === "checking" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          <Loader2 size={14} color="#0284c7" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#0369a1" }}>Checking deployment status…</span>
        </div>
      )}

      {/* Subdomain picker — not yet deployed */}
      {(phase === "subdomain" || (phase === "idle" && autoOpen)) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Choose a subdomain for your app
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                placeholder="my-app-name"
                value={subdomain}
                onChange={(e) => onSubdomainChange(e.target.value)}
                style={{ paddingRight: 80 }}
              />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8", pointerEvents: "none" }}>
                .floot.app
              </span>
            </div>
            <div style={{ marginTop: 5, fontSize: 12 }}>
              {!subdomain ? (
                <span style={{ color: "#94a3b8" }}>Lowercase letters, digits and hyphens — min 3 chars</span>
              ) : slugOk ? (
                <span style={{ color: "#0284c7" }}>→ <strong>{subdomain}.floot.app</strong></span>
              ) : (
                <span style={{ color: "#94a3b8" }}>Min 3 chars, lowercase letters / digits / hyphens only</span>
              )}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: FLOOT_GRADIENT, justifyContent: "center", opacity: slugOk ? 1 : 0.5 }}
            disabled={!slugOk}
            onClick={() => onPublish(subdomain, false)}
          >
            <Globe size={14} /> Publish App
          </button>
        </div>
      )}

      {/* Deploying / polling */}
      {(phase === "deploying" || phase === "polling") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
            <Loader2 size={15} color="#0284c7" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, color: "#0369a1", fontWeight: 600 }}>
                {phase === "deploying" ? "Triggering deploy…" : `Building ${subdomain || currentSub}.floot.app…`}
              </div>
              {phase === "polling" && (
                <div style={{ fontSize: 11, color: "#0284c7", marginTop: 2 }}>First publish takes 2–5 min. Checking every 10s.</div>
              )}
            </div>
          </div>
          {phase === "polling" && (
            <div style={{ height: 4, borderRadius: 2, background: "#bae6fd", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "50%", background: FLOOT_GRADIENT, borderRadius: 2, animation: "apkProgress 3s ease-in-out infinite alternate" }} />
            </div>
          )}
        </div>
      )}

      {/* Done */}
      {phase === "done" && liveUrl && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle size={15} color="#16a34a" />
            <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>Published successfully!</span>
          </div>
          <a href={liveUrl} target="_blank" rel="noopener" className="btn btn-primary" style={{ background: FLOOT_GRADIENT, justifyContent: "center" }}>
            <ExternalLink size={13} /> Open {liveUrl.replace("https://", "")}
          </a>
          {/* Remove badge */}
          {onRemoveBadge && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                Hide "Made with Floot" badge
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                Injects a CSS rule into your app and republishes — the badge disappears from the live site.
              </div>

              {badgePhase === "idle" && (
                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={onRemoveBadge}
                >
                  <XCircle size={13} /> Remove Badge
                </button>
              )}

              {badgePhase === "removing" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Loader2 size={13} color="#64748b" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#475569" }}>Injecting CSS rule… this takes a few seconds</span>
                </div>
              )}

              {badgePhase === "done" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>Badge hidden — rebuilding app (~30s)</span>
                </div>
              )}

              {badgePhase === "failed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ padding: "9px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <XCircle size={13} color="#dc2626" />
                      <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>Badge removal failed</span>
                    </div>
                    {badgeError && <p style={{ fontSize: 11, color: "#b91c1c", margin: "4px 0 0 21px" }}>{badgeError}</p>}
                  </div>
                  <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={onRemoveBadge}>
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Redeploy with different subdomain */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Republish with a different subdomain</div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  className="input"
                  placeholder={currentSub ?? "new-subdomain"}
                  value={subdomain}
                  onChange={(e) => onSubdomainChange(e.target.value)}
                  style={{ paddingRight: 68, fontSize: 12 }}
                />
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8", pointerEvents: "none" }}>.floot.app</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!slugOk}
                style={{ opacity: slugOk ? 1 : 0.5, whiteSpace: "nowrap" }}
                onClick={() => onPublish(subdomain, true)}
              >
                <RefreshCw size={12} /> Redeploy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed */}
      {phase === "failed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <XCircle size={14} color="#dc2626" />
              <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>Publish failed</span>
            </div>
            {error && <p style={{ fontSize: 12, color: "#b91c1c", margin: "4px 0 0 22px" }}>{error}</p>}
          </div>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              placeholder={currentSub ?? "my-app-name"}
              value={subdomain}
              onChange={(e) => onSubdomainChange(e.target.value)}
              style={{ paddingRight: 68 }}
            />
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8", pointerEvents: "none" }}>.floot.app</span>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: FLOOT_GRADIENT, justifyContent: "center", opacity: slugOk ? 1 : 0.5 }}
            disabled={!slugOk}
            onClick={() => onPublish(subdomain, !!currentSub)}
          >
            <RefreshCw size={14} /> Retry Publish
          </button>
        </div>
      )}
    </div>
  );
}
