# Identity & Authentication Audit

| Service / Tool | Binary Path | Authentication Status | Identity Details / Evidence |
| :--- | :--- | :--- | :--- |
| **Replit Identity** | `/usr/bin/replit` | **AUTHENTICATED** | `replit identity create` successfully mints signed v2 STS JWT tokens |
| **GitHub CLI (`gh`)** | `/repl/ctls/bin/gh` | `UNAUTHENTICATED` | Output: "You are not logged into any GitHub hosts." |
| **Google Cloud (`gcloud`)** | `/repl/ctls/bin/gcloud` | `UNAUTHENTICATED` | Output: "No credentialed accounts." |
| **npm Registry** | `/nix/store/.../npm` | `UNAUTHENTICATED` | Output: `ENEEDAUTH` (Requires `npm adduser`) |
| **Docker** | `/nix/store/.../docker` | `UNAUTHENTICATED` | Docker CLI active (v27.5.1), unauthenticated to private registries |
| **Git Identity** | `/repl/ctls/bin/git` | `CONFIGURED` | Global system git proxies configured at `/run/replit/git-proxy.gitconfig` |
