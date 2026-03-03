import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireRole } from "./ProtectedRoute";
import { AppShell } from "../layout/AppShell";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Departments from "../pages/Departments";
import Roles from "../pages/admin/Roles";
import Permissions from "../pages/admin/Permissions";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/app/*"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}