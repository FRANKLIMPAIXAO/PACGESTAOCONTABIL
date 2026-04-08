"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { authApi, setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Office {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  office: Office | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; officeName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restaura sessão ao carregar a página
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((data: any) => setUser(data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    setOffice(data.office);
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(async (form: { name: string; email: string; password: string; officeName: string }) => {
    const data = await authApi.register(form);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    setOffice(data.office);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    clearTokens();
    setUser(null);
    setOffice(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, office, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
