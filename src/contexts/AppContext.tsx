import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getCredentials,
  saveCredentials,
  clearCredentials,
  type Credentials,
} from "@/lib/storage";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

interface AppState {
  creds: Partial<Credentials>;
  githubUser: GitHubUser | null;
  isLoaded: boolean;
  updateCreds: (partial: Partial<Credentials>) => void;
  signOut: () => void;
  setGitHubUser: (u: GitHubUser | null) => void;
}

const AppContext = createContext<AppState>({
  creds: {},
  githubUser: null,
  isLoaded: false,
  updateCreds: () => {},
  signOut: () => {},
  setGitHubUser: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [creds, setCreds] = useState<Partial<Credentials>>({});
  const [githubUser, setGitHubUser] = useState<GitHubUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getCredentials();
    setCreds(stored);
    setIsLoaded(true);
  }, []);

  const updateCreds = useCallback((partial: Partial<Credentials>) => {
    saveCredentials(partial);
    setCreds((prev) => ({ ...prev, ...partial }));
  }, []);

  const signOut = useCallback(() => {
    clearCredentials();
    setCreds({});
    setGitHubUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{ creds, githubUser, isLoaded, updateCreds, signOut, setGitHubUser }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
