import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  Eye,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../lib/api";
import type { Role, Status } from "../../types/rbac";

interface Department {
  id: string;
  name: string;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
  } | null;
  users?: {
    id: string;
  }[];
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  roleName: Role;
  status?: Status;
  departmentId?: string | null;
}

type ListResponse<T> = { data: T[] } | T[];
type UsersResponse = {
  data: UserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function toList<T>(res: ListResponse<T>): T[] {
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export default function Departments() {
  const { user } = useAuth();
  const { push } = useToast();
  const role: Role = user?.role ?? "USER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentUsers, setDepartmentUsers] = useState<UserRow[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<UserRow[]>([]);
  const [managers, setManagers] = useState<UserRow[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [assignDept, setAssignDept] = useState<Department | null>(null);
  const [assignManagerDept, setAssignManagerDept] =
    useState<Department | null>(null);
  const [viewDept, setViewDept] = useState<Department | null>(null);

  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");

  const [assignUserIds, setAssignUserIds] = useState<string[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [searchManager, setSearchManager] = useState("");

  function clearModalState() {
    setModalError(null);
  }

  async function loadDepartments() {
    try {
      const deptRes = await apiFetch<ListResponse<Department>>("/departments");
      setDepartments(toList(deptRes));
    } catch (e: unknown) {
      setPageError(e instanceof Error ? e.message : "Failed to load departments");
    }
  }

  async function loadAllUsers() {
    try {
      const firstPage = await apiFetch<UsersResponse>("/users?page=1&limit=100");
      const totalPages = firstPage.totalPages ?? 1;

      if (totalPages <= 1) {
        setDepartmentUsers(firstPage.data ?? []);
        return;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          apiFetch<UsersResponse>(`/users?page=${index + 2}&limit=100`)
        )
      );

      setDepartmentUsers([
        ...(firstPage.data ?? []),
        ...remainingPages.flatMap((page) => page.data ?? []),
      ]);
    } catch (e: unknown) {
      setPageError(e instanceof Error ? e.message : "Failed to load users");
    }
  }

  async function refreshPageData() {
    try {
      setLoading(true);
      setPageError(null);
      await Promise.all([loadDepartments(), loadAllUsers()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadUnassignedUsers() {
    try {
      const userRes = await apiFetch<ListResponse<UserRow>>("/users/unassigned");
      setAssignableUsers(toList(userRes));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load users";
      setModalError(message);
      push("error", message);
    }
  }

  async function loadUnassignedManagers() {
    try {
      const managerRes = await apiFetch<ListResponse<UserRow>>(
        "/users/unassigned-managers"
      );
      setManagers(toList(managerRes));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load managers";
      setModalError(message);
      push("error", message);
    }
  }

  useEffect(() => {
    void refreshPageData();
  }, []);

  async function createDepartment() {
    if (!name.trim()) {
      setModalError("Department name is required");
      return;
    }

    try {
      setActionLoading(true);
      setModalError(null);

      await apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      setCreateOpen(false);
      setName("");
      await refreshPageData();
      push("success", "Department created");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to create department";
      setModalError(message);
      push("error", message);
    } finally {
      setActionLoading(false);
    }
  }

  async function updateDepartment() {
    if (!editDept) return;

    if (!editName.trim()) {
      setModalError("Department name is required");
      return;
    }

    try {
      setActionLoading(true);
      setModalError(null);

      await apiFetch(`/departments/${editDept.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      setEditDept(null);
      setEditName("");
      await refreshPageData();
      push("success", "Department updated");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to update department";
      setModalError(message);
      push("error", message);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteDepartment(id: string) {
    const ok = window.confirm("Delete this department?");
    if (!ok) return;

    try {
      setActionLoading(true);
      setPageError(null);

      await apiFetch(`/departments/${id}`, {
        method: "DELETE",
      });

      await refreshPageData();
      push("success", "Department deleted");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to delete department";
      setPageError(message);
      push("error", message);
    } finally {
      setActionLoading(false);
    }
  }

  async function openAssignUserModal(dept: Department) {
    clearModalState();
    setAssignDept(dept);
    setAssignUserIds([]);
    setSearchUser("");
    await loadUnassignedUsers();
  }

  async function openAssignManagerModal(dept: Department) {
    clearModalState();
    setAssignManagerDept(dept);
    setSelectedManagerId("");
    setSearchManager("");
    await loadUnassignedManagers();
  }

  async function assignUser() {
    if (!assignDept || assignUserIds.length === 0) return;

    try {
      setActionLoading(true);
      setModalError(null);

      await apiFetch(`/departments/${assignDept.id}/assign-user`, {
        method: "POST",
        body: JSON.stringify({
          userIds: assignUserIds,
        }),
      });

      setAssignDept(null);
      setAssignUserIds([]);
      setSearchUser("");
      await refreshPageData();
      push(
        "success",
        assignUserIds.length === 1
          ? "User assigned to department"
          : `${assignUserIds.length} users assigned to department`
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to assign user";
      setModalError(message);
      push("error", message);
    } finally {
      setActionLoading(false);
    }
  }

  function toggleAssignUser(userId: string) {
    setAssignUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  async function assignManager() {
    if (!assignManagerDept || !selectedManagerId) return;

    try {
      setActionLoading(true);
      setModalError(null);

      await apiFetch(`/departments/${assignManagerDept.id}/assign-manager`, {
        method: "POST",
        body: JSON.stringify({
          managerId: selectedManagerId,
        }),
      });

      setAssignManagerDept(null);
      setSelectedManagerId("");
      setSearchManager("");
      await refreshPageData();
      push("success", "Manager assigned to department");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to assign manager";
      setModalError(message);
      push("error", message);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = searchUser.trim().toLowerCase();
    if (!q) return assignableUsers;

    return assignableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [assignableUsers, searchUser]);

  const filteredManagers = useMemo(() => {
    const q = searchManager.trim().toLowerCase();
    if (!q) return managers;

    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [managers, searchManager]);

  const usersByDepartment = useMemo(() => {
    return departmentUsers.reduce<Record<string, UserRow[]>>((acc, currentUser) => {
      if (!currentUser.departmentId) return acc;

      if (!acc[currentUser.departmentId]) {
        acc[currentUser.departmentId] = [];
      }

      acc[currentUser.departmentId].push(currentUser);
      return acc;
    }, {});
  }, [departmentUsers]);

  const departmentMembers = useMemo(() => {
    if (!viewDept) return [];
    return usersByDepartment[viewDept.id] ?? [];
  }, [usersByDepartment, viewDept]);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-3xl font-extrabold">
              <Building2 className="text-blue-300" />
              Departments
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Manage departments, assign managers, and assign users.
            </div>
          </div>

          {isAdmin && (
            <Button
              onClick={() => {
                clearModalState();
                setCreateOpen(true);
              }}
            >
              <Plus size={16} /> Create
            </Button>
          )}
        </div>
      </Card>

      {pageError && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-200">
          {pageError}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800 bg-slate-950/40">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Users</th>
              <th className="px-6 py-3 text-left">Manager</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-slate-400">
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-800 hover:bg-slate-900/25"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold">{d.name}</div>
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    <button
                      type="button"
                      onClick={() => setViewDept(d)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-left text-slate-200 transition hover:bg-slate-800"
                    >
                      <span className="font-semibold">
                        {usersByDepartment[d.id]?.length ?? 0}
                      </span>
                      <span className="text-xs text-slate-400">members</span>
                    </button>
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {d.manager ? (
                      <div className="flex items-center gap-2">
                        <span>{d.manager.name}</span>
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                          Manager
                        </span>
                      </div>
                    ) : (
                      "Not Assigned"
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          onClick={() => openAssignManagerModal(d)}
                          disabled={actionLoading}
                        >
                          <UserCog size={16} /> Assign Manager
                        </Button>
                      )}

                      {(isAdmin || isManager) && (
                        <Button
                          variant="ghost"
                          onClick={() => setViewDept(d)}
                          disabled={actionLoading}
                        >
                          <Eye size={16} /> View Users
                        </Button>
                      )}

                      {(isAdmin || isManager) && (
                        <Button
                          variant="ghost"
                          onClick={() => openAssignUserModal(d)}
                          disabled={actionLoading}
                        >
                          <Users size={16} /> Assign User
                        </Button>
                      )}

                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              clearModalState();
                              setEditDept(d);
                              setEditName(d.name);
                            }}
                            disabled={actionLoading}
                          >
                            <Pencil size={16} /> Edit
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => deleteDepartment(d.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={16} /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {createOpen && (
        <Modal
          title="Create Department"
          error={modalError}
          onClose={() => {
            setCreateOpen(false);
            clearModalState();
          }}
        >
          <Input
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setCreateOpen(false);
                clearModalState();
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={createDepartment} disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </Modal>
      )}

      {editDept && (
        <Modal
          title="Edit Department"
          error={modalError}
          onClose={() => {
            setEditDept(null);
            clearModalState();
          }}
        >
          <Input
            placeholder="Department name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setEditDept(null);
                clearModalState();
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={updateDepartment} disabled={actionLoading}>
              {actionLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </Modal>
      )}

      {assignDept && (
        <Modal
          title={`Assign user to ${assignDept.name}`}
          error={modalError}
          onClose={() => {
            setAssignDept(null);
            setAssignUserIds([]);
            clearModalState();
          }}
        >
          <Input
            placeholder="Search user..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-slate-800 px-3 py-4 text-sm text-slate-400">
                No unassigned users found
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => toggleAssignUser(u.id)}
                  className={`cursor-pointer rounded-xl border px-3 py-2 ${
                    assignUserIds.includes(u.id)
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={assignUserIds.includes(u.id)}
                      onChange={() => toggleAssignUser(u.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 rounded border-slate-700"
                    />
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {assignUserIds.length > 0 && (
            <div className="mt-3 text-sm text-slate-400">
              {assignUserIds.length} user
              {assignUserIds.length > 1 ? "s" : ""} selected
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setAssignDept(null);
                setAssignUserIds([]);
                clearModalState();
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={assignUser}
              disabled={assignUserIds.length === 0 || actionLoading}
            >
              {actionLoading
                ? "Assigning..."
                : assignUserIds.length > 1
                  ? "Assign Users"
                  : "Assign User"}
            </Button>
          </div>
        </Modal>
      )}

      {assignManagerDept && (
        <Modal
          title={`Assign manager to ${assignManagerDept.name}`}
          error={modalError}
          onClose={() => {
            setAssignManagerDept(null);
            clearModalState();
          }}
        >
          <Input
            placeholder="Search manager..."
            value={searchManager}
            onChange={(e) => setSearchManager(e.target.value)}
          />

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {filteredManagers.length === 0 ? (
              <div className="rounded-xl border border-slate-800 px-3 py-4 text-sm text-slate-400">
                No unassigned managers found
              </div>
            ) : (
              filteredManagers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedManagerId(m.id)}
                  className={`cursor-pointer rounded-xl border px-3 py-2 ${
                    selectedManagerId === m.id
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setAssignManagerDept(null);
                clearModalState();
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={assignManager}
              disabled={!selectedManagerId || actionLoading}
            >
              {actionLoading ? "Assigning..." : "Assign Manager"}
            </Button>
          </div>
        </Modal>
      )}

      {viewDept && (
        <Modal
          title={`${viewDept.name} Users`}
          onClose={() => setViewDept(null)}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <div className="text-sm text-slate-400">Department members</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-2xl font-extrabold text-slate-100">
                {departmentMembers.length}
              </div>
              <div className="text-xs text-slate-500">
                Users currently assigned
              </div>
            </div>
          </div>

          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {departmentMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-400">
                No users are assigned to this department yet.
              </div>
            ) : (
              departmentMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-100">
                        {member.name}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Mail size={12} />
                        {member.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                        {member.roleName}
                      </span>
                      {member.status && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            member.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {member.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {(isAdmin || isManager) && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (!viewDept) return;

                  const selectedDepartment = viewDept;
                  setViewDept(null);
                  void openAssignUserModal(selectedDepartment);
                }}
                disabled={actionLoading}
              >
                <Users size={16} /> Assign User
              </Button>
            )}

            <Button variant="ghost" onClick={() => setViewDept(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  error,
  onClose,
}: {
  title: string;
  children: ReactNode;
  error?: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">{title}</div>

          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-white"
            type="button"
          >
            x
          </button>
        </div>

        <div className="mt-4">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
