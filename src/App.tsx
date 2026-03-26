import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireRole } from "./routes/guards";
import { AppShell } from "./components/AppShell";
import AuthRedirect from "./components/auth/AuthRedirect";

import { useAuth } from "./context/AuthContext";

import Landing from "./pages/auth/Landing";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/admin/Roles";
import Permissions from "./pages/admin/Permissions";
import Audit from "./pages/admin/Audit";
import SettingsPage from "./pages/Settings";
import Departments from "./pages/admin/Departments";

// manager
import MyDepartment from "./pages/manager/MyDepartment";

export default function App() {
  const { user, loading } = useAuth();

  // loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* public */}

      <Route
        path="/"
        element={
          user ? (
            user.role === "ADMIN" ? (
              <Navigate to="/app/dashboard" replace />
            ) : user.role === "MANAGER" ? (
              <Navigate to="/app/my-department" replace />
            ) : (
              <Navigate to="/app/users" replace />
            )
          ) : (
            <Landing />
          )
        }
      />

      <Route path="/login" element={<AuthRedirect returnTo="/app" />} />

      {/* protected */}

      <Route element={<RequireAuth />}>

        <Route path="/app" element={<AppShell />}>
          {/* redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* common */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* manager */}
          <Route element={<RequireRole role="MANAGER" />}>
            <Route path="my-department" element={<MyDepartment />} />
          </Route>

          {/* admin */}
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="departments" element={<Departments />} />
            <Route path="audit" element={<Audit />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

      </Route>

      {/* global*/}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
