import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../lib/api";

interface RoleRow {
  id: string;
  name: string;
}

interface PermissionRow {
  id: string;
  name: string; 
  description?: string | null;
}

type ListResponse<T> = { data: T[] } | T[];

function parsePermissionName(name: string): { module: string; action: string } {
  const idx = name.lastIndexOf("_");
  if (idx === -1) return { module: name, action: "UNKNOWN" };
  return { module: name.slice(0, idx), action: name.slice(idx + 1) };
}

export default function Permissions() {
  const { push } = useToast();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [roleId, setRoleId] = useState<string>("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadBase() {
    setLoading(true);
    try {
      const rolesRes = (await apiFetch("/roles")) as ListResponse<RoleRow>;
      const permsRes = (await apiFetch(
        "/permissions"
      )) as ListResponse<PermissionRow>;

      const rolesList = Array.isArray(rolesRes) ? rolesRes : rolesRes.data ?? [];
      const permsList = Array.isArray(permsRes) ? permsRes : permsRes.data ?? [];

      setRoles(rolesList);
      setPermissions(permsList);

      const firstRoleId = rolesList[0]?.id ? String(rolesList[0].id) : "";
      setRoleId(firstRoleId);
    } catch {
      push("error", "Failed to load roles/permissions");
      setRoles([]);
      setPermissions([]);
      setRoleId("");
    } finally {
      setLoading(false);
    }
  }

  async function loadRolePermissions(nextRoleId: string) {
    try {
      const res = (await apiFetch(
        `/roles/${nextRoleId}/permissions`
      )) as ListResponse<PermissionRow>;
      const list = Array.isArray(res) ? res : res.data ?? [];
      setSelectedIds(new Set(list.map((p) => String(p.id))));
    } catch {
      
      setSelectedIds(new Set());
    }
  }

  useEffect(() => {
    loadBase();
  }, []);

  useEffect(() => {
    if (!roleId) return;
    loadRolePermissions(roleId);
  }, [roleId]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    if (!roleId) return;

    setSaving(true);
    try {
      await apiFetch(`/roles/${roleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({
          permissionIds: Array.from(selectedIds),
        }),
      });

      push("success", "Permissions updated");
      await loadRolePermissions(roleId);
    } catch {
      push("error", "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  }

  const parsed = useMemo(() => {
    return permissions.map((p) => {
      const { module, action } = parsePermissionName(p.name);
      return { ...p, module, action };
    });
  }, [permissions]);

  const modules = useMemo(() => {
    return Array.from(new Set(parsed.map((p) => p.module))).sort();
  }, [parsed]);

  const actions = useMemo(() => {
    return Array.from(new Set(parsed.map((p) => p.action))).sort();
  }, [parsed]);

  const matrix = useMemo(() => {
    const map = new Map<string, PermissionRow & { module: string; action: string }>();
    parsed.forEach((p) => map.set(`${p.module}:${p.action}`, p));
    return map;
  }, [parsed]);

  const roleName = useMemo(
    () => roles.find((r) => String(r.id) === String(roleId))?.name ?? "Role",
    [roles, roleId]
  );

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-slate-400">Loading permissions…</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ADMIN
            </div>
            <div className="text-4xl font-extrabold mt-2">Permission Matrix</div>
            <div className="text-slate-400 mt-2">
              Assign permissions to roles. Selected role:{" "}
              <span className="text-slate-200 font-semibold">{roleName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-56 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none"
            >
              {roles.map((r) => (
                <option key={String(r.id)} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>

            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 overflow-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="px-3 py-2">Module</th>
              {actions.map((a) => (
                <th key={a} className="px-3 py-2">
                  {a}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {modules.map((mod) => (
              <tr key={mod} className="glass">
                <td className="px-3 py-3 font-semibold">{mod}</td>

                {actions.map((act) => {
                  const p = matrix.get(`${mod}:${act}`);
                  if (!p) {
                    return (
                      <td key={act} className="px-3 py-3 text-slate-600">
                        —
                      </td>
                    );
                  }

                  const id = String(p.id);
                  const checked = selectedIds.has(id);

                  return (
                    <td key={act} className="px-3 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                        />
                        <span
                          className={
                            checked
                              ? "text-blue-300 font-semibold"
                              : "text-slate-300"
                          }
                          title={p.description ?? p.name}
                        >
                          {act}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}