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
import { ApiFetchError } from "../lib/apiFetch";

import { useAuth0 } from "@auth0/auth0-react";
import { setAuth0TokenGetter } from "../lib/auth0Token";
import { useToast } from "./ToastContext";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const { push } = useToast();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuth0TokenGetter(async () => {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://user-management-api",
        },
      });
    });
  }, [getAccessTokenSilently]);

  const refreshUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser(current ?? null);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);

      if (err instanceof ApiFetchError && err.status === 403) {
        if (err.message === "Account inactive") {
          push(
            "error",
            "Your account is inactive. Please contact your administrator."
          );
          return;
        }

        push("error", err.message);
      }
    }
  }, [push]);

  useEffect(() => {
    if (auth0Loading) return;

    const init = async () => {
      try {
        if (isAuthenticated) {
          await refreshUser();
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isAuthenticated, auth0Loading, refreshUser]);

  const patchUserLocal = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);

    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);


  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      refreshUser,
      signOut,
      patchUserLocal,
    }),
    [user, loading, isAuthenticated, refreshUser, signOut, patchUserLocal]
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
