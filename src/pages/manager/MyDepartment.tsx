import { useEffect, useMemo, useState } from "react";
import { Building2, Search, UserMinus, UserPlus } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

interface Department {
  id: string;
  name: string;
  managerId: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  roleName: string;
  departmentId?: string | null;
}

type CombinedRow = UserRow & {
  assignment: "ASSIGNED" | "UNASSIGNED";
};

type Filter = "ALL" | "ASSIGNED" | "UNASSIGNED";

function norm(s: string) {
  return s.trim().toLowerCase();
}

export default function MyDepartment() {
  const { user } = useAuth();
  const { push } = useToast();

  const [department, setDepartment] = useState<Department | null>(null);
  const [deptUsers, setDeptUsers] = useState<UserRow[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<UserRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    setLoading(true);

    try {
      const [deptRes, usersRes, unassignedRes] = await Promise.all([
        apiFetch<{ data: Department[] }>("/departments"),
        apiFetch<{ data: UserRow[] }>("/users"),
        apiFetch<{ data: UserRow[] }>("/users/unassigned"),
      ]);

      const departments = deptRes.data ?? [];

      const myDept =
        departments.find((d) => d.managerId === user?.id) ?? null;

      setDepartment(myDept);

      const allUsers = usersRes.data ?? [];

      // Only users belonging to manager's department
      const deptUsersFiltered = allUsers.filter(
        (u) => u.departmentId === myDept?.id
      );

      setDeptUsers(deptUsersFiltered);
      setUnassignedUsers(unassignedRes.data ?? []);

    } catch (err) {
      console.error("Failed loading department", err);
      push("error", "Failed to load department");
      setDepartment(null);
      setDeptUsers([]);
      setUnassignedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- MERGE USERS ----------------
  const rows: CombinedRow[] = useMemo(() => {
    const assigned = deptUsers.map((u) => ({
      ...u,
      assignment: "ASSIGNED" as const,
    }));

    const unassigned = unassignedUsers.map((u) => ({
      ...u,
      assignment: "UNASSIGNED" as const,
    }));

    const seen = new Set<string>();

    return [...assigned, ...unassigned].filter((u) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }, [deptUsers, unassignedUsers]);

  // ---------------- COUNTS ----------------
  const counts = useMemo(() => {
    return {
      all: rows.length,
      assigned: rows.filter((u) => u.assignment === "ASSIGNED").length,
      unassigned: rows.filter((u) => u.assignment === "UNASSIGNED").length,
    };
  }, [rows]);

  // ---------------- SEARCH + FILTER ----------------
  const filtered = useMemo(() => {
    const query = norm(q);

    const byFilter = rows.filter((u) => {
      if (filter === "ALL") return true;
      return u.assignment === filter;
    });

    if (!query) return byFilter;

    return byFilter.filter((u) => {
      const hay = `${u.name} ${u.email} ${u.roleName}`.toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q, filter]);

  // ---------------- ASSIGN USER ----------------
  const assignUser = async (userId: string) => {
    if (!department) return;

    setBusyId(userId);

    try {
      await apiFetch(`/departments/${department.id}/assign-user`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      await fetchData();
      push("success", "User assigned to department");
    } catch (err) {
      console.error("Assign failed", err);
      push("error", err instanceof Error ? err.message : "Failed to assign user");
    } finally {
      setBusyId(null);
    }
  };

  // ---------------- REMOVE USER ----------------
  const removeUser = async (userId: string) => {
    if (!department) return;

    setBusyId(userId);

    try {
      await apiFetch(`/departments/${department.id}/remove-user/${userId}`, {
        method: "DELETE",
      });

      await fetchData();
      push("success", "User removed from department");
    } catch (err) {
      console.error("Remove failed", err);
      push("error", err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setBusyId(null);
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-slate-400">Loading department…</div>
      </Card>
    );
  }

  if (!department) {
    return (
      <Card className="p-6">
        <div className="text-lg font-bold">No Department Assigned</div>
        <div className="text-sm text-slate-400 mt-2">
          You are not assigned as manager to any department.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <Card className="p-6">
        <div className="flex justify-between items-end gap-4">

          <div>
            <div className="text-blue-300 text-sm font-semibold">
              MANAGER
            </div>

            <div className="text-4xl font-extrabold mt-2 flex items-center gap-3">
              <Building2 size={22} />
              {department.name}
            </div>

            <div className="text-slate-400 mt-2">
              Manage department membership
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-500"
            />

            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search user..."
              className="pl-10 w-72"
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-4 flex gap-2">

          <Button
            variant={filter === "ALL" ? "default" : "ghost"}
            onClick={() => setFilter("ALL")}
          >
            All ({counts.all})
          </Button>

          <Button
            variant={filter === "ASSIGNED" ? "default" : "ghost"}
            onClick={() => setFilter("ASSIGNED")}
          >
            Assigned ({counts.assigned})
          </Button>

          <Button
            variant={filter === "UNASSIGNED" ? "default" : "ghost"}
            onClick={() => setFilter("UNASSIGNED")}
          >
            Unassigned ({counts.unassigned})
          </Button>

        </div>
      </Card>

      {/* USERS TABLE */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">

          <thead className="border-b border-slate-800">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Assignment</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => {
              const assigned = u.assignment === "ASSIGNED";
              const busy = busyId === u.id;

              return (
                <tr key={u.id} className="border-t border-slate-800">

                  <td className="px-6 py-4 font-semibold">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.roleName}</td>

                  <td className="px-6 py-4">
                    {assigned ? "Assigned" : "Unassigned"}
                  </td>

                  <td className="px-6 py-4 text-right">

                    {assigned ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => removeUser(u.id)}
                      >
                        <UserMinus size={14} />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => assignUser(u.id)}
                      >
                        <UserPlus size={14} />
                        Assign
                      </Button>
                    )}

                  </td>

                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-slate-400"
                >
                  No users found
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </Card>

    </div>
  );
}
