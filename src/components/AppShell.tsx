import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutGrid, Users, KeyRound, Settings, UserRound, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMedia } from "../hooks/useMedia";

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link to={to} className={["flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
      active ? "bg-blue-600/15 text-blue-300 border border-blue-500/25" : "hover:bg-slate-800/60 text-slate-200 border border-transparent"].join(" ")}>
      <span className="text-blue-400">{icon}</span>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}

function BottomIcon({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-2 py-2">
      <div className={["p-2 rounded-2xl", active ? "bg-blue-600/15 border border-blue-500/25" : "border border-transparent"].join(" ")}>
        <span className={active ? "text-blue-400" : "text-slate-300"}>{icon}</span>
      </div>
      <div className={["text-[11px] font-semibold", active ? "text-blue-300" : "text-slate-400"].join(" ")}>{label}</div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, clearSession } = useAuth();
  const isDesktop = useMedia("(min-width: 1024px)");
  const role = user?.role ?? "USER";

  const nav: Array<{ to: string; label: string; icon: React.ReactNode }> = [
    { to: "/app/dashboard", label: "Dashboard", icon: <LayoutGrid size={18} /> },
    { to: "/app/users", label: role === "USER" ? "Directory" : "Users", icon: <Users size={18} /> }
  ];
  if (role === "ADMIN") {
    nav.push({ to: "/app/roles", label: "Roles", icon: <UserRound size={18} /> });
    nav.push({ to: "/app/permissions", label: "Permissions", icon: <KeyRound size={18} /> });
    nav.push({ to: "/app/audit", label: "Audit", icon: <ClipboardList size={18} /> });
  }
  nav.push({ to: "/app/settings", label: "Settings", icon: <Settings size={18} /> });

  return (
    <div className="min-h-screen app-bg">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center">
              <Shield className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-lg font-bold">RBAC Manager</div>
              <div className="text-xs text-slate-400">{role} Portal</div>
            </div>
          </div>
          <button onClick={clearSession} className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-800/50">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 pb-24 lg:grid-cols-[260px_1fr] lg:pb-10">
          {isDesktop && (
            <aside className="glass rounded-3xl p-3 h-fit sticky top-4">
              <div className="space-y-2">{nav.map((n) => <NavItem key={n.to} {...n} />)}</div>
              <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-4">
                <div className="text-sm font-semibold">{user?.name ?? "—"}</div>
                <div className="text-xs text-slate-400">{user?.email ?? ""}</div>
              </div>
            </aside>
          )}
          <main className="min-h-[70vh]">{children}</main>
        </div>

        {!isDesktop && (
          <div className="fixed inset-x-0 bottom-0 z-40 p-3">
            <div className="mx-auto max-w-2xl glass rounded-3xl px-3 py-2">
              <div className="flex items-center justify-around">{nav.slice(0, 4).map((n) => <BottomIcon key={n.to} {...n} />)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
