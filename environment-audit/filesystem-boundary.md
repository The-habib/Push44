# Filesystem & Partition Audit

## Partition Layout & Mount Permissions

| Mount Point | Partition / Size | Used | Free | Ownership | Permissions | Persistence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/home/runner/workspace` | overlay / 256 GB | 2.0 GB | 253 GB | `runner:runner` | Read/Write | **Persistent** |
| `/tmp` | scratch / 32 GB | 1.7 GB | 30 GB | `runner:runner` | Read/Write | Ephemeral |
| `/nix/store` | overlay / 256 GB | 2.0 GB | 253 GB | `runner:runner` | Read-only | Immutable |
| `/mnt/snix` | `/dev/vda` / 1.8 TB | 1.7 TB | 129 GB | `root:root` | Read-only | System Nix Store |
