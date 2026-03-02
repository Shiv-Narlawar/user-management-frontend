import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireRole } from "./routes/guards";
import { AppShell } from "./components/AppShell";

import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ForgotUsername from "./pages/auth/ForgotUsername";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/admin/Roles";
import Permissions from "./pages/admin/Permissions";
import Audit from "./pages/admin/Audit";
import SettingsPage from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-username" element={<ForgotUsername />} />

      <Route element={<RequireAuth />}>
        <Route path="/app/*" element={
          <AppShell>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route element={<RequireRole role="ADMIN" />}>
                <Route path="roles" element={<Roles />} />
                <Route path="permissions" element={<Permissions />} />
                <Route path="audit" element={<Audit />} />
              </Route>
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppShell>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
