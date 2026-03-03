import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type AppRole = 'admin' | 'member';

type AppUser = {
  email: string;
  role: AppRole;
};

type AuthContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = 'karta.auth.v1';

const demoUsers: Array<{ email: string; password: string; role: AppRole }> = [
  { email: 'admin@karta.ai', password: 'admin123', role: 'admin' },
  { email: 'member@karta.ai', password: 'member123', role: 'member' },
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as AppUser;
    } catch {
      return null;
    }
  });

  async function login(email: string, password: string): Promise<boolean> {
    const found = demoUsers.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
    );

    if (!found) return false;

    const appUser: AppUser = {
      email: found.email,
      role: found.role,
    };

    setUser(appUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
