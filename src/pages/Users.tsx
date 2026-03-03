<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
=======
import { useMemo, useState } from "react";
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import type { Role, Status } from "../types/rbac";
import type { UserRow } from "../services/users.api";
import {
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from "../hooks/queries/useUsers";
import { useDepartmentsQuery } from "../hooks/queries/useDepartments";

const LIMIT = 10;

type DepartmentOption = {
  id: string;
  name: string;
  managerId?: string | null;
};

export default function Users() {
  const { user } = useAuth();
  const role: Role = user?.role ?? "USER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const allowUpdate = isAdmin || isManager;
  const allowDelete = isAdmin;

  const [q, setQ] = useState<string>("");
  const dq = useDebounce(q, 400);

  const [page, setPage] = useState<number>(1);

  const usersQuery = useUsersQuery({ search: dq ?? "", page, limit: LIMIT });
  const departmentsQuery = useDepartmentsQuery();

  const updateStatus = useUpdateUserStatusMutation();
  const delUser = useDeleteUserMutation();

  const data = usersQuery.data;
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const departments: DepartmentOption[] = departmentsQuery.data?.data ?? [];

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("ACTIVE");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");

  function openEdit(u: UserRow) {
    setEditing(u);
    setEditStatus(u.status ?? "ACTIVE");
    setEditDepartmentId(u.departmentId ?? "");
    setEditOpen(true);
  }

<<<<<<< HEAD
        setRows(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      } catch {
        if (!mounted) return;
        setError("Failed to load users");
=======

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
>>>>>>> d16fa5a (Build React screens)
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
<<<<<<< HEAD
  }, [dq, page]);
=======
  function closeEdit() {
    if (updateStatus.isPending) return;
    setEditOpen(false);
    setEditing(null);
    setEditDepartmentId("");
    setEditStatus("ACTIVE");
  }

  async function saveEdit(): Promise<void> {
    if (!allowUpdate || !editing) return;

    const payload: {
      id: string;
      status: Status;
      departmentId?: string;
    } = {
      id: editing.id,
      status: editStatus,
    };

    if (isAdmin) {
      payload.departmentId = editDepartmentId || undefined;
    }

    await updateStatus.mutateAsync(payload);
    closeEdit();
  }
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)

  async function onDelete(id: string): Promise<void> {
    if (!allowDelete) return;

    const ok = window.confirm("Soft delete this user?");
    if (!ok) return;

    await delUser.mutateAsync(id);

    if (rows.length === 1 && page > 1) {
      setPage((p) => p - 1);
    }
  }

  const start = useMemo(
    () => (total === 0 ? 0 : (page - 1) * LIMIT + 1),
    [page, total]
  );

  const end = useMemo(() => Math.min(page * LIMIT, total), [page, total]);

  const title = role === "USER" ? "My Department Directory" : "Users";
  const subtitle =
    role === "USER"
      ? "You can only view users in your department."
      : `Showing ${start} – ${end} of ${total}`;

  const selectedDepartmentName =
    departments.find((d) => d.id === editDepartmentId)?.name ?? "Unassigned";

  const errorMessage =
    (usersQuery.isError ? (usersQuery.error as Error | null)?.message : null) ||
    (departmentsQuery.isError
      ? (departmentsQuery.error as Error | null)?.message
      : null) ||
    (updateStatus.isError
      ? (updateStatus.error as Error | null)?.message
      : null) ||
    (delUser.isError ? (delUser.error as Error | null)?.message : null) ||
    null;

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold text-slate-100">
              {title}
            </div>
            <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
          </div>

          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email..."
            className="w-full md:w-72"
          />
        </div>
      </Card>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
<<<<<<< HEAD
=======
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
>>>>>>> d16fa5a (Build React screens)
          {error}
        </div>
      )}

<<<<<<< HEAD
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
=======
          {errorMessage}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/40">
              <tr className="text-slate-300">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)

            <tbody>
              {usersQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800 hover:bg-slate-900/25"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{u.email}</td>
                    <td className="px-6 py-4 text-slate-200">{u.roleName}</td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          u.status === "ACTIVE"
                            ? "rounded-xl border border-green-600/30 bg-green-600/20 px-2 py-1 text-xs text-green-400"
                            : "rounded-xl border border-red-600/30 bg-red-600/20 px-2 py-1 text-xs text-red-400"
                        }
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="space-x-2 px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        disabled={!allowUpdate}
                        title={
                          !allowUpdate ? "No permission to edit users" : "Edit"
                        }
                        onClick={() => openEdit(u)}
                        className={
                          !allowUpdate ? "cursor-not-allowed opacity-60" : ""
                        }
                      >
                        Edit
                      </Button>

                      {allowDelete && (
                        <Button
                          variant="danger"
                          disabled={u.id === user?.id || delUser.isPending}
                          onClick={() => void onDelete(u.id)}
                          title={
                            u.id === user?.id
                              ? "You cannot delete yourself"
                              : "Delete user"
                          }
                        >
                          {delUser.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            disabled={page === 1 || usersQuery.isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="ghost"
            disabled={page === totalPages || usersQuery.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
<<<<<<< HEAD
=======
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
=======

      {editOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeEdit}
            role="button"
            tabIndex={-1}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-slate-100">
                  Edit User
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {editing.name} • {editing.email}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={closeEdit}
                disabled={updateStatus.isPending}
              >
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
                Close
              </Button>
            </div>

<<<<<<< HEAD
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
=======
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  User Details
                </div>

                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Name</div>
                    <div className="mt-1 text-slate-100">{editing.name}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="mt-1 break-all text-slate-100">
                      {editing.email}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Role</div>
                    <div className="mt-1 text-slate-100">{editing.roleName}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Controls
                </div>

                <div className="mt-3 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Status)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/35"
                      disabled={!allowUpdate || updateStatus.isPending}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <p className="text-xs text-slate-500">
                      Admin and manager can update account status.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Department</label>

                    {isAdmin ? (
                      <select
                        value={editDepartmentId}
                        onChange={(e) => setEditDepartmentId(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/35"
                        disabled={
                          updateStatus.isPending || departmentsQuery.isLoading
                        }
                      >
                        <option value="">Unassigned</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100">
                        {selectedDepartmentName}
                      </div>
                    )}

                    <p className="text-xs text-slate-500">
                      Only admin can update department.
                    </p>
                  </div>
                </div>
              </div>

              {!allowUpdate && (
                <div className="text-xs text-slate-400">
                  You don’t have permission to edit users.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={closeEdit}
                  disabled={updateStatus.isPending}
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => void saveEdit()}
                  disabled={!allowUpdate || updateStatus.isPending}
                >
                  {updateStatus.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
>>>>>>> d16fa5a (Build React screens)
=======
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
    </div>
  );
}