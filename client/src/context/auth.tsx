import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

type U = { id: string; fullName: string; role: 'ADMIN' | 'EMPLOYEE' };
const Ctx = createContext<{ user: U | null; refresh: () => Promise<void> }>({ user: null, refresh: async () => undefined });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<U | null>(null);
  const refresh = async () => {
    try {
      const r = await api.get('/auth/me');
      setUser(r.data.data);
    } catch {
      setUser(null);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  return <Ctx.Provider value={{ user, refresh }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
