import * as React from "react";

import {
  clearStoredAuthSession,
  type AuthUser,
  readStoredAuthSession,
  shouldValidateStoredAuthSession,
  validateStoredAuthSession,
  writeStoredAuthSession,
} from "~/lib/auth/storage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  setSession: (session: { token: string; user: AuthUser }) => void;
  clearSession: () => void;
  validateSession: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  const clearSession = React.useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredAuthSession();
  }, []);

  const setSession = React.useCallback(
    (session: { token: string; user: AuthUser }) => {
      const nextSession = {
        token: session.token,
        user: session.user,
        lastValidatedAt: Date.now(),
      };

      setUser(session.user);
      setToken(session.token);
      writeStoredAuthSession(nextSession);
    },
    []
  );

  const validateSession = React.useCallback(async () => {
    const session = readStoredAuthSession();

    if (!session?.token) {
      return;
    }

    if (!shouldValidateStoredAuthSession(session)) {
      setUser(session.user);
      setToken(session.token);
      return;
    }

    const validated = await validateStoredAuthSession(session);

    if (!validated) {
      clearSession();
      return;
    }

    setUser(validated.user);
    setToken(validated.token);
    writeStoredAuthSession(validated);
  }, [clearSession]);

  React.useEffect(() => {
    const session = readStoredAuthSession();

    if (session?.token) {
      setUser(session.user);
      setToken(session.token);
    }

    setHydrated(true);

    if (session?.token) {
      void validateSession();
    }
  }, [validateSession]);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "wakana.auth") {
        return;
      }

      const nextSession = readStoredAuthSession();

      if (!nextSession?.token) {
        setUser(null);
        setToken(null);
        return;
      }

      setUser(nextSession.user);
      setToken(nextSession.token);
    };

    const handleFocus = () => {
      const nextSession = readStoredAuthSession();
      if (nextSession?.token) {
        void validateSession();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [hydrated, validateSession]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      hydrated,
      isAuthenticated: Boolean(token && user),
      setSession,
      clearSession,
      validateSession,
    }),
    [clearSession, hydrated, setSession, token, user, validateSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
