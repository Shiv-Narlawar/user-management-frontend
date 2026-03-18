import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/rbac";

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
}: Props) {
  const { user, loading } = useAuth();

  // loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        loading...
      </div>
    );
  }

  // no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // admin bypass
  if (user.role === "ADMIN") {
    return <>{children}</>;
  }

  // role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // permission check
  if (
    requiredPermissions &&
    !requiredPermissions.every((p) =>
      user.permissions?.includes(p)
    )
  ) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}