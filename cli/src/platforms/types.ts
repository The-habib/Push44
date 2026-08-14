import type {
  SupportedPlatform,
  StoredCredentials,
  RemoteApp,
  ExportedProject,
  ProjectFile,
} from "../types.js";

export interface AuthInput {
  email?: string;
  password?: string;
  token?: string;
  otp?: string;
  session?: string;
  csrf?: string;
  companyId?: string;
}

export interface AuthResult {
  token?: string;
  session?: string;
  csrf?: string;
  email?: string;
  name?: string;
  companyId?: string;
  refreshToken?: string;
}

export interface ValidationResult {
  valid: boolean;
  email?: string;
  name?: string;
  details?: Record<string, any>;
  error?: string;
}

export interface ExportOptions {
  onProgress?: (current: number, total: number, path: string) => void;
  onStatus?: (status: string) => void;
}

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
  exportProject(
    appId: string,
    creds: StoredCredentials,
    options?: ExportOptions
  ): Promise<ExportedProject>;
  normalizeFiles(files: any[]): ProjectFile[];
}
