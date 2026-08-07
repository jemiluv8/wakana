import { VITE_PUBLIC_API_URL } from "~/config";

export const AUTH_STORAGE_KEY = "wakana.auth";
export const AUTH_VALIDATION_INTERVAL_MS = 15 * 60 * 1000;

export type AuthUser = {
  id: string;
  email: string;
  avatar: string;
  has_wakatime_integration: boolean;
  is_new_user: boolean;
  name?: string;
  full_name?: string;
  display_name?: string;
  username?: string;
};

export type StoredAuthSession = {
  token: string;
  user: AuthUser;
  lastValidatedAt: number;
};

export function isBrowser() {
  return typeof window !== "undefined";
}

export function readStoredAuthSession(): StoredAuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.token || !parsed?.user) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredAuthSession(session: StoredAuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAuthToken() {
  return readStoredAuthSession()?.token ?? null;
}

export function shouldValidateStoredAuthSession(
  session: StoredAuthSession | null
) {
  if (!session?.token) {
    return false;
  }

  if (!session.lastValidatedAt) {
    return true;
  }

  return Date.now() - session.lastValidatedAt >= AUTH_VALIDATION_INTERVAL_MS;
}

export async function validateStoredAuthSession(
  session: StoredAuthSession
): Promise<StoredAuthSession | null> {
  const response = await fetch(`${VITE_PUBLIC_API_URL}/v1/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      token: session.token,
    },
  });

  if (!response.ok) {
    return null;
  }

  return {
    ...session,
    lastValidatedAt: Date.now(),
  };
}
