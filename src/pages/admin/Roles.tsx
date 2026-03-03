import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../lib/api";

interface RoleRow {
  id: string;
  name: string; // ADMIN / MANAGER / USER or custom
}

type RolesResponse = { data: RoleRow[] } | RoleRow[];

export default function Roles() {
  const { push } = useToast();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [name, setName] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  async function load(): Promise<void> {
    setLoading(true);
    try {
      const res = (await apiFetch("/roles")) as RolesResponse;
      const list = Array.isArray(res) ? res : res.data ?? [];
      setRoles(list);
    } catch {
      push("error", "Failed to load roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      push("error", "Role name is required");
      return;
    }

    setCreating(true);
    try {
      await apiFetch("/roles", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });

      push("success", "Role created");
      setName("");
      await load();
    } catch {
      push("error", "Role create failed");
    } finally {
      setCreating(false);
    }
  }

  async function remove(roleId: string): Promise<void> {
    const ok = window.confirm("Delete this role?");
    if (!ok) return;

    try {
      await apiFetch(`/roles/${roleId}`, { method: "DELETE" });
      push("success", "Role deleted");
      await load();
    } catch {
      push("error", "Role delete failed");
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ADMIN
            </div>
            <div className="text-4xl font-extrabold mt-2">Roles</div>
            <div className="text-slate-400 mt-2">
              Create/delete roles. Permission assignment is managed in{" "}
              <span className="text-slate-200 font-semibold">Permissions</span>.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New role name (e.g. SUPPORT)"
              className="w-72"
            />
            <Button onClick={create} disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={2}>
                  Loading…
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={2}>
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((r) => {
                const isDefault =
                  r.name === "ADMIN" || r.name === "MANAGER" || r.name === "USER";

                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-800/70 hover:bg-slate-900/25"
                  >
                    <td className="px-6 py-4 font-semibold">{r.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="danger"
                          onClick={() => remove(r.id)}
                          disabled={isDefault}
                          title={
                            isDefault
                              ? "Default roles cannot be deleted"
                              : "Delete role"
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}