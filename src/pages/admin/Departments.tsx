import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Building2,
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
import { apiFetch } from "../../lib/api";
import type { Role } from "../../types/rbac";

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
  departmentId?: string | null;
}

type ListResponse<T> = { data: T[] } | T[];

function toList<T>(res: ListResponse<T>): T[] {
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export default function Departments() {
  const { user } = useAuth();
  const role: Role = user?.role ?? "USER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [managers, setManagers] = useState<UserRow[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [assignDept, setAssignDept] = useState<Department | null>(null);
  const [assignManagerDept, setAssignManagerDept] =
    useState<Department | null>(null);

  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");

  const [assignUserId, setAssignUserId] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [searchManager, setSearchManager] = useState("");

  async function loadDepartments() {
    try {
      setLoading(true);
      setErr(null);

      const deptRes = await apiFetch<ListResponse<Department>>("/departments");
      setDepartments(toList(deptRes));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  async function loadUnassignedUsers() {
    try {
      const userRes = await apiFetch<ListResponse<UserRow>>("/users/unassigned");
      setUsers(toList(userRes));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load users");
    }
  }

  async function loadUnassignedManagers() {
    try {
      const managerRes = await apiFetch<ListResponse<UserRow>>(
        "/users/unassigned-managers"
      );
      setManagers(toList(managerRes));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load managers");
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  async function createDepartment() {
    if (!name.trim()) {
      setErr("Department name is required");
      return;
    }

    try {
      setActionLoading(true);
      setErr(null);

      await apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      setCreateOpen(false);
      setName("");
      await loadDepartments();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create department");
    } finally {
      setActionLoading(false);
    }
  }

  async function updateDepartment() {
    if (!editDept) return;

    if (!editName.trim()) {
      setErr("Department name is required");
      return;
    }

    try {
      setActionLoading(true);
      setErr(null);

      await apiFetch(`/departments/${editDept.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      setEditDept(null);
      setEditName("");
      await loadDepartments();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to update department");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteDepartment(id: string) {
    const ok = window.confirm("Delete this department?");
    if (!ok) return;

    try {
      setActionLoading(true);
      setErr(null);

      await apiFetch(`/departments/${id}`, {
        method: "DELETE",
      });

      await loadDepartments();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to delete department");
    } finally {
      setActionLoading(false);
    }
  }

  async function openAssignUserModal(dept: Department) {
    setAssignDept(dept);
    setAssignUserId("");
    setSearchUser("");
    await loadUnassignedUsers();
  }

  async function openAssignManagerModal(dept: Department) {
    setAssignManagerDept(dept);
    setSelectedManagerId("");
    setSearchManager("");
    await loadUnassignedManagers();
  }

  async function assignUser() {
    if (!assignDept || !assignUserId) return;

    try {
      setActionLoading(true);
      setErr(null);

      await apiFetch(`/departments/${assignDept.id}/assign-user`, {
        method: "POST",
        body: JSON.stringify({
          userId: assignUserId,
        }),
      });

      setAssignDept(null);
      setAssignUserId("");
      setSearchUser("");
      await loadDepartments();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to assign user");
    } finally {
      setActionLoading(false);
    }
  }

  async function assignManager() {
    if (!assignManagerDept || !selectedManagerId) return;

    try {
      setActionLoading(true);
      setErr(null);

      await apiFetch(`/departments/${assignManagerDept.id}/assign-manager`, {
        method: "POST",
        body: JSON.stringify({
          managerId: selectedManagerId,
        }),
      });

      setAssignManagerDept(null);
      setSelectedManagerId("");
      setSearchManager("");
      await loadDepartments();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to assign manager");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = searchUser.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchUser]);

  const filteredManagers = useMemo(() => {
    const q = searchManager.trim().toLowerCase();
    if (!q) return managers;

    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [managers, searchManager]);

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
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Create
            </Button>
          )}
        </div>
      </Card>

      {err && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-200">
          {err}
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
                    {d.users?.length ?? 0}
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
        <Modal title="Create Department" onClose={() => setCreateOpen(false)}>
          <Input
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
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
        <Modal title="Edit Department" onClose={() => setEditDept(null)}>
          <Input
            placeholder="Department name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditDept(null)}
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
          onClose={() => setAssignDept(null)}
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
                  onClick={() => setAssignUserId(u.id)}
                  className={`cursor-pointer rounded-xl border px-3 py-2 ${
                    assignUserId === u.id
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setAssignDept(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={assignUser}
              disabled={!assignUserId || actionLoading}
            >
              {actionLoading ? "Assigning..." : "Assign User"}
            </Button>
          </div>
        </Modal>
      )}

      {assignManagerDept && (
        <Modal
          title={`Assign manager to ${assignManagerDept.name}`}
          onClose={() => setAssignManagerDept(null)}
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
              onClick={() => setAssignManagerDept(null)}
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
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
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
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}