export function completionCommand(shell = "bash"): void {
  if (shell === "zsh") {
    console.log(`
#compdef push44 p44

_push44() {
  local -a commands
  commands=(
    'login:Authenticate with an AI platform or GitHub'
    'logout:Clear stored platform credentials'
    'auth:Inspect connection matrix and active sessions'
    'whoami:Show current authenticated accounts'
    'apps:List and search AI projects across platforms'
    'clone:Export files and initialize local repository'
    'pull:Pull latest source code updates from platform'
    'export:Export project or package as standalone ZIP'
    'diff:View visual file modifications'
    'sync:Auto-detect changes, commit and push to GitHub'
    'push:Direct atomic commit via GitHub Trees API'
    'inspect:Deep tech stack, framework and tree analysis'
    'doctor:Comprehensive health and connectivity audit'
    'backup:Export all projects to timestamped ZIPs'
    'watch:Real-time file change watcher with auto-sync'
    'release:Automated release pipeline and CI monitoring'
    'apk:Rocket.new Android build manager'
    'badge:Remove watermark branding pills'
    'deploy:Trigger web deployments'
    'config:Manage global CLI preferences'
  )

  _describe 'command' commands
}

_push44 "$@"
`);
    return;
  }

  // Default Bash completion
  console.log(`
_push44_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="login logout auth whoami apps clone pull export diff sync push inspect doctor backup watch release apk badge deploy config"
  local platforms="base44 rocket floot zite bolt lovable github"

  if [ $COMP_CWORD -eq 1 ]; then
    COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
  elif [ $COMP_CWORD -eq 2 ]; then
    case "\${COMP_WORDS[1]}" in
      login|logout|apps|badge|deploy)
        COMPREPLY=( $(compgen -W "$platforms" -- "$cur") )
        ;;
    esac
  fi
}

complete -F _push44_completions push44 p44
`);
}
