
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import{ useAuth } from "../context/AuthContext";

import type { UserRow } from "../types/rbac";
import type { Role} from "../types/rbac";
import type { Status } from "../types/rbac";
import { fetchUsers } from "../services/users.service";
import { updateUser } from "../services/users.service";
import { softDeleteUser } from "../services/users.service";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import { Input } from "../components/ui/Input";

type SortKey = "name" | "role" | "status";

const ROLES: Array<Role | "ALL"> = ["ALL", "ADMIN", "MANAGER", "USER"];
const STATUSES: Array<Status | "ALL"> = ["ALL", "ACTIVE", "INACTIVE", "PENDING", "OFFLINE"];

function can(userRole: Role, action: "view" | "update" | "delete") {
  if (userRole === "ADMIN") return true;
  if (userRole === "MANAGER") return action === "view" || action === "update";
  return action === "view";
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/40 px-2 py-1 text-[11px] font-semibold text-slate-200">
      {children}
    </span>
  );
}

export default function Users() {
  const { user, signOut } = useAuth();
  const role = (user?.role ?? "USER") as Role;

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 450);

  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // edit modal-ish inline
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<Role>("USER");
  const [editStatus, setEditStatus] = useState<Status>("ACTIVE");
  const [saving, setSaving] = useState(false);

  const allowView = can(role, "view");
  const allowUpdate = can(role, "update");
  const allowDelete = can(role, "delete");

  useEffect(() => {
    if (!allowView) return;

    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers({
          search: dq.trim() || undefined,
          role: roleFilter,
          status: statusFilter,
          sort: sortKey,
          order,
        });
        if (mounted) setRows(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load users";
        // if backend says unauthorized, sign out
        if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("invalid token")) {
          await signOut();
          return;
        }
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [allowView, dq, roleFilter, statusFilter, sortKey, order, signOut]);

  const total = useMemo(() => rows.length, [rows]);

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditStatus(u.status);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName("");
    setEditRole("USER");
    setEditStatus("ACTIVE");
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!allowUpdate) return;

    setSaving(true);
    try {
      await updateUser(editing.id, {
        name: editName.trim(),
        role: role === "ADMIN" ? editRole : undefined, // only admin can change roles
        status: editStatus,
      });

      // reload list after update
      const data = await fetchUsers({
        search: dq.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        sort: sortKey,
        order,
      });
      setRows(data);
      closeEdit();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update user";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (u: UserRow) => {
    if (!allowDelete) return;
    const ok = window.confirm(`Soft delete ${u.email}?`);
    if (!ok) return;

    try {
      await softDeleteUser(u.id);

      const data = await fetchUsers({
        search: dq.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        sort: sortKey,
        order,
      });
      setRows(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete user";
      setError(msg);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setOrder("asc");
      return;
    }
    setOrder((o) => (o === "asc" ? "desc" : "asc"));
  };

  if (!allowView) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-xl font-bold">Users</div>
        <div className="mt-2 text-slate-400">You don’t have permission to view users.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-2xl font-extrabold">{role === "USER" ? "Directory" : "Users"}</div>
            <div className="mt-1 text-sm text-slate-400">
              Total results: <span className="text-slate-200 font-semibold">{total}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email…"
              className="w-full md:w-72"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  Role: {r}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
                setSortKey("name");
                setOrder("asc");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-3xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 border-b border-slate-800">
              <tr className="text-slate-300">
                <th className="px-4 py-3">
                  <button className="font-semibold hover:text-white" onClick={() => toggleSort("name")}>
                    Name {sortKey === "name" ? (order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">
                  <button className="font-semibold hover:text-white" onClick={() => toggleSort("role")}>
                    Role {sortKey === "role" ? (order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button className="font-semibold hover:text-white" onClick={() => toggleSort("status")}>
                    Status {sortKey === "status" ? (order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/70 hover:bg-slate-900/25">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{u.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => openEdit(u)} disabled={!allowUpdate}>
                          {allowUpdate ? "Edit" : "View"}
                        </Button>
                        <Button variant="danger" onClick={() => onDelete(u)} disabled={!allowDelete}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit drawer/modal (simple inline) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
          <div className="glass w-full max-w-lg rounded-3xl border border-slate-800 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-extrabold">{allowUpdate ? "Edit User" : "View User"}</div>
                <div className="text-xs text-slate-400 mt-1">{editing.email}</div>
              </div>
              <Button variant="ghost" onClick={closeEdit}>
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Name</div>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!allowUpdate} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Role</div>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    disabled={!allowUpdate || role !== "ADMIN"}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none disabled:opacity-60"
                  >
                    {(["ADMIN", "MANAGER", "USER"] as Role[]).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {role !== "ADMIN" && (
                    <div className="mt-1 text-[11px] text-slate-500">Only Admin can change roles.</div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Status</div>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Status)}
                    disabled={!allowUpdate}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none disabled:opacity-60"
                  >
                    {(["ACTIVE", "INACTIVE", "PENDING", "OFFLINE"] as Status[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={closeEdit}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={!allowUpdate || saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}