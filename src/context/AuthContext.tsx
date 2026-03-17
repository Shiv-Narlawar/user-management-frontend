import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import type { AuthUser } from "../services/auth.service";
import { getCurrentUser } from "../services/auth.service";

import { useAuth0 } from "@auth0/auth0-react";
import { setAuth0TokenGetter } from "../lib/auth0Token";

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
  const {
    getAccessTokenSilently,
    logout,
    isAuthenticated,
    isLoading: auth0Loading,
  } = useAuth0();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     REGISTER AUTH0 TOKEN GETTER
  ===================================================== */

  useEffect(() => {
    setAuth0TokenGetter(async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://user-management-api",
        },
      });

      return token;
    });
  }, [getAccessTokenSilently]);

  /* =====================================================
     LOAD USER FROM BACKEND
  ===================================================== */

  const refreshUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();

      if (!current) {
        setUser(null);
        return;
      }

      setUser(current);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    }
  }, []);

  /* =====================================================
     BOOTSTRAP AUTH SESSION
  ===================================================== */

  useEffect(() => {
    if (auth0Loading) return;

    const bootstrap = async () => {
      try {
        const localToken = localStorage.getItem("accessToken");

        if (isAuthenticated) {
          // 🔥 Ensure Auth0 token exists before calling backend
          await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://user-management-api",
            },
          });

          await refreshUser();
        } else if (localToken) {
          await refreshUser();
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [isAuthenticated, auth0Loading, refreshUser, getAccessTokenSilently]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const setUserFromAuth = useCallback((next: AuthUser | null) => {
    setUser(next);
  }, []);

  const patchUserLocal = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const signOut = useCallback(async () => {
    localStorage.clear();
    setUser(null);

    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  const clearSession = useCallback(async () => {
    await signOut();
  }, [signOut]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

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
    [
      user,
      loading,
      setUserFromAuth,
      signOut,
      clearSession,
      refreshUser,
      patchUserLocal,
    ]
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