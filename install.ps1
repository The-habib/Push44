# Push44 CLI Installer for Windows PowerShell
$ErrorActionPreference = "Stop"

Write-Host "`nPush44 CLI Installer for Windows" -ForegroundColor Cyan
Write-Host "Universal CLI for AI Vibe-Coding Platforms`n"

$runtime = ""
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $runtime = "bun"
    Write-Host "✓ Detected Bun runtime" -ForegroundColor Green
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
    $runtime = "node"
    Write-Host "✓ Detected Node.js runtime" -ForegroundColor Green
} else {
    Write-Error "Node.js or Bun is required. Install from https://nodejs.org or https://bun.sh"
    exit 1
}

$InstallDir = "$env:USERPROFILE\.push44\bin"
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path "$ScriptDir\cli\dist\push44.js") {
    Copy-Item "$ScriptDir\cli\dist\push44.js" "$InstallDir\push44.js" -Force
}

# Create batch wrapper
@"
@echo off
node "%~dp0\push44.js" %*
"@ | Out-File -FilePath "$InstallDir\push44.cmd" -Encoding ASCII

Write-Host "✓ Push44 CLI installed successfully to $InstallDir`n" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  push44 login" -ForegroundColor Cyan
Write-Host "  push44 apps" -ForegroundColor Cyan
Write-Host "  push44 doctor" -ForegroundColor Cyan
