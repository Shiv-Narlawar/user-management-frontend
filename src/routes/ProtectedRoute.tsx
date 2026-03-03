import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
}: Props) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based protection
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Permission-based protection (JWT permissions array)
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