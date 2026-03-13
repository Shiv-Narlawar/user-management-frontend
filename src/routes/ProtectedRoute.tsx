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

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading session...
      </div>
    );
  }

  // Not logged in
   
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based protection
   
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Permission-based protection
   
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