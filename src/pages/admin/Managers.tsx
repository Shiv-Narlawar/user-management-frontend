import { useEffect, useState } from "react";
import { UserRound, ShieldCheck, ShieldOff } from "lucide-react";
import api from "../../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
}

export default function Managers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id: string, roleName: string) => {
    try {
      await api.put(`/users/${id}`, { roleName });
      fetchUsers();
    } catch (err) {
      console.error("Role update failed", err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const managers = users.filter((u) => u.roleName === "MANAGER");
  const normalUsers = users.filter((u) => u.roleName === "USER");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="text-xl font-bold flex items-center gap-2">
          <UserRound size={20} /> Managers
        </div>
        <div className="text-sm text-slate-400">
          Manage department leaders
        </div>
      </div>

      {/* Current Managers */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="px-6 py-4 font-semibold border-b border-slate-800">
          Current Managers
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left text-slate-400">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((user) => (
              <tr
                key={user.id}
                className="border-t border-slate-800 hover:bg-slate-800/40 transition"
              >
                <td className="px-6 py-4 font-semibold">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => updateRole(user.id, "USER")}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                  >
                    <ShieldOff size={14} /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promote Users */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="px-6 py-4 font-semibold border-b border-slate-800">
          Promote to Manager
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left text-slate-400">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {normalUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t border-slate-800 hover:bg-slate-800/40 transition"
              >
                <td className="px-6 py-4 font-semibold">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => updateRole(user.id, "MANAGER")}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
                  >
                    <ShieldCheck size={14} /> Promote
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}