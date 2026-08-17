# Security Policy

## 🔒 Push44 Security Overview

Push44 is designed with a **privacy-first, client-side zero-backend architecture**:
- **No Central Server**: All network calls originate directly from your browser, terminal, or Android device to official platform endpoints (Base44, Rocket.new, Floot, Zite, GitHub).
- **No Remote Database**: User API tokens, GitHub Personal Access Tokens (PAT), and project snapshots are stored exclusively in the user's browser `localStorage` or device app sandbox.
- **Zero Telemetry / Zero Tracking**: No analytics trackers, no session loggers, and no middleman proxies.

---

## 🛡️ Supported Versions

| Surface | Version | Supported |
| :--- | :--- | :--- |
| **Web App** (`push44.vercel.app`) | Latest (`main` branch) | ✅ |
| **Android App** (`Push44-release.apk`) | `>= 1.0.0` | ✅ |
| **CLI Tool** (`p44`) | `>= 1.0.0` | ✅ |

---

## 🚨 Reporting a Vulnerability

We take the security of Push44 and our users' credentials seriously. If you discover a security vulnerability, please do **NOT** open a public issue.

### Preferred Method:
Please report vulnerabilities privately via **[GitHub Private Security Advisories](https://github.com/The-habib/Push44/security/advisories/new)**.

### What to include:
- A description of the vulnerability.
- Steps to reproduce the issue (proof of concept code or cURL requests).
- Impact assessment.

### Our Commitment:
- We will acknowledge receipt of your report within 48 hours.
- We will provide a timeline for fixing and verifying the vulnerability.
- Once resolved, we will publish a security advisory giving appropriate credit.
