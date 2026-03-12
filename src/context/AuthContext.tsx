import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { AuthUser } from "../services/auth.service";
import { logout as logoutApi, getCurrentUser } from "../services/auth.service";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;

  setUserFromAuth: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;

  refreshUser: () => Promise<void>;
  patchUserLocal: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      return;
    }

    const current = getCurrentUser();
    setUser(current);
  };

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, []);

  const setUserFromAuth = (next: AuthUser | null) => {
    setUser(next);
  };

  // Update user locally without refetch
  const patchUserLocal = (partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const signOut = async () => {

    const refreshToken = localStorage.getItem("refreshToken");

    // Clear immediately
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");

    setUser(null);

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // ignore errors
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
      loading,
      setUserFromAuth,
      signOut,
      clearSession,
      refreshUser,
      patchUserLocal,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen text-slate-400">
          Loading session...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}