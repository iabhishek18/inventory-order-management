import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/endpoints";
import type { User } from "@/api/types";
import { setUnauthorizedHandler, tokenStorage } from "@/lib/api";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!tokenStorage.get());
  const navigate = useNavigate();

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await authApi.login(email, password);
      tokenStorage.set(token.access_token);
      const me = await authApi.me();
      setUser(me);
    },
    [],
  );

  const register = useCallback(
    async (email: string, fullName: string, password: string) => {
      await authApi.register({ email, full_name: fullName, password });
      await login(email, password);
    },
    [login],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
