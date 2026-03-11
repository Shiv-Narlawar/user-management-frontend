import { useMemo, useState } from "react";
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
};

export default function Users() {
  const { user } = useAuth();

  const role: Role = user?.role ?? "USER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const allowUpdate = isAdmin || isManager;
  const allowDelete = isAdmin;

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);

  const [page, setPage] = useState(1);

  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const usersQuery = useUsersQuery({
    search: dq ?? "",
    page,
    limit: LIMIT,
    sort: sortOrder,
    role: roleFilter === "ALL" ? undefined : roleFilter,
  });

  const departmentsQuery = useDepartmentsQuery();

  const updateUser = useUpdateUserStatusMutation();
  const delUser = useDeleteUserMutation();

  const rows = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = usersQuery.data?.totalPages ?? 1;

  const departments: DepartmentOption[] =
    departmentsQuery.data?.data ?? [];

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const [editStatus, setEditStatus] = useState<Status>("ACTIVE");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editRole, setEditRole] = useState<Role>("USER");

  const selectedDepartmentName =
    departments.find((d) => d.id === editDepartmentId)?.name ||
    "Unassigned";

  function openEdit(u: UserRow) {
    setEditing(u);
    setEditStatus(u.status ?? "ACTIVE");
    setEditDepartmentId(u.departmentId ?? "");
    setEditRole(u.roleName);
    setEditOpen(true);
  }

  function closeEdit() {
    if (updateUser.isPending) return;

    setEditOpen(false);
    setEditing(null);
    setEditDepartmentId("");
    setEditStatus("ACTIVE");
    setEditRole("USER");
  }

  const saveEdit = async () => {
    if (!allowUpdate || !editing) return;

    const payload: {
      id: string;
      status: Status;
      departmentId?: string;
      roleName?: Role;
    } = {
      id: editing.id,
      status: editStatus,
    };

    if (isAdmin) {
      payload.departmentId = editDepartmentId || undefined;
      payload.roleName = editRole;
    }

    await updateUser.mutateAsync(payload);

    closeEdit();
  };

  const onDelete = async (id: string) => {
    if (!allowDelete) return;

    const ok = window.confirm("Soft delete this user?");
    if (!ok) return;

    await delUser.mutateAsync(id);

    if (rows.length === 1 && page > 1) {
      setPage((p) => p - 1);
    }
  };

  const start = useMemo(
    () => (total === 0 ? 0 : (page - 1) * LIMIT + 1),
    [page, total]
  );

  const end = useMemo(
    () => Math.min(page * LIMIT, total),
    [page, total]
  );

  const title =
    role === "USER" ? "Department Directory" : "Users";

  const subtitle =
    role === "USER"
      ? "You can only view users in your department."
      : `Showing ${start} – ${end} of ${total}`;

  const errorMessage =
    (usersQuery.isError
      ? (usersQuery.error as Error | null)?.message
      : null) ||
    (updateUser.isError
      ? (updateUser.error as Error | null)?.message
      : null) ||
    (delUser.isError
      ? (delUser.error as Error | null)?.message
      : null) ||
    null;

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>
            <div className="text-3xl font-extrabold text-slate-100">
              {title}
            </div>

            <div className="mt-1 text-sm text-slate-400">
              {subtitle}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">

            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or email..."
              className="w-full md:w-72"
            />

            {isAdmin && (
              <>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as Role | "ALL");
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="MANAGER">Managers</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "ASC" | "DESC");
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="DESC">Newest First</option>
                  <option value="ASC">Oldest First</option>
                </select>
              </>
            )}
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {errorMessage}
        </div>
      )}

      {/* TABLE */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">

            <thead className="border-b border-slate-800 bg-slate-950/40">
              <tr className="text-slate-300">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {usersQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
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

                    <td className="px-6 py-4 text-slate-300">
                      {u.email}
                    </td>

                    <td className="px-6 py-4 text-slate-200">
                      {u.roleName}
                    </td>

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

                    <td className="px-6 py-4 text-slate-300">
                      {u.department?.name ?? "Unassigned"}
                    </td>

                    <td className="space-x-2 px-6 py-4 text-right">

                      <Button
                        variant="ghost"
                        disabled={!allowUpdate}
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </Button>

                      {allowDelete && (
                        <Button
                          variant="danger"
                          disabled={u.id === user?.id}
                          onClick={() => onDelete(u.id)}
                        >
                          Delete
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3">

          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center text-sm text-slate-300">
            Page {page} of {totalPages}
          </div>

          <Button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>

        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <Card className="w-full max-w-md p-6">

            <div className="text-lg font-bold mb-4">
              Edit User
            </div>

            <div className="space-y-4">

              <div>
                <div className="text-sm text-slate-400">Name</div>
                <div className="text-slate-100">{editing.name}</div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Email</div>
                <div className="text-slate-100">{editing.email}</div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-1">Status</div>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as Status)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {isAdmin && (
                <>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">
                      Role
                    </div>

                    <select
                      value={editRole}
                      onChange={(e) =>
                        setEditRole(e.target.value as Role)
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                    >
                      <option value="USER">USER</option>
                      <option value="MANAGER">MANAGER</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-1">
                      Department
                    </div>

                    <select
                      value={editDepartmentId}
                      onChange={(e) =>
                        setEditDepartmentId(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                    >
                      <option value="">Unassigned</option>

                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                    <div className="text-xs text-slate-400 mt-1">
                      Selected: {selectedDepartmentName}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">

              <Button variant="ghost" onClick={closeEdit}>
                Cancel
              </Button>

              <Button
                onClick={saveEdit}
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Saving..." : "Save"}
              </Button>

            </div>

          </Card>

        </div>
      )}
    </div>
  );
}