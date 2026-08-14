# Claim Verification Matrix

| Claimed Capability | Evidence Gathered | Tested? | Result | Confidence Level |
| :--- | :--- | :--- | :--- | :--- |
| `replit identity create` | Executed command, received v2 STS JWT token | **YES** | **CONFIRMED** | `HIGH` |
| `agentapi` CLI | Evaluated binary, checked command schema | **YES** | **CONFIRMED** | `HIGH` |
| Headless Playwright Chromium | Executed screenshot & DOM dump script | **YES** | **CONFIRMED** | `HIGH` |
| ImageMagick Suite | Generated canvas PNG & converted to JPG | **YES** | **CONFIRMED** | `HIGH` |
| FFmpeg Transcoding | Encoded 1-second test MP4 video | **YES** | **CONFIRMED** | `HIGH` |
| Semgrep Security Scanning | Executed `--version`, verified rules | **YES** | **CONFIRMED** | `HIGH` |
| Replit Unix Domain Sockets | Connected to `/run/replit/socks/*.sock` | **YES** | **CONFIRMED** | `HIGH` |
| Google Cloud CLI | Executed `gcloud auth list`, unauthenticated | **YES** | **CONFIRMED** | `HIGH` |
| GitHub CLI | Executed `gh auth status`, unauthenticated | **YES** | **CONFIRMED** | `HIGH` |
| PostgreSQL | Executed `postgres --version` (v16.10) | **YES** | **CONFIRMED** | `HIGH` |
