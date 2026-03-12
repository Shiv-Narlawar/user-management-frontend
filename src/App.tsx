import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireRole } from "./routes/guards";
import { AppShell } from "./components/AppShell";

import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/admin/Roles";
import Permissions from "./pages/admin/Permissions";
import Audit from "./pages/admin/Audit";
import SettingsPage from "./pages/Settings";
import Departments from "./pages/admin/Departments";

// manager page
import MyDepartment from "./pages/manager/MyDepartment";

export default function App() {
  return (
    <Routes>

      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* ---------- PROTECTED ROUTES ---------- */}
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>

          {/* redirect /app -> dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* ---------- COMMON ---------- */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* ---------- MANAGER ---------- */}
          <Route element={<RequireRole role="MANAGER" />}>
            <Route path="my-department" element={<MyDepartment />} />
          </Route>

          {/* ---------- ADMIN ---------- */}
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="departments" element={<Departments />} />
            <Route path="audit" element={<Audit />} />
          </Route>

          {/* fallback inside /app */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />

        </Route>
      </Route>

      {/* ---------- GLOBAL FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}