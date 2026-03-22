import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../lib/api";
import { useDebounce } from "../../hooks/useDebounce";

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

  if (!trimmed) return null;
  if (trimmed.length > 32) return "Role name must be 32 characters or fewer";

  const ok = /^[A-Z][A-Z0-9_]*$/.test(trimmed);
  if (!ok) return "Use uppercase format such as SUPPORT_AGENT";

  return null;
}

export default function Roles() {
  const { push } = useToast();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);

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
      list.forEach((role) => map.set(String(role.id), Number(role.userCount ?? 0)));
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
    const query = dq.trim().toLowerCase();
    if (!query) return roles;

    return roles.filter((role) => role.name.toLowerCase().includes(query));
  }, [roles, dq]);

  const sortedRoles = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aDefault = isDefaultRole(a.name);
      const bDefault = isDefaultRole(b.name);

      if (aDefault && !bDefault) return -1;
      if (!aDefault && bDefault) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const existingNames = useMemo(
    () => new Set(roles.map((role) => role.name)),
    [roles]
  );

  const roleError = validateRoleName(name.toUpperCase());

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

      await Promise.all([load(), loadRoleCounts()]);
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
      push("error", "Cannot delete a role with users assigned");
      return;
    }

    const ok = window.confirm(`Delete role "${roleName}"?`);
    if (!ok) return;

    try {
      await apiFetch(`/roles/${roleId}`, { method: "DELETE" });

      push("success", "Role deleted");
      await Promise.all([load(), loadRoleCounts()]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Role delete failed";
      push("error", msg);
    }
  }

  const totalRoles = roles.length;
  const customRoles = roles.filter((role) => !isDefaultRole(role.name)).length;
  const defaultRoles = totalRoles - customRoles;

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold tracking-[0.2em] text-blue-300">
              ADMINISTRATION
            </div>

            <div className="mt-2 text-4xl font-extrabold text-slate-100">
              Roles
            </div>

            <div className="mt-2 text-slate-400">
              Maintain the role catalog used for access control. Default roles stay
              protected, while custom roles can be introduced for specific operational
              needs.
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/35 px-4 py-2 text-slate-400">
                Total
                <span className="ml-2 font-semibold text-slate-200">
                  {totalRoles}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/35 px-4 py-2 text-slate-400">
                Default
                <span className="ml-2 font-semibold text-slate-200">
                  {defaultRoles}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/35 px-4 py-2 text-slate-400">
                Custom
                <span className="ml-2 font-semibold text-slate-200">
                  {customRoles}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="New role name (SUPPORT_AGENT)"
                  className="w-80"
                />

                {roleError && (
                  <div className="mt-1 text-xs text-red-400">{roleError}</div>
                )}
              </div>

              <Button onClick={create} disabled={creating || !!roleError}>
                {creating ? "Creating..." : "Create Role"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search roles..."
                className="w-72"
              />

              <Button variant="ghost" onClick={() => setQ("")} disabled={!q}>
                Clear
              </Button>

              <div className="text-xs text-slate-500">
                {loadingCounts
                  ? "Loading usage..."
                  : "User assignments shown when available"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-300">
          Role naming convention:
          <span className="ml-2 font-semibold text-slate-200">
            UPPERCASE_WITH_UNDERSCORES
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800 bg-slate-950/40">
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
                <td colSpan={4} className="px-6 py-6 text-slate-400">
                  Loading roles...
                </td>
              </tr>
            ) : sortedRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-slate-400">
                  No roles found.
                </td>
              </tr>
            ) : (
              sortedRoles.map((role) => {
                const defaultRole = isDefaultRole(role.name);
                const count = userCounts.get(String(role.id));
                const canDelete =
                  !defaultRole &&
                  !(typeof count === "number" && count > 0);

                return (
                  <tr
                    key={role.id}
                    className="border-b border-slate-800 hover:bg-slate-900/25"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {role.name}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-2xl border px-3 py-1 text-xs font-semibold",
                          defaultRole
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 bg-slate-900/30 text-slate-200",
                        ].join(" ")}
                      >
                        {defaultRole ? "Default" : "Custom"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {typeof count === "number" ? count : "-"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="danger"
                        disabled={!canDelete}
                        onClick={() => remove(String(role.id), role.name)}
                      >
                        Delete
                      </Button>
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
