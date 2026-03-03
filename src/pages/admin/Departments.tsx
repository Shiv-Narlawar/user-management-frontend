import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Users, Trash2, Pencil } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import type { Role } from "../../types/rbac";

interface Department {
  id: string;
  name: string;
  managerId: string;
  manager?: { id: string; name: string; email: string };
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  roleName?: Role;
  role?: Role;
}

type ListResponse<T> = { data: T[] } | T[];

function toList<T>(res: ListResponse<T>): T[] {
  return Array.isArray(res) ? res : res.data ?? [];
}

export default function Departments() {
  const { user } = useAuth();
  const role: Role = user?.role ?? "USER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [assignDept, setAssignDept] = useState<Department | null>(null);
  const [editDept, setEditDept] = useState<Department | null>(null);

  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [editName, setEditName] = useState("");

  const [assignUserId, setAssignUserId] = useState("");
  const [searchUser, setSearchUser] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const deptRes = await apiFetch<ListResponse<Department>>("/departments");
      setDepartments(toList(deptRes));

      if (isAdmin || isManager) {
        const userRes = await apiFetch<ListResponse<UserRow>>(
          "/users?limit=200&page=1"
        );
        setUsers(toList(userRes));
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createDepartment() {
    if (!isAdmin) return;

    if (!name.trim() || !managerId) {
      setErr("Department name and manager are required");
      return;
    }

    try {
      await apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          managerId,
        }),
      });

      setCreateOpen(false);
      setName("");
      setManagerId("");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create department");
    }
  }

  async function updateDepartment() {
    if (!editDept || !editName.trim()) {
      setErr("Department name is required");
      return;
    }

    try {
      await apiFetch(`/departments/${editDept.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      setEditDept(null);
      setEditName("");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to update department");
    }
  }

  async function deleteDepartment(id: string) {
    if (!isAdmin) return;

    const ok = window.confirm("Delete this department?");
    if (!ok) return;

    try {
      await apiFetch(`/departments/${id}`, { method: "DELETE" });
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to delete department");
    }
  }

  async function assignUser() {
    if (!assignDept || !assignUserId) {
      setErr("Please select a user");
      return;
    }

    try {
      await apiFetch(`/departments/${assignDept.id}/assign-user`, {
        method: "POST",
        body: JSON.stringify({ userId: assignUserId }),
      });

      setAssignDept(null);
      setAssignUserId("");
      setSearchUser("");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to assign user");
    }
  }

  const managers = useMemo(
    () => users.filter((u) => (u.roleName ?? u.role) === "MANAGER"),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
    );
  }, [users, searchUser]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2 text-3xl font-extrabold">
              <Building2 className="text-blue-300" /> Departments
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Manage departments and assign users
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

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Manager</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-slate-400">
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-800 hover:bg-slate-900/25"
                >
                  <td className="px-6 py-4 font-semibold">{d.name}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {d.manager?.name ?? "—"}
                  </td>

                  <td className="px-6 py-4 flex justify-end gap-2">
                    {(isAdmin || isManager) && (
                      <Button
                        variant="ghost"
                        onClick={() => setAssignDept(d)}
                      >
                        <Users size={16} /> Assign user
                      </Button>
                    )}

                    {isAdmin && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditDept(d);
                          setEditName(d.name);
                        }}
                      >
                        <Pencil size={16} /> Edit
                      </Button>
                    )}

                    {isAdmin && (
                      <Button
                        variant="danger"
                        onClick={() => deleteDepartment(d.id)}
                      >
                        <Trash2 size={16} /> Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Create Modal */}
      {createOpen && (
        <Modal title="Create Department" onClose={() => setCreateOpen(false)}>
          <Input
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full mt-3 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">Select manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDepartment}>Create</Button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editDept && (
        <Modal title="Edit Department" onClose={() => setEditDept(null)}>
          <Input
            placeholder="Department name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setEditDept(null)}>
              Cancel
            </Button>
            <Button onClick={updateDepartment}>Update</Button>
          </div>
        </Modal>
      )}

      {/* Assign Modal */}
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

          <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.map((u) => (
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
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setAssignDept(null)}>
              Cancel
            </Button>
            <Button onClick={assignUser}>Assign</Button>
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
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative glass w-full max-w-lg rounded-3xl border border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">{title}</div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}