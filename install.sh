#!/usr/bin/env sh
# Push44 CLI Universal Installer
# Compatible with Linux, macOS, Replit, GitHub Codespaces, and Termux

set -e

RESET='\033[0m'
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'

printf "\n%b%bPush44 CLI Installer%b\n" "$BOLD" "$CYAN" "$RESET"
printf "Universal CLI for AI Vibe-Coding Platforms\n\n"

# Check runtime: Bun or Node
if command -v bun >/dev/null 2>&1; then
    RUNTIME="bun"
    printf "%b✓ Detected Bun runtime (%s)%b\n" "$GREEN" "$(bun --version)" "$RESET"
elif command -v node >/dev/null 2>&1; then
    RUNTIME="node"
    printf "%b✓ Detected Node.js runtime (%s)%b\n" "$GREEN" "$(node --version)" "$RESET"
else
    printf "%b✖ Node.js or Bun is required to run Push44 CLI.%b\n" "$RED" "$RESET"
    printf "Install Bun: curl -fsSL https://bun.sh/install | bash\n"
    exit 1
fi

INSTALL_DIR="${PUSH44_INSTALL_DIR:-$HOME/.push44/bin}"
mkdir -p "$INSTALL_DIR"

printf "Installing Push44 CLI binary to %b%s%b...\n" "$CYAN" "$INSTALL_DIR" "$RESET"

# If in local repo, link or copy
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/cli/dist/push44.js" ]; then
    cp "$SCRIPT_DIR/cli/dist/push44.js" "$INSTALL_DIR/push44"
elif [ -f "$SCRIPT_DIR/cli/bin/push44.js" ]; then
    cp "$SCRIPT_DIR/cli/bin/push44.js" "$INSTALL_DIR/push44"
else
    # Global npm/bun package install fallback
    if [ "$RUNTIME" = "bun" ]; then
        bun add -g push44 >/dev/null 2>&1 || true
    else
        npm install -g push44 >/dev/null 2>&1 || true
    fi
fi

chmod +x "$INSTALL_DIR/push44" 2>/dev/null || true
ln -sf "$INSTALL_DIR/push44" "$INSTALL_DIR/p44" 2>/dev/null || true

# PATH check
case ":$PATH:" in
    *":$INSTALL_DIR:"*) ;;
    *)
        printf "\n%bNote: Add Push44 to your PATH:%b\n" "$YELLOW" "$RESET"
        printf "  export PATH=\"\$HOME/.push44/bin:\$PATH\"\n\n"
        ;;
esac

printf "%b✓ Push44 CLI installed successfully!%b\n\n" "$GREEN" "$RESET"
printf "Get started with:\n"
printf "  %bpush44 login%b       # connect your accounts\n" "$CYAN" "$RESET"
printf "  %bpush44 apps%b        # discover projects\n" "$CYAN" "$RESET"
printf "  %bpush44 doctor%b      # verify system health\n\n" "$CYAN" "$RESET"
