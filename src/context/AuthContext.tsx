import { createContext, useContext, useMemo, useState } from "react";
import type { AuthUser } from "../services/auth.service";
import { logout as logoutApi } from "../services/auth.service";

type AuthContextType = {
  user: AuthUser | null;
  setUserFromAuth: (user: AuthUser | null) => void;

  
  signOut: () => Promise<void>;

  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const setUserFromAuth = (next: AuthUser | null) => {
    setUser(next);
  };

  const signOut = async () => {
    const refreshToken = localStorage.getItem("refreshToken");


    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);

    try {
      // best-effort backend revoke
      await logoutApi(refreshToken);
    } catch {
      // ignore backend logout errors
    } finally {
      window.location.href = "/login";
    }
  };


  const clearSession = async () => {
    await signOut();
  };

  const value = useMemo(
    () => ({
      user,
      setUserFromAuth,
      signOut,
      clearSession,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}