import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMyAccess, getRbacMe, login as loginApi, signup as signupApi, type RbacSnapshot, type User } from '../lib/api';

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
  updateUser: (nextUser: User) => void;
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
  const [memberModules, setMemberModules] = useState<string[]>([]);

  const refreshRbac = useCallback(async (): Promise<RbacSnapshot | null> => {
    if (!token) return null;
    const snapshot = await getRbacMe(token);
    setRbac(snapshot);
    localStorage.setItem(RBAC_KEY, JSON.stringify(snapshot));
    return snapshot;
  }, [token]);

  const refreshMemberModules = useCallback(async (currentToken: string): Promise<string[]> => {
    try {
      const access = await getMyAccess(currentToken);
      const modules = access.modules ?? [];
      setMemberModules(modules);
      return modules;
    } catch {
      setMemberModules([]);
      return [];
    }
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: authToken, user: authUser } = await loginApi(email, password);
    setToken(authToken);
    setUser(authUser);
    try {
      const snapshot = await getRbacMe(authToken);
      setRbac(snapshot);
      localStorage.setItem(RBAC_KEY, JSON.stringify(snapshot));
    } catch {
      setRbac(null);
      localStorage.removeItem(RBAC_KEY);
    }
    await refreshMemberModules(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }, [refreshMemberModules]);

  const signup = useCallback(async (email: string, password: string) => {
    const { token: authToken, user: authUser } = await signupApi(email, password);
    setToken(authToken);
    setUser(authUser);
    try {
      const snapshot = await getRbacMe(authToken);
      setRbac(snapshot);
      localStorage.setItem(RBAC_KEY, JSON.stringify(snapshot));
    } catch {
      setRbac(null);
      localStorage.removeItem(RBAC_KEY);
    }
    await refreshMemberModules(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }, [refreshMemberModules]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setRbac(null);
    setMemberModules([]);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(RBAC_KEY);
  }, []);

  useEffect(() => {
    if (!token || !user) return;
    if (rbac) return;
    void refreshRbac().catch(() => undefined);
  }, [token, user, rbac, refreshRbac]);

  useEffect(() => {
    if (!token || !user || user.role !== 'member') return;
    void refreshMemberModules(token);
  }, [token, user, refreshMemberModules]);

  const hasPermission = useCallback((permission: string) => {
    if (user?.isRoot) return true;
    if (!rbac) {
      if (user?.role === 'admin' || user?.role === 'superadmin') return true;
      if (user?.role === 'member') return permission === 'billing.view';
      return false;
    }
    return rbac.permissions.includes('*') || rbac.permissions.includes(permission);
  }, [user, rbac]);

  const hasModule = useCallback((moduleSlug: string) => {
    if (user?.isRoot) return true;
    if (user?.role === 'member') {
      return memberModules.includes('*') || memberModules.includes(moduleSlug);
    }
    if (!rbac) {
      if (user?.role === 'admin' || user?.role === 'superadmin') return false;
      return false;
    }
    return rbac.modules.includes('*') || rbac.modules.includes(moduleSlug);
  }, [user, rbac, memberModules]);

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
      updateUser,
      login,
      signup,
      logout,
    }),
    [token, user, rbac, permissions, modules, roles, hasPermission, hasModule, refreshRbac, updateUser, login, signup, logout],
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
