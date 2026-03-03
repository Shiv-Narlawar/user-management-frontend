import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { AuthUser } from "../services/auth.service";
import {
  logout as logoutApi,
  getCurrentUser,
} from "../services/auth.service";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setUserFromAuth: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ BOOTSTRAP ON APP LOAD
  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser(); // calls /auth/me
        setUser(res.user);
      } catch {
        // token invalid → clear session
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const setUserFromAuth = (next: AuthUser | null) => {
    setUser(next);
  };

  const signOut = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    // Clear immediately (fast UX)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // ignore backend revoke errors
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
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}