import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/rbac";
import LoginPage from "../pages/auth/Login";

// auth
export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage returnTo={window.location.pathname} />;
  }

  return <Outlet />;
}

// role
export function RequireRole({ role }: { role: Role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage returnTo={window.location.pathname} />;
  }

  // admin bypass
  if (user.role === "ADMIN") {
    return <Outlet />;
  }

  // role check
  if (user.role !== role) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
