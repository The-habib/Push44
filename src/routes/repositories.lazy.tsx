import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ExternalLink, Lock, Globe, Star, RefreshCw } from "lucide-react";
import { listGitHubRepos } from "@/lib/github-api";
import { useApp } from "@/contexts/AppContext";
import { formatRelativeTime } from "@/lib/storage";

export const Route = createLazyFileRoute("/repositories")({ component: RepositoriesPage });

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f0db4f", Python: "#3572A5", Go: "#00add8",
  Rust: "#dea584", Java: "#b07219", "C#": "#178600", Vue: "#41b883",
  Dart: "#00B4AB", Swift: "#f05138", Kotlin: "#7f52ff",
};

export default function RepositoriesPage() {
  const { creds } = useApp();
  const [search, setSearch] = useState("");

  const { data: repos = [], isLoading, error, refetch } = useQuery({
    queryKey: ["repos", creds.githubToken],
    queryFn: () => listGitHubRepos({ data: { token: creds.githubToken! } }),
    enabled: !!creds.githubToken,
  });

  const filtered = repos.filter((r) =>
    !search || r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (!creds.githubToken) {
    return (
      <div className="page">
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <BookOpen size={32} color="#cbd5e1" style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 8 }}>GitHub not connected</div>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px" }}>Add your GitHub token in Settings to see your repositories.</p>
          <a href="/settings" className="btn btn-primary">Go to Settings →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Repositories</h1>
          {repos.length > 0 && <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{repos.length} repositories</p>}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw size={13} style={{ animation: isLoading ? "spin 0.6s linear infinite" : "none" }} />Refresh
        </button>
      </div>

      {/* Search */}
      {repos.length > 0 && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input className="input" placeholder="Search repositories…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <span className="spinner spinner-lg" style={{ margin: "0 auto", display: "block" }} />
          <div style={{ color: "#64748b", marginTop: 12 }}>Loading repositories…</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 32, textAlign: "center", borderColor: "#fecaca", background: "#fef2f2" }}>
          <div style={{ fontWeight: 600, color: "#dc2626", marginBottom: 6 }}>Failed to load repositories</div>
          <p style={{ color: "#b91c1c", fontSize: 13, margin: "0 0 12px" }}>{(error as Error).message}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <BookOpen size={32} color="#cbd5e1" style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontWeight: 600, color: "#64748b" }}>{search ? "No repositories match" : "No repositories found"}</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {filtered.map((repo, i) => (
            <div key={repo.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {repo.private
                    ? <Lock size={13} color="#94a3b8" />
                    : <Globe size={13} color="#94a3b8" />}
                  <a href={repo.html_url} target="_blank" rel="noopener" style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", textDecoration: "none" }}>
                    {repo.full_name}
                  </a>
                  <span style={{ padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>
                    {repo.default_branch}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                  {repo.language && (
                    <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: LANG_COLORS[repo.language] ?? "#94a3b8", display: "inline-block" }} />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
                      <Star size={11} />{repo.stargazers_count}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Updated {formatRelativeTime(new Date(repo.updated_at).getTime())}</span>
                </div>
              </div>
              <a href={repo.html_url} target="_blank" rel="noopener" className="btn btn-ghost btn-icon btn-sm">
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
