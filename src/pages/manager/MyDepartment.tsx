import { useEffect, useMemo, useState } from "react";
import { Building2, Search, UserMinus, UserPlus } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
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

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CombinedRow = UserRow & {
  assignment: "ASSIGNED" | "UNASSIGNED";
};

type Filter = "ALL" | "ASSIGNED" | "UNASSIGNED";

function norm(s: string) {
  return s.trim().toLowerCase();
}

function FilterPill({
  active,
  label,
  onClick,
  count,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold border transition",
        active
          ? "bg-blue-600/15 text-blue-200 border-blue-500/25"
          : "bg-slate-900/30 text-slate-300 border-slate-800 hover:bg-slate-900/50",
      ].join(" ")}
    >
      <span>{label}</span>
      <span
        className={[
          "text-[11px] px-2 py-[2px] rounded-xl border",
          active
            ? "border-blue-500/25 bg-blue-600/10 text-blue-200"
            : "border-slate-800 bg-slate-900/20 text-slate-300",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

export default function MyDepartment() {
  const { user } = useAuth();

  const [department, setDepartment] = useState<Department | null>(null);

  // backend lists
  const [deptUsers, setDeptUsers] = useState<UserRow[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<UserRow[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [deptRes, usersRes, unassignedRes] = await Promise.all([
        apiFetch<{ data: Department[] }>("/departments"),
        apiFetch<PaginatedResponse<UserRow>>("/users"),
        apiFetch<{ data: UserRow[] }>("/users/unassigned"),
      ]);

      const departments = deptRes.data ?? [];
      const myDept = departments.find((d) => d.managerId === user?.id) ?? null;

      setDepartment(myDept);
      setDeptUsers(usersRes.data ?? []);
      setUnassignedUsers(unassignedRes.data ?? []);
    } catch (err: unknown) {
      console.error("Failed loading department", err);
      setDepartment(null);
      setDeptUsers([]);
      setUnassignedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const rows: CombinedRow[] = useMemo(() => {
    const assigned = deptUsers.map<CombinedRow>((u) => ({ ...u, assignment: "ASSIGNED" }));
    const unassigned = unassignedUsers.map<CombinedRow>((u) => ({ ...u, assignment: "UNASSIGNED" }));

    const seen = new Set<string>();
    const merged: CombinedRow[] = [];

    for (const r of [...assigned, ...unassigned]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      merged.push(r);
    }

    merged.sort((a, b) => {
      if (a.assignment !== b.assignment) return a.assignment === "UNASSIGNED" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return merged;
  }, [deptUsers, unassignedUsers]);

  const counts = useMemo(() => {
    const assigned = rows.filter((r) => r.assignment === "ASSIGNED").length;
    const unassigned = rows.filter((r) => r.assignment === "UNASSIGNED").length;
    return { all: rows.length, assigned, unassigned };
  }, [rows]);

  const filtered = useMemo(() => {
    const query = norm(q);

    const byFilter = rows.filter((u) => {
      if (filter === "ALL") return true;
      return u.assignment === filter;
    });

    if (!query) return byFilter;

    return byFilter.filter((u) => {
      const hay = `${u.name} ${u.email}`.toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q, filter]);

  const assignUser = async (userId: string): Promise<void> => {
    if (!department) return;

    setBusyId(userId);
    try {
      await apiFetch(`/departments/${department.id}/assign-user`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      await fetchData();
    } catch (err: unknown) {
      console.error("Assign failed", err);
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (userId: string): Promise<void> => {
    if (!department) return;

    setBusyId(userId);
    try {
      await apiFetch(`/departments/${department.id}/remove-user/${userId}`, {
        method: "DELETE",
      });

      await fetchData();
    } catch (err: unknown) {
      console.error("Remove failed", err);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-slate-400">Loading department…</div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-lg font-bold">No Department Assigned</div>
        <div className="text-sm text-slate-400 mt-2">
          You are not assigned as manager to any department.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">MANAGER</div>
            <div className="text-4xl font-extrabold mt-2 flex items-center gap-3">
              <Building2 size={22} />
              {department.name}
            </div>
            <div className="text-slate-400 mt-2">Manage department membership.</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={16} />
              </span>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search user by name/email..."
                className="w-80 pl-10"
              />
            </div>

            <Button variant="ghost" onClick={() => setQ("")} disabled={!q}>
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterPill
            active={filter === "ALL"}
            label="All"
            count={counts.all}
            onClick={() => setFilter("ALL")}
          />
          <FilterPill
            active={filter === "ASSIGNED"}
            label="Assigned"
            count={counts.assigned}
            onClick={() => setFilter("ASSIGNED")}
          />
          <FilterPill
            active={filter === "UNASSIGNED"}
            label="Unassigned"
            count={counts.unassigned}
            onClick={() => setFilter("UNASSIGNED")}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-left text-slate-300">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Assignment</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => {
              const assigned = u.assignment === "ASSIGNED";
              const busy = busyId === u.id;

              return (
                <tr
                  key={u.id}
                  className="border-t border-slate-800 hover:bg-slate-900/25 transition"
                >
                  <td className="px-6 py-4 font-semibold">{u.name}</td>
                  <td className="px-6 py-4 text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 text-slate-300">{u.roleName}</td>

                  <td className="px-6 py-4">
                    <span
                      className={[
                        "inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-semibold",
                        assigned
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                          : "border-slate-700 bg-slate-900/30 text-slate-200",
                      ].join(" ")}
                    >
                      {assigned ? "Assigned" : "Unassigned"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {assigned ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeUser(u.id)}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition",
                          busy
                            ? "bg-red-600/10 text-red-300 border border-red-500/15 opacity-70 cursor-not-allowed"
                            : "bg-red-600/20 text-red-400 hover:bg-red-600/30",
                        ].join(" ")}
                      >
                        <UserMinus size={14} />
                        {busy ? "Removing…" : "Remove"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void assignUser(u.id)}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition",
                          busy
                            ? "bg-blue-600/10 text-blue-200 border border-blue-500/15 opacity-70 cursor-not-allowed"
                            : "bg-blue-600/20 text-blue-300 hover:bg-blue-600/30",
                        ].join(" ")}
                      >
                        <UserPlus size={14} />
                        {busy ? "Assigning…" : "Assign"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}