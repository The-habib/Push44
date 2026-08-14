# Push44 CLI Documentation & Architecture Manual

The universal command-line interface for AI vibe-coding platforms.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Push44 CLI                            │
│  (Commander · Chalk · Ora · Prompts · Table · JSZip · Node) │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
        ┌───────▼───────┐             ┌───────▼───────┐
        │  Auth Store   │             │ Git & GitHub  │
        │ (AES-256-GCM) │             │  (Trees API)  │
        └───────┬───────┘             └───────┬───────┘
                │                             │
┌───────────────▼─────────────────────────────▼───────────────┐
│              Universal Platform Adapter Layer               │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Base44  │  │Rocket.new│  │  Floot   │  │   Zite   │ ... │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Modular Adapter Interface

Every platform adapter implements the `UniversalPlatformAdapter` interface:

```typescript
export interface UniversalPlatformAdapter {
  platform: SupportedPlatform;
  displayName: string;
  description: string;
  website: string;
  authMethods: ("email_password" | "otp" | "token" | "session_cookie")[];

  authenticate(input: AuthInput): Promise<AuthResult>;
  validateSession(creds: StoredCredentials): Promise<ValidationResult>;
  listApps(creds: StoredCredentials): Promise<RemoteApp[]>;
  getApp(appId: string, creds: StoredCredentials): Promise<RemoteApp | null>;
  exportProject(appId: string, creds: StoredCredentials, options?: ExportOptions): Promise<ExportedProject>;
  normalizeFiles(files: any[]): ProjectFile[];
}
```

Adding a new platform adapter requires simply creating `cli/src/platforms/<new-platform>.ts` implementing this contract and registering it in `cli/src/platforms/index.ts`.
