<<<<<<< HEAD
<<<<<<< HEAD
=======
import React from "react";
>>>>>>> d16fa5a (Build React screens)
=======
>>>>>>> 27e3f98 (Addressed all comments)
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireRole } from "./routes/guards";
import { AppShell } from "./components/AppShell";

import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
<<<<<<< HEAD
<<<<<<< HEAD
import ResetPassword from "./pages/auth/ResetPassword";
<<<<<<< HEAD
=======
>>>>>>> d16fa5a (Build React screens)
=======
import ResetPassword from "./pages/auth/ResetPassword";
>>>>>>> 27e3f98 (Addressed all comments)
import ForgotUsername from "./pages/auth/ForgotUsername";
=======
import UpdatePassword from "./pages/auth/UpdatePassword";
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/admin/Roles";
import Permissions from "./pages/admin/Permissions";
import Audit from "./pages/admin/Audit";
import SettingsPage from "./pages/Settings";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import Departments from "./pages/Departments";
=======
>>>>>>> d16fa5a (Build React screens)
=======
import Departments from "./pages/Departments";
>>>>>>> 27e3f98 (Addressed all comments)
=======
import Departments from "./pages/admin/Departments";

// manager page
import MyDepartment from "./pages/manager/MyDepartment";
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)

export default function App() {
  return (
    <Routes>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      {/* Public Routes */}
=======
>>>>>>> d16fa5a (Build React screens)
=======
      {/* Public Routes */}
>>>>>>> 27e3f98 (Addressed all comments)
=======
      {/* ---------- PUBLIC ROUTES ---------- */}
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
<<<<<<< HEAD
<<<<<<< HEAD
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* ---------- PROTECTED ROUTES ---------- */}
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* common */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* MANAGER ONLY */}
          <Route element={<RequireRole role="MANAGER" />}>
            <Route path="manager/department" element={<MyDepartment />} />
          </Route>
          
          {/* ADMIN ONLY */}
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="departments" element={<Departments />} />
            <Route path="audit" element={<Audit />} />
          </Route>

          {/* fallback inside /app */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
=======
=======
      <Route path="/reset-password" element={<ResetPassword />} />
>>>>>>> 27e3f98 (Addressed all comments)
      <Route path="/forgot-username" element={<ForgotUsername />} />

      {/* Protected Layout */}
      <Route element={<RequireAuth />}>
<<<<<<< HEAD
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
>>>>>>> d16fa5a (Build React screens)
=======
        <Route path="/app" element={<AppShell />}>
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="departments" element={<Departments />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* ADMIN ONLY */}
          <Route element={<RequireRole allow={["ADMIN"]} />}>
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="audit" element={<Audit />} />
          </Route>

          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
>>>>>>> 27e3f98 (Addressed all comments)
      </Route>

      {/* ---------- CATCH ALL ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}