import { useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

import type { Role, Status } from "../types/rbac";
import type { UserRow } from "../services/users.api";

import {
  useCreateUserMutation,
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

type UsersResponse = {
  data: UserRow[];
  total: number;
  totalPages: number;
};

type InvitationResult = {
  user: UserRow;
  invitation: {
    emailSent: boolean;
    appLoginLink: string | null;
  };
};

export default function Users() {
  const { user } = useAuth();
  const { push } = useToast();

  const role: Role = user?.role ?? "USER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const allowUpdate = isAdmin || isManager;
  const allowDelete = isAdmin;

  const isSelf = (id: string) => id === user?.id;

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
  const createUser = useCreateUserMutation();
  const delUser = useDeleteUserMutation();

  const data = usersQuery.data as UsersResponse | undefined;

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const departments: DepartmentOption[] =
    departmentsQuery.data?.data ?? [];

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<InvitationResult | null>(
    null
  );

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<Role>("USER");
  const [createDepartmentId, setCreateDepartmentId] = useState("");

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

  function closeCreate() {
    if (createUser.isPending) return;

    setCreateOpen(false);
    setCreateName("");
    setCreateEmail("");
    setCreateRole("USER");
    setCreateDepartmentId("");
  }

  async function handleCreateUser() {
    const payload = {
      name: createName.trim(),
      email: createEmail.trim(),
      role: createRole,
      departmentId: createDepartmentId || undefined,
    };

    const result = await createUser.mutateAsync(payload);

    closeCreate();
    setCreatedInvite(result);
    setInviteOpen(true);
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
  }

  const saveEdit = async () => {
    if (!allowUpdate || !editing) return;

    if (isAdmin && editing.id === user?.id) return;

    const payload: {
      id: string;
      status: Status;
      departmentId?: string | null;
      roleName?: Role;
    } = {
      id: editing.id,
      status: editStatus,
    };

    if (isAdmin) {
      payload.roleName = editRole;
      payload.departmentId = editDepartmentId || null;
    }

    try {
      await updateUser.mutateAsync(payload);
      push("success", "User updated");
      closeEdit();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update user";
      push("error", message);
    }
  };

  const onDelete = async (id: string) => {
    if (!allowDelete) return;

    if (isAdmin && isSelf(id)) return;

    const ok = window.confirm("Soft delete this user?");
    if (!ok) return;

    try {
      await delUser.mutateAsync(id);
      push("success", "User deleted");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      push("error", message);
      return;
    }

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
    (createUser.isError
      ? (createUser.error as Error | null)?.message
      : null) ||
    (delUser.isError
      ? (delUser.error as Error | null)?.message
      : null) ||
    null;

  const isEditingSelf = editing?.id === user?.id;

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

            {isAdmin && (
              <Button onClick={() => setCreateOpen(true)}>Create User</Button>
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
                    className={`border-b border-slate-800 hover:bg-slate-900/25 ${
                      isSelf(u.id) ? "bg-slate-800/40" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {u.name}
                      {isSelf(u.id) && (
                        <span className="ml-2 text-xs text-slate-400">(You)</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {u.email}
                    </td>

                    <td className="px-6 py-4 text-slate-200">
                      {u.roleName}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-xl ${
                          u.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
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
                        disabled={!allowUpdate || (isAdmin && isSelf(u.id))}
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </Button>

                      {allowDelete && (
                        <Button
                          variant="danger"
                          disabled={isAdmin && isSelf(u.id)}
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
        <Modal open={editOpen} title="Edit User" onClose={closeEdit}>
          <Card className="w-full max-w-md border-0 bg-transparent p-0 shadow-none">
            <div className="text-lg font-bold mb-4">
              Edit User
            </div>

            {isAdmin && isEditingSelf && (
              <div className="text-xs text-yellow-400 mb-2">
                You cannot modify your own account.
              </div>
            )}

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
                  disabled={isAdmin && isEditingSelf}
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
                      disabled={isAdmin && isEditingSelf}
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
                      disabled={isAdmin && isEditingSelf}
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
        </Modal>
      )}

      <Modal open={createOpen} title="Create User" onClose={closeCreate}>
        <div className="space-y-4">
          <Input
            label="Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Enter full name"
          />

          <Input
            label="Email"
            type="email"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            placeholder="name@company.com"
          />

          <div>
            <div className="mb-2 text-sm text-slate-300">Role</div>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as Role)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100"
            >
              <option value="USER">USER</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm text-slate-300">Department</div>
            <select
              value={createDepartmentId}
              onChange={(e) => setCreateDepartmentId(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100"
            >
              <option value="">Unassigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
            Auth0 will send the user a password setup email. After they set their
            password, they can use the app login link to sign in.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeCreate}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                createUser.isPending ||
                !createName.trim() ||
                !createEmail.trim()
              }
            >
              {createUser.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={inviteOpen && !!createdInvite}
        title="Invitation Ready"
        onClose={() => setInviteOpen(false)}
      >
        {createdInvite && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {createdInvite.user.email} was created successfully and Auth0 has
              sent the password setup email.
            </div>

            {createdInvite.invitation.appLoginLink && (
              <div>
                <div className="mb-2 text-sm text-slate-300">App login link</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-300 break-all">
                  {createdInvite.invitation.appLoginLink}
                </div>
                <div className="mt-3 flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyText(createdInvite.invitation.appLoginLink as string)
                    }
                  >
                    Copy Login Link
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        createdInvite.invitation.appLoginLink as string,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Open Login
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
              The user should check their email, set a password from the Auth0
              email, and then log in using the app link.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
