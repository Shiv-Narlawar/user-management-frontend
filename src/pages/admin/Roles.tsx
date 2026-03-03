import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../lib/api";

interface RoleRow {
  id: string;
  name: string; 
}

type RolesResponse = { data: RoleRow[] } | RoleRow[];

type RoleSummaryRow = RoleRow & { userCount: number };
type RoleSummaryResponse = { data: RoleSummaryRow[] } | RoleSummaryRow[];

function isDefaultRole(name: string) {
  return name === "ADMIN" || name === "MANAGER" || name === "USER";
}

function validateRoleName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Role name is required";
  if (trimmed.length > 32) return "Role name must be <= 32 characters";

  const ok = /^[A-Z][A-Z0-9_]*$/.test(trimmed);
  if (!ok) return "Use uppercase format like SUPPORT_AGENT (A-Z, 0-9, _)";

  return null;
}

export default function Roles() {
  const { push } = useToast();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [name, setName] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  const [q, setQ] = useState("");
  const [userCounts, setUserCounts] = useState<Map<string, number>>(new Map());
  const [loadingCounts, setLoadingCounts] = useState(false);

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

  async function loadRoleCounts(): Promise<void> {
    setLoadingCounts(true);
    try {
      const res = (await apiFetch("/roles/summary")) as RoleSummaryResponse;
      const list = Array.isArray(res) ? res : res.data ?? [];

      const map = new Map<string, number>();
      list.forEach((r) => map.set(String(r.id), Number(r.userCount ?? 0)));
      setUserCounts(map);
    } catch {
      setUserCounts(new Map());
    } finally {
      setLoadingCounts(false);
    }
  }

  useEffect(() => {
    void load();
    void loadRoleCounts();
    
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(query));
  }, [roles, q]);

  const existingNames = useMemo(() => new Set(roles.map((r) => r.name)), [roles]);

  async function create(): Promise<void> {
    const trimmed = name.trim().toUpperCase();

    const err = validateRoleName(trimmed);
    if (err) {
      push("error", err);
      return;
    }

    if (existingNames.has(trimmed)) {
      push("error", "Role already exists");
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
      await loadRoleCounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Role create failed";
      push("error", msg);
    } finally {
      setCreating(false);
    }
  }

  async function remove(roleId: string, roleName: string): Promise<void> {
    const count = userCounts.get(roleId);
    if (typeof count === "number" && count > 0) {
      push("error", "Cannot delete a role that has users assigned");
      return;
    }

    const ok = window.confirm(`Delete role "${roleName}"?`);
    if (!ok) return;

    try {
      await apiFetch(`/roles/${roleId}`, { method: "DELETE" });
      push("success", "Role deleted");
      await load();
      await loadRoleCounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Role delete failed";
      push("error", msg);
    }
  }

  const totalRoles = roles.length;
  const customRoles = roles.filter((r) => !isDefaultRole(r.name)).length;

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
              Create & manage roles
              <span className="text-slate-200 font-semibold">Permissions</span>.
            </div>

            <div className="mt-3 text-sm text-slate-400">
              Total roles:{" "}
              <span className="text-slate-200 font-semibold">{totalRoles}</span>{" "}
              • Custom roles:{" "}
              <span className="text-slate-200 font-semibold">{customRoles}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New role name (e.g. SUPPORT_AGENT)"
                className="w-80"
              />
              <Button onClick={create} disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search roles..."
                className="w-72"
              />
              <Button variant="ghost" onClick={() => setQ("")} disabled={!q}>
                Reset
              </Button>

              <div className="text-xs text-slate-500">
                {loadingCounts ? "Loading usage…" : "Usage shown if available"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-300">
          Naming convention:{" "}
          <span className="font-semibold text-slate-200">
            UPPERCASE_WITH_UNDERSCORES
          </span>
          . Example: <span className="font-semibold text-slate-200">SUPPORT_AGENT</span>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Users</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={4}>
                  No roles found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const defaultRole = isDefaultRole(r.name);
                const count = userCounts.get(String(r.id));
                const canDelete = !defaultRole && !(typeof count === "number" && count > 0);

                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-800/70 hover:bg-slate-900/25"
                  >
                    <td className="px-6 py-4 font-semibold">{r.name}</td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-semibold",
                          defaultRole
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 bg-slate-900/30 text-slate-200",
                        ].join(" ")}
                      >
                        {defaultRole ? "Default" : "Custom"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {typeof count === "number" ? count : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="danger"
                          onClick={() => remove(String(r.id), r.name)}
                          disabled={!canDelete}
                          title={
                            defaultRole
                              ? "Default roles cannot be deleted"
                              : typeof count === "number" && count > 0
                              ? "Cannot delete role with users assigned"
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