import React from "react";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 27e3f98 (Addressed all comments)
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Shield,
  LayoutGrid,
  Users,
  KeyRound,
  Settings,
  UserRound,
  ClipboardList,
  LogOut,
  Building2,
} from "lucide-react";

<<<<<<< HEAD
import { useAuth } from "../context/AuthContext";
import { useMedia } from "../hooks/useMedia";

function NavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
        active
          ? "bg-blue-600/15 text-blue-300 border border-blue-500/25"
          : "hover:bg-slate-800/60 text-slate-200 border border-transparent",
      ].join(" ")}
    >
=======
import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutGrid, Users, KeyRound, Settings, UserRound, ClipboardList, LogOut } from "lucide-react";
=======
>>>>>>> 27e3f98 (Addressed all comments)
import { useAuth } from "../context/AuthContext";
import { useMedia } from "../hooks/useMedia";

function NavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
<<<<<<< HEAD
    <Link to={to} className={["flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
      active ? "bg-blue-600/15 text-blue-300 border border-blue-500/25" : "hover:bg-slate-800/60 text-slate-200 border border-transparent"].join(" ")}>
>>>>>>> d16fa5a (Build React screens)
=======
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
        active
          ? "bg-blue-600/15 text-blue-300 border border-blue-500/25"
          : "hover:bg-slate-800/60 text-slate-200 border border-transparent",
      ].join(" ")}
    >
>>>>>>> 27e3f98 (Addressed all comments)
      <span className="text-blue-400">{icon}</span>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 27e3f98 (Addressed all comments)
function BottomIcon({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
<<<<<<< HEAD
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-2 py-2">
      <div
        className={[
          "p-2 rounded-2xl",
          active
            ? "bg-blue-600/15 border border-blue-500/25"
            : "border border-transparent",
        ].join(" ")}
      >
        <span className={active ? "text-blue-400" : "text-slate-300"}>
          {icon}
        </span>
      </div>
      <div
        className={[
          "text-[11px] font-semibold",
          active ? "text-blue-300" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </div>
=======
function BottomIcon({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
=======
>>>>>>> 27e3f98 (Addressed all comments)
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-2 py-2">
      <div
        className={[
          "p-2 rounded-2xl",
          active
            ? "bg-blue-600/15 border border-blue-500/25"
            : "border border-transparent",
        ].join(" ")}
      >
        <span className={active ? "text-blue-400" : "text-slate-300"}>
          {icon}
        </span>
      </div>
      <div
        className={[
          "text-[11px] font-semibold",
          active ? "text-blue-300" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </div>
<<<<<<< HEAD
      <div className={["text-[11px] font-semibold", active ? "text-blue-300" : "text-slate-400"].join(" ")}>{label}</div>
>>>>>>> d16fa5a (Build React screens)
=======
>>>>>>> 27e3f98 (Addressed all comments)
    </Link>
  );
}

<<<<<<< HEAD
<<<<<<< HEAD
export function AppShell() {
  const { user, signOut } = useAuth();
  const isDesktop = useMedia("(min-width: 1024px)");
  const role = user?.role ?? "USER";

  const nav: Array<{ to: string; label: string; icon: React.ReactNode }> = [
    {
      to: "/app/dashboard",
      label: "Dashboard",
      icon: <LayoutGrid size={18} />,
    },
    {
      to: "/app/users",
      label: role === "USER" ? "Directory" : "Users",
      icon: <Users size={18} />,
    },
  ];

  // MANAGER can access the manager view
  if (role === "MANAGER") {
    nav.push({
      to: "/app/manager/department",
      label: "My Department",
      icon: <Building2 size={18} />,
    });
  }

  // ADMIN: Departments admin module 
  if (role === "ADMIN") {
    nav.push({
      to: "/app/departments",
      label: "Departments",
      icon: <Building2 size={18} />,
    });

    nav.push({
      to: "/app/roles",
      label: "Roles",
      icon: <UserRound size={18} />,
    });

    nav.push({
      to: "/app/permissions",
      label: "Permissions",
      icon: <KeyRound size={18} />,
    });

    nav.push({
      to: "/app/audit",
      label: "Audit",
      icon: <ClipboardList size={18} />,
    });
  }

  nav.push({
    to: "/app/settings",
    label: "Settings",
    icon: <Settings size={18} />,
  });

  return (
    <div className="min-h-screen app-bg">
      <div className="mx-auto max-w-7xl">
        {/* Top Bar */}
=======
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, clearSession } = useAuth();
=======
export function AppShell() {
  const { user, signOut } = useAuth();
>>>>>>> 27e3f98 (Addressed all comments)
  const isDesktop = useMedia("(min-width: 1024px)");
  const role = user?.role ?? "USER";

  const nav: Array<{
    to: string;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      to: "/app/dashboard",
      label: "Dashboard",
      icon: <LayoutGrid size={18} />,
    },
    {
      to: "/app/users",
      label: role === "USER" ? "Directory" : "Users",
      icon: <Users size={18} />,
    },
  ];

  // Departments → ADMIN + MANAGER
  if (role === "ADMIN" || role === "MANAGER") {
    nav.push({
      to: "/app/departments",
      label: "Departments",
      icon: <Building2 size={18} />,
    });
  }

  // ADMIN only
  if (role === "ADMIN") {
    nav.push({
      to: "/app/roles",
      label: "Roles",
      icon: <UserRound size={18} />,
    });

    nav.push({
      to: "/app/permissions",
      label: "Permissions",
      icon: <KeyRound size={18} />,
    });

    nav.push({
      to: "/app/audit",
      label: "Audit",
      icon: <ClipboardList size={18} />,
    });
  }

  nav.push({
    to: "/app/settings",
    label: "Settings",
    icon: <Settings size={18} />,
  });

  return (
    <div className="min-h-screen app-bg">
<<<<<<< HEAD
      <div className="mx-auto max-w-6xl">
>>>>>>> d16fa5a (Build React screens)
=======
      <div className="mx-auto max-w-7xl">
        {/* Top Bar */}
>>>>>>> 27e3f98 (Addressed all comments)
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center">
              <Shield className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-lg font-bold">RBAC Manager</div>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
              <div className="text-xs text-slate-400">
                {role} Portal
              </div>
=======
              <div className="text-xs text-slate-400">{role} Portal</div>
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
            </div>
          </div>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-800/50"
          >
=======
              <div className="text-xs text-slate-400">{role} Portal</div>
            </div>
          </div>
          <button onClick={clearSession} className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-800/50">
>>>>>>> d16fa5a (Build React screens)
=======
              <div className="text-xs text-slate-400">
                {role} Portal
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-800/50"
          >
>>>>>>> 27e3f98 (Addressed all comments)
            <LogOut size={16} /> Logout
          </button>
        </div>

<<<<<<< HEAD
<<<<<<< HEAD
        {/* Layout */}
        <div className="grid grid-cols-1 gap-4 px-4 pb-24 lg:grid-cols-[260px_1fr] lg:pb-10">
          {/* Sidebar (Desktop Only) */}
          {isDesktop && (
            <aside className="glass rounded-3xl p-3 h-fit sticky top-4">
              <div className="space-y-2">
                {nav.map((n) => (
                  <NavItem key={n.to} {...n} />
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-4">
  <div className="flex items-center gap-3">
    
    {/* Avatar */}
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
      {user?.name?.charAt(0).toUpperCase() || "U"}
    </div>

    {/* User Info */}
    <div className="min-w-0">
      <div className="text-sm font-semibold text-slate-100 truncate">
        {user?.name ?? "—"}
      </div>

      <div className="text-xs text-slate-400 truncate">
        {user?.role ?? ""}
      </div>
    </div>

  </div>
</div>
            </aside>
          )}

          {/* Main Content */}
          <main className="min-h-[75vh]">
            <Outlet />
          </main>
        </div>

        {/* Bottom Navigation (Mobile Only) */}
        {!isDesktop && (
          <div className="fixed inset-x-0 bottom-0 z-40 p-3">
            <div className="mx-auto max-w-2xl glass rounded-3xl px-3 py-2">
              <div className="flex items-center justify-around">
                {nav.slice(0, 4).map((n) => (
                  <BottomIcon key={n.to} {...n} />
                ))}
              </div>
=======
=======
        {/* Layout */}
>>>>>>> 27e3f98 (Addressed all comments)
        <div className="grid grid-cols-1 gap-4 px-4 pb-24 lg:grid-cols-[260px_1fr] lg:pb-10">
          {/* Sidebar (Desktop Only) */}
          {isDesktop && (
            <aside className="glass rounded-3xl p-3 h-fit sticky top-4">
              <div className="space-y-2">
                {nav.map((n) => (
                  <NavItem key={n.to} {...n} />
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-4">
                <div className="text-sm font-semibold">
                  {user?.name ?? "—"}
                </div>
                <div className="text-xs text-slate-400">
                  {user?.email ?? ""}
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="min-h-[75vh]">
            <Outlet />
          </main>
        </div>

        {/* Bottom Navigation (Mobile Only) */}
        {!isDesktop && (
          <div className="fixed inset-x-0 bottom-0 z-40 p-3">
            <div className="mx-auto max-w-2xl glass rounded-3xl px-3 py-2">
<<<<<<< HEAD
              <div className="flex items-center justify-around">{nav.slice(0, 4).map((n) => <BottomIcon key={n.to} {...n} />)}</div>
>>>>>>> d16fa5a (Build React screens)
=======
              <div className="flex items-center justify-around">
                {nav.slice(0, 4).map((n) => (
                  <BottomIcon key={n.to} {...n} />
                ))}
              </div>
>>>>>>> 27e3f98 (Addressed all comments)
            </div>
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
<<<<<<< HEAD
}
=======
}
>>>>>>> d16fa5a (Build React screens)
=======
}
>>>>>>> 27e3f98 (Addressed all comments)
