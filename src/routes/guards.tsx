import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/rbac";


 // Protects routes that require authentication
 
export function RequireAuth() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Protects routes that require a specific role
 
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
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