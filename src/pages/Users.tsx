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

  // INVITE
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("USER");

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

  // EDIT
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const [editStatus, setEditStatus] = useState<Status>("ACTIVE");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editRole, setEditRole] = useState<Role>("USER");

  const selectedDepartmentName =
    departments.find((d) => d.id === editDepartmentId)?.name ||
    "Unassigned";

  const handleInvite = async () => {
    try {
      await fetch("/api/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      setInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      usersQuery.refetch();
    } catch (err) {
      console.error(err);
    }
  };

  function openEdit(u: UserRow) {
    setEditing(u);
    setEditStatus(u.status ?? "ACTIVE");
    setEditDepartmentId(u.departmentId ?? "");
    setEditRole(u.roleName);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
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
    if (!window.confirm("Soft delete this user?")) return;

    await delUser.mutateAsync(id);
  };

  const start = useMemo(
    () => (total === 0 ? 0 : (page - 1) * LIMIT + 1),
    [page, total]
  );

  const end = useMemo(
    () => Math.min(page * LIMIT, total),
    [page, total]
  );

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <Card className="p-6">
        <div className="flex flex-wrap justify-between gap-4">

          <div>
            <div className="text-2xl font-bold">Users</div>
            <div className="text-sm text-gray-400">
              Showing {start} - {end} of {total}
            </div>
          </div>

          <div className="flex gap-3">

            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
            />

            {isAdmin && (
              <>
                <Button onClick={() => setInviteOpen((p) => !p)}>
                  Invite
                </Button>

                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as Role | "ALL")
                  }
                >
                  <option value="ALL">All</option>
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "ASC" | "DESC")
                  }
                >
                  <option value="DESC">Newest</option>
                  <option value="ASC">Oldest</option>
                </select>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* INVITE */}
      {isAdmin && inviteOpen && (
        <Card className="p-4 flex gap-3">
          <Input
            placeholder="Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
          >
            <option value="USER">USER</option>
            <option value="MANAGER">MANAGER</option>
          </select>
          <Button onClick={handleInvite}>Send</Button>
        </Card>
      )}

      {/* TABLE */}
      <Card className="p-4">
        <table className="w-full">
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.roleName}</td>
                <td>
                  {u.status === "ACTIVE"
                    ? "🟢"
                    : u.status === "INVITED"
                    ? "🟡"
                    : "🔴"}
                </td>
                <td>{u.department?.name ?? "Unassigned"}</td>
                <td>
                  <Button
                    disabled={!allowUpdate || u.id === user?.id}
                    onClick={() => openEdit(u)}
                  >
                    Edit
                  </Button>

                  {allowDelete && (
                    <Button
                      disabled={u.id === user?.id}
                      onClick={() => onDelete(u.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <div>{page} / {totalPages}</div>
          <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && editing && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <Card className="p-6 w-[400px]">

            <div className="mb-3 font-bold">Edit User</div>

            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as Status)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            {isAdmin && (
              <>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                >
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                </select>

                <select
                  value={editDepartmentId}
                  onChange={(e) => setEditDepartmentId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <div>Selected: {selectedDepartmentName}</div>
              </>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={closeEdit}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>

          </Card>
        </div>
      )}

    </div>
  );
}