import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getRbacMe, login as loginApi, me as meApi, signup as signupApi, type RbacSnapshot, type User } from '../lib/api';

type AuthContextType = {
  token: string | null;
  user: User | null;
  rbac: RbacSnapshot | null;
  permissions: string[];
  modules: string[];
  roles: string[];
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasModule: (moduleSlug: string) => boolean;
  refreshRbac: () => Promise<RbacSnapshot | null>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = 'karta.auth.token';
const USER_KEY = 'karta.auth.user';
const RBAC_KEY = 'karta.auth.rbac';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });
  const [rbac, setRbac] = useState<RbacSnapshot | null>(() => {
    const raw = localStorage.getItem(RBAC_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RbacSnapshot;
    } catch {
      return null;
    }
  });

  async function refreshRbac(): Promise<RbacSnapshot | null> {
    if (!token) return null;
    const snapshot = await getRbacMe(token);
    setRbac(snapshot);
    localStorage.setItem(RBAC_KEY, JSON.stringify(snapshot));
    return snapshot;
  }

  async function login(email: string, password: string) {
    const { token: authToken, user: authUser } = await loginApi(email, password);
    // validate token and fetch canonical user
    const me = await meApi(authToken);
    setToken(authToken);
    setUser(me.user ?? authUser);
    try {
      const snapshot = await getRbacMe(authToken);
      setRbac(snapshot);
      localStorage.setItem(RBAC_KEY, JSON.stringify(snapshot));
    } catch {
      setRbac(null);
      localStorage.removeItem(RBAC_KEY);
    }
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(me.user ?? authUser));
  }

  async function signup(email: string, password: string) {
    const { token: authToken, user: authUser } = await signupApi(email, password);
    const me = await meApi(authToken);
    setToken(authToken);
    setUser(me.user ?? authUser);
    try {
      const snapshot = await getRbacMe(authToken);
      setRbac(snapshot);
      localStorage.setItem(RBAC_KEY, JSON.stringify(snapshot));
    } catch {
      setRbac(null);
      localStorage.removeItem(RBAC_KEY);
    }
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(me.user ?? authUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    setRbac(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(RBAC_KEY);
  }

  useEffect(() => {
    if (!token || !user) return;
    if (rbac) return;
    void refreshRbac().catch(() => undefined);
  }, [token, user, rbac]);

  function hasPermission(permission: string) {
    if (user?.isRoot) return true;
    if (!rbac) {
      if (user?.role === 'admin' || user?.role === 'superadmin') return true;
      if (user?.role === 'member') return permission === 'billing.view';
      return false;
    }
    return rbac.permissions.includes('*') || rbac.permissions.includes(permission);
  }

  function hasModule(moduleSlug: string) {
    if (user?.isRoot) return true;
    if (!rbac) {
      if (user?.role === 'admin' || user?.role === 'superadmin') return false;
      return moduleSlug === 'todokarta';
    }
    return rbac.modules.includes('*') || rbac.modules.includes(moduleSlug);
  }

  const permissions = rbac?.permissions ?? [];
  const modules = rbac?.modules ?? [];
  const roles = rbac?.roles ?? [];

  const value = useMemo(
    () => ({
      token,
      user,
      rbac,
      permissions,
      modules,
      roles,
      isAuthenticated: Boolean(token && user),
      hasPermission,
      hasModule,
      refreshRbac,
      login,
      signup,
      logout,
    }),
    [token, user, rbac, permissions, modules, roles],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
