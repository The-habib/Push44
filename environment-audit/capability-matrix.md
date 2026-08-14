# Capability Matrix & Scorecards

| Category | Status | Explanation & Evidence |
| :--- | :--- | :--- |
| **Execution** | `FULL` | Bun 1.3.6, Node 20.20.0, Python 3.13.4, GCC 14.3.0, Make 4.4.1 |
| **Filesystem** | `PARTIAL` | `/home/runner/workspace` (Writable 30GB), `/tmp` (Writable), `/etc` (Read-only overlay) |
| **Network Egress** | `FULL` | Direct HTTP/HTTPS to external internet (GitHub, npm, PyPI) |
| **Browser Automation** | `FULL` | Headless Playwright Chromium (`$REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE`) screenshot/PDF |
| **Cloud CLIs** | `UNAUTHENTICATED` | `gcloud`, `bq`, `gsutil` installed but require explicit `gcloud auth login` |
| **GitHub CLI** | `UNAUTHENTICATED` | `gh` installed but requires explicit `gh auth login` |
| **Replit Infrastructure** | `FULL` | `replit identity create` (v2 STS JWT minting), NaCl seal/unseal, agentapi IPC |
| **Unix Sockets IPC** | `FULL` | `/run/replit/socks/portauthority.sock`, `pid2ws.sock`, `seccomp.sock` connected |
| **Databases** | `FULL` | SQLite 3.48.0 (Python/Bun), PostgreSQL 16.10 server binary installed |
| **Compilers** | `FULL` | GCC 14.3.0, G++ 14.3.0, Binutils 2.44 (`objdump`, `readelf`, `nm`, `strings`) |
| **Media Engines** | `FULL` | FFmpeg 6.1.2 (MP4/GIF encoding verified), ImageMagick 7.1.2 (canvas/convert verified) |
| **Security Analysis** | `FULL` | Semgrep 1.152.0 static code scanner verified |
| **Package Ecosystem** | `FULL` | Nix 2.31.1 (`nix-shell`), UPM (`upm`), Bun (`bun install`), NPM |
| **Persistence** | `PARTIAL` | Files in `/home/runner/workspace` persist across restarts; `/tmp` is ephemeral |
| **Container Access** | `RESTRICTED` | Unprivileged container sandbox (UID 1000), no root access |
