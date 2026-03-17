import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/rbac";

// Protects routes that require authentication
 
export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Protects routes that require a specific role
 
export function RequireRole({ role }: { role: Role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin can access everything
  if (user.role === "ADMIN") {
    return <Outlet />;
  }

  if (user.role === "ADMIN") {
    return <Outlet />;
  }

  // normal role check
  if (user.role !== role) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}