'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AuthUser = { id: string; email: string; name?: string } | null;
type AuthCtx = { user: AuthUser; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json() as { user: AuthUser };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  useEffect(() => { void fetch('/api/auth/me', { credentials: 'include' }).then(async res => {
    const data = await res.json() as { user: AuthUser };
    setUser(data.user);
  }).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);

  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
