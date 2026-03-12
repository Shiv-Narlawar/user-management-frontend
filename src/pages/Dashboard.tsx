import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { Users, ShieldCheck, Shield, UserCheck, UserX } from "lucide-react";
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
    <Card className="p-6 hover:scale-[1.01] transition-transform duration-200">
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
    let mounted = true;

    async function loadStats() {
      try {
        const data = await fetchDashboardStats();
        if (!mounted) return;
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
        if (!mounted) return;
        setStats(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const heading =
    role === "ADMIN" ? "Admin Portal" : role === "MANAGER" ? "Manager Portal" : "User Portal";

  const sub =
    role === "ADMIN" ? "System Overview" : role === "MANAGER" ? "Department Overview" : "Your Workspace";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6">
        <div className="text-blue-300 text-sm font-semibold tracking-widest">
          {heading.toUpperCase()}
        </div>
        <div className="text-4xl font-extrabold mt-2">{sub}</div>
        <div className="text-slate-400 mt-2 max-w-2xl">
          Dashboard reflects live database metrics.
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 w-32 bg-slate-800 rounded mb-4"></div>
              <div className="h-10 w-20 bg-slate-800 rounded"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Everyone */}
          <Stat
            label="Total Users"
            value={stats.totalUsers}
            icon={<Users size={20} />}
            hint=""
          />

          <Stat
            label="Active Users"
            value={stats.activeUsers}
            icon={<UserCheck size={20} />}
            hint=""
          />

          <Stat
            label="Inactive Users"
            value={stats.inactiveUsers}
            icon={<UserX size={20} />}
            hint=""
          />

          {/* Manager + Admin */}
          {(role === "ADMIN") && (
            <Stat
              label="Users (Role)"
              value={stats.users}
              icon={<Users size={20} />}
              hint=""
            />
          )}

          {/* Admin only */}
          {role === "ADMIN" && (
            <Stat
              label="Managers"
              value={stats.managers}
              icon={<ShieldCheck size={20} />}
              hint=""
            />
          )}

          {role === "ADMIN" && (
            <Stat
              label="Admins"
              value={stats.admins}
              icon={<Shield size={20} />}
              hint=""
            />
          )}
        </div>
      )}

      {!loading && !stats && (
        <Card className="p-6 text-slate-400">No dashboard data available.</Card>
      )}
    </div>
  );
}