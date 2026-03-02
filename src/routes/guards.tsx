import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen app-bg flex items-center justify-center text-slate-300">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
export function RequireRole({ role }: { role: "ADMIN" | "MANAGER" | "USER" }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/app/dashboard" replace />;
  return <Outlet />;
}
