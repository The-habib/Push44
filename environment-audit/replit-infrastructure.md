# Replit-Specific Infrastructure Audit

## 1. Native Replit Control Binaries

### `replit`
- **Location**: `/nix/store/3mb5pci3v9713drr3jglikrvx3xifl2c-replit-runtime-path/bin/replit`
- **Command Set**: `replit identity`, `replit identityv2`, `replit ai`, `replit shutdown`.
- **Identity Minting Test**:
  ```bash
  replit identity create
  # Output: Minted authentic v2 STS JWT identity token:
  # v2.public.Q2lSbFpEVXpPRFU0TXkweVlqTTBMVFE0WW1RdE9XUmhZaTFqTUd...
  ```
- **NaCl Box Cryptography Test**:
  - `replit identity seal`: Encrypts stdin payload targeted to a Repl token.
  - `replit identity unseal`: Decrypts NaCl box payload.

### `agentapi`
- **Location**: `/home/runner/.gemini/antigravity-cli/bin/agentapi`
- **Function**: Subagent orchestration interface (`new-conversation`, `send-message`, `get-conversation-metadata`).

### `upm` (Universal Package Manager)
- **Location**: `/nix/store/3mb5pci3v9713drr3jglikrvx3xifl2c-replit-runtime-path/bin/upm`
- **Function**: Polyglot package management (`upm guess`, `upm search`, `upm install-replit-nix-system-dependencies`).

---

## 2. Unix Domain Sockets Inspection

| Socket Path | Owner | Mode | Connectivity Status | Function |
| :--- | :--- | :--- | :--- | :--- |
| `/run/replit/socks/portauthority.sock` | runner (1000) | `0o140755` | `Connected` | Port mapping & HTTP preview routing daemon |
| `/run/replit/socks/pid2ws.sock` | runner (1000) | `0o140755` | `Connected` | Process supervisor (PID2) WebSocket IPC |
| `/run/replit/socks/pid2ping.0.sock` | runner (1000) | `0o140755` | `Connected` | Supervisor liveness ping socket |
| `/run/replit/seccomp.sock` | runner (1000) | `0o140755` | `Connected` | Seccomp security filter daemon socket |

---

## 3. Replit Package Firewall Mirror
- **HTTP Endpoint**: `http://package-firewall.replit.local/npm/` (Returns HTTP 200)
- **Health Endpoint**: `http://package-firewall.replit.local/health` (Returns HTTP 200 OK)
