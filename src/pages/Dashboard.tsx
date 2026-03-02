import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Users, Clock4 } from "lucide-react";
import { fetchDashboardStats } from "../services/dashboard.service";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  managers: number;
  admins: number;
  users: number;
}

function Stat({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-2 text-4xl font-extrabold">{value}</div>
          {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
        </div>
        <div className="h-12 w-12 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role ?? "USER";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const heading =
    role === "ADMIN"
      ? "Admin Portal"
      : role === "MANAGER"
      ? "Manager Portal"
      : "RBAC Viewer Mode";

  const sub =
    role === "ADMIN"
      ? "Overview"
      : role === "MANAGER"
      ? "Team Overview"
      : "Colleague Directory";

  return (
    <div className="space-y-5">
      <div className="glass rounded-3xl p-6">
        <div className="text-blue-300 text-sm font-semibold tracking-widest">
          {heading.toUpperCase()}
        </div>
        <div className="text-4xl font-extrabold mt-2">{sub}</div>
        <div className="text-slate-400 mt-2 max-w-2xl">
          Role-based access: Admin (full), Manager (view+update), User (view only).
          Dashboard reflects real database data.
        </div>
      </div>

      {loading && <div className="text-slate-400">Loading dashboard...</div>}

      {!loading && stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat
            label="Total Users"
            value={stats.totalUsers}
            icon={<Users size={20} />}
            hint="All registered users"
          />

          <Stat
            label="Active Users"
            value={stats.activeUsers}
            icon={<Clock4 size={20} />}
            hint="Currently active accounts"
          />

          <Stat
            label="Managers"
            value={stats.managers}
            icon={<BarChart3 size={20} />}
            hint="Users with manager role"
          />
        </div>
      )}
    </div>
  );
}