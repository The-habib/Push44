import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect } from "react";
import {
  Lock,
  ArrowRight,
  Cloud,
  FileText,
  Code2,
  Clock,
  GitBranch,
  Github,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { listBase44Apps } from "@/lib/base44-api";
import { listGitHubRepos } from "@/lib/github-api";
import { getHistory, formatRelativeTime } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Base44 Push — Ship to GitHub in one click" },
      {
        name: "description",
        content:
          "Push your Base44 projects to GitHub securely, privately, and encrypted in one click.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { creds, isLoaded } = useApp();
  const navigate = useNavigate();

  const [apps, setApps] = useState<{ id: string; name: string; updated_at: string }[]>([]);
  const [repos, setRepos] = useState<{ full_name: string; default_branch: string }[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [history, setHistory] = useState(getHistory());

  const isConnected = !!(creds.base44Token && creds.githubToken);
  const lastPush = history[0];

  useEffect(() => {
    if (!isLoaded) return;
    setHistory(getHistory());
    if (!isConnected) return;

    setLoadingApps(true);
    listBase44Apps({ data: { token: creds.base44Token! } })
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoadingApps(false));

    setLoadingRepos(true);
    listGitHubRepos({ data: { token: creds.githubToken! } })
      .then((r) => setRepos(r.map((x) => ({ full_name: x.full_name, default_branch: x.default_branch }))))
      .catch(() => {})
      .finally(() => setLoadingRepos(false));
  }, [isLoaded, isConnected]);

  return (
    <AppShell>
      {/* Hero */}
      <section
        className="relative rounded-[32px] px-6 pt-7 pb-6 overflow-hidden mb-5"
        style={{ backgroundColor: "#dfeaa0" }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 480"
          preserveAspectRatio="none"
        >
          <path
            d="M 180 60 C 260 40, 340 90, 360 200 C 380 310, 320 400, 220 420 C 140 435, 90 380, 110 290 C 125 220, 130 90, 180 60 Z"
            fill="#c8d97a"
            opacity="0.55"
          />
          <path
            d="M 200 120 C 270 110, 330 180, 320 270 C 312 350, 240 380, 180 350 C 130 325, 145 200, 200 120 Z"
            fill="#b8cc5e"
            opacity="0.35"
          />
        </svg>

        <div className="relative z-20">
          <h2 className="text-[40px] leading-[0.98] font-extrabold text-black tracking-tight">
            Push your
            <br />
            code to{" "}
            <span className="text-[#7d9b2c]">GitHub</span>
          </h2>
        </div>

        <div className="absolute right-3 top-4 w-[170px] h-[280px] z-10 pointer-events-none">
          <div className="absolute left-2 top-6 h-[68px] w-[68px] rounded-[20px] bg-[#8b5cf6] flex items-center justify-center rotate-[-10deg] shadow-[0_8px_20px_rgba(139,92,246,0.35)]">
            <span className="text-white font-extrabold text-[34px] italic leading-none">
              B
            </span>
          </div>
          <svg
            className="absolute left-[88px] top-2 w-5 h-5"
            viewBox="0 0 20 20"
            fill="#8b5cf6"
          >
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
          </svg>
          <div className="absolute right-1 top-8 text-[#a3c043] text-[28px] font-light leading-none">
            ✳
          </div>
          <svg
            className="absolute left-12 top-16 w-[110px] h-[80px]"
            viewBox="0 0 110 80"
            fill="none"
          >
            <path
              d="M5 5 C 50 -5, 95 25, 75 70"
              stroke="#1a1a1a"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <path
              d="M67 62 L75 70 L78 60"
              stroke="#1a1a1a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div className="absolute right-0 top-[100px] h-[120px] w-[120px] rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-xl">
            <Github className="h-[72px] w-[72px] text-white" strokeWidth={1.5} />
          </div>
          <div className="absolute left-[-20px] top-[150px] h-2.5 w-2.5 rounded-full bg-white" />
          <div className="absolute left-[-8px] top-[200px] h-3 w-3 rounded-full bg-[#f97316]" />
          <div className="absolute left-2 top-[260px] h-2 w-2 rounded-full bg-[#8b5cf6]" />
          <div className="absolute right-2 top-[250px] h-1.5 w-1.5 rounded-full bg-[#a3c043]" />
        </div>

        <div className="relative z-20 mt-32 max-w-[55%]">
          <p className="text-[14px] text-black/75 leading-snug font-medium">
            {isConnected
              ? `${apps.length || "…"} apps · ${repos.length || "…"} repos`
              : "Connect your accounts to begin."}
          </p>
          <button
            onClick={() => navigate({ to: isConnected ? "/push" : "/settings" })}
            className="mt-5 flex items-center gap-3 bg-[#0a0a0a] rounded-full pl-5 pr-1.5 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
          >
            <Cloud className="h-[18px] w-[18px] text-white" strokeWidth={2} />
            <span className="text-white font-semibold text-[15px]">
              {isConnected ? "Push Now" : "Get Started"}
            </span>
            <span className="h-10 w-10 rounded-full bg-[#c5e352] flex items-center justify-center ml-1">
              <ArrowRight
                className="h-[18px] w-[18px] text-black"
                strokeWidth={2.5}
              />
            </span>
          </button>
          <div className="mt-6 flex items-center gap-2 text-[12px] text-black/75 font-medium">
            <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>Secure</span>
            <span className="text-black/40">•</span>
            <span>Private</span>
            <span className="text-black/40">•</span>
            <span>Encrypted</span>
          </div>
        </div>
      </section>

      {/* Connection status */}
      {!isConnected && (
        <div className="flex items-start gap-3 bg-[#fde2cf] rounded-2xl p-4 mb-5">
          <AlertCircle className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-black">Setup required</div>
            <div className="text-xs text-black/60 mt-0.5">
              Connect your Base44 account and GitHub token in Settings to start
              pushing.
            </div>
          </div>
        </div>
      )}

      {/* Recent Repository */}
      {isConnected && (
        <SectionCard
          title="Recent Repository"
          action={
            <button
              onClick={() => navigate({ to: "/repositories" })}
              className="flex items-center gap-1 bg-[#f3f2ee] rounded-full px-3 py-1.5 text-xs font-semibold text-black"
            >
              View all
            </button>
          }
        >
          {loadingRepos ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-[#8b5cf6]" />
            </div>
          ) : repos.length > 0 ? (
            <div className="flex items-center gap-3 border border-[#eee] rounded-xl p-2.5">
              <div className="h-10 w-10 rounded-lg border border-[#eee] flex items-center justify-center">
                <Github className="h-5 w-5 text-black" />
              </div>
              <span className="flex-1 text-sm font-semibold text-black truncate">
                {repos[0].full_name}
              </span>
              <span className="flex items-center gap-1 bg-[#ede9fe] text-[#7c3aed] rounded-md px-2 py-1 text-xs font-semibold">
                <GitBranch className="h-3 w-3" /> {repos[0].default_branch}
              </span>
            </div>
          ) : (
            <div className="text-sm text-black/50 text-center py-2">
              No repositories yet.
            </div>
          )}
        </SectionCard>
      )}

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#e9e4f8" }}>
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
            <FileText className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <div className="text-[11px] text-black/60 font-medium">Apps</div>
          <div className="text-xl font-extrabold text-black">
            {loadingApps ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              apps.length
            )}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#dce99a" }}>
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
            <Github className="h-5 w-5 text-black" />
          </div>
          <div className="text-[11px] text-black/60 font-medium">Repos</div>
          <div className="text-xl font-extrabold text-black">
            {loadingRepos ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              repos.length
            )}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#fde2cf" }}>
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-3">
            <Clock className="h-5 w-5 text-[#f97316]" />
          </div>
          <div className="text-[11px] text-black/60 font-medium">Pushes</div>
          <div className="text-xl font-extrabold text-black">
            {history.length}
          </div>
        </div>
      </section>

      {/* Recent Changes */}
      {lastPush && (
        <SectionCard
          title="Last Push"
          action={
            <button
              onClick={() => navigate({ to: "/history" })}
              className="flex items-center gap-1 text-[#7c3aed] text-xs font-semibold"
            >
              History
            </button>
          }
        >
          <div className="relative rounded-xl bg-[#f7f6f1] p-4 overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-sm font-bold text-black">
                  {lastPush.appName}
                </div>
                <div className="text-xs text-black/60 mt-0.5">
                  {lastPush.repo}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  lastPush.status === "success"
                    ? "bg-[#dcfce7] text-[#22c55e]"
                    : "bg-[#fee2e2] text-[#ef4444]"
                }`}
              >
                {lastPush.status === "success" ? "Pushed" : "Failed"}
              </span>
            </div>
            <div className="text-xs font-mono text-black/50">
              {lastPush.commitHash
                ? `commit ${lastPush.commitHash}`
                : lastPush.error}
            </div>
            <div className="text-[10px] text-black/40 mt-1">
              {formatRelativeTime(lastPush.timestamp)} ·{" "}
              {lastPush.filesCount} files · {lastPush.branch}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-[#dce99a] flex items-center justify-center">
              <Check className="h-3 w-3 text-black" strokeWidth={3} />
            </span>
            <span className="text-xs text-black/70 font-medium">
              {lastPush.status === "success"
                ? "All changes were pushed successfully."
                : "Last push failed — try again."}
            </span>
          </div>
        </SectionCard>
      )}

      {/* CTA */}
      {isConnected && (
        <section
          className="rounded-2xl p-5 flex items-center gap-3 mb-5 overflow-hidden relative"
          style={{ backgroundColor: "#e9e4f8" }}
        >
          <div className="flex-1">
            <h3 className="font-extrabold text-black text-[17px]">
              Ready to <span className="text-[#7c3aed]">ship?</span>
            </h3>
            <p className="text-[11px] text-black/70 mt-1 leading-tight">
              Push your code to GitHub
              <br />
              in one secure click.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/push" })}
            className="bg-gradient-to-b from-[#a78bfa] to-[#8b5cf6] rounded-full px-5 py-3 flex items-center gap-2 shadow-lg"
          >
            <Cloud className="h-4 w-4 text-white" />
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              Push to GitHub
            </span>
          </button>
        </section>
      )}
    </AppShell>
  );
}
