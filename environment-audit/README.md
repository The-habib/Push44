# Empirical Environment & Boundary Audit Workspace

This directory contains the complete, empirical, evidence-based capability and boundary audit of the running **Replit Shell** environment.

## Audit Artifact Sitemap

| Artifact | Description |
| :--- | :--- |
| [`executive-summary.md`](executive-summary.md) | High-level synthesis of what this environment actually is, can do, and cannot do |
| [`capability-matrix.md`](capability-matrix.md) | Category-by-category capability scorecards (FULL, PARTIAL, RESTRICTED, etc.) |
| [`replit-infrastructure.md`](replit-infrastructure.md) | Empirical analysis of Replit-specific binaries (`replit`, `agentapi`), sockets, proxies |
| [`network-boundary.md`](network-boundary.md) | DNS resolution, IPv4, outbound HTTPS endpoints, package firewall mirror |
| [`filesystem-boundary.md`](filesystem-boundary.md) | Mount permissions, ephemeral vs persistent partitions (`/tmp`, `/home/runner`, `/nix`) |
| [`process-isolation.md`](process-isolation.md) | Namespaces, cgroups, Linux capabilities, seccomp sockets, container indicators |
| [`authentication-state.md`](authentication-state.md) | Real authentication status for GitHub CLI, gcloud, npm, git, Replit Identity |
| [`browser-capabilities.md`](browser-capabilities.md) | Headless Playwright Chromium automation (screenshots, DOM dumping, PDF generation) |
| [`developer-toolchain.md`](developer-toolchain.md) | Compilers, runtimes (Bun, Node, Python), language servers, build systems |
| [`cloud-capabilities.md`](cloud-capabilities.md) | Installed cloud SDKs (`gcloud`, `bq`, `gsutil`, `docker`) and authentication boundary |
| [`persistence.md`](persistence.md) | Survival model across child process, shell restart, and session restart |
| [`security-boundary.md`](security-boundary.md) | Trust boundaries, accessible vs restricted resources, container isolation |
| [`discovered-tools.md`](discovered-tools.md) | Complete inventory of all binaries in PATH and Nix store |
| [`verified-claims.md`](verified-claims.md) | Claim verification table comparing claimed vs tested vs confirmed capabilities |
| [`evidence/`](evidence/) | Raw JSON telemetry evidence dumps (`baseline.json`, `binaries_and_sockets.json`, etc.) |
