# Persistence Model & Workspace Survival

| Location | Survives Process Exit | Survives Shell Restart | Survives Repl Restart |
| :--- | :--- | :--- | :--- |
| `/home/runner/workspace` | **YES** | **YES** | **YES** |
| `~/.config` | **YES** | **YES** | **YES** |
| `/tmp` | **YES** | **YES** | NO (Cleared on cold start) |
| `/run/replit` | NO (Managed by PID1) | NO | NO |
