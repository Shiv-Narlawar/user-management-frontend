import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
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

interface ParsedPermission extends PermissionRow {
  module: string;
  action: string;
}

type ListResponse<T> = { data: T[] } | T[];

function parsePermissionName(name: string) {
  const idx = name.lastIndexOf("_");

  if (idx === -1) {
    return { module: name, action: "UNKNOWN" };
  }

  return {
    module: name.slice(0, idx),
    action: name.slice(idx + 1),
  };
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

export default function Permissions() {
  const { push } = useToast();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [roleId, setRoleId] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");

  // Load roles + permissions
  async function loadBase() {
    setLoading(true);

    try {
      const rolesRes = (await apiFetch("/roles")) as ListResponse<RoleRow>;
      const permsRes = (await apiFetch("/permissions")) as ListResponse<PermissionRow>;

      const rolesList = Array.isArray(rolesRes) ? rolesRes : rolesRes.data ?? [];
      const permsList = Array.isArray(permsRes) ? permsRes : permsRes.data ?? [];

      setRoles(rolesList);
      setPermissions(permsList);

      if (rolesList.length > 0) {
        setRoleId(String(rolesList[0].id));
      }
    } catch {
      push("error", "Failed to load roles or permissions");
    } finally {
      setLoading(false);
    }
  }

  // Load permissions assigned to role
  async function loadRolePermissions(nextRoleId: string) {
    try {
      const res = (await apiFetch(
        `/roles/${nextRoleId}/permissions`
      )) as { permissions: string[] };

      const names = res.permissions ?? [];

      const ids = permissions
        .filter((p) => names.includes(p.name))
        .map((p) => String(p.id));

      setSelectedIds(new Set(ids));
    } catch {
      setSelectedIds(new Set());
    }
  }

  useEffect(() => {
    void loadBase();
  }, []);

  useEffect(() => {
    if (!roleId || permissions.length === 0) return;
    void loadRolePermissions(roleId);
  }, [roleId, permissions]);

  // Toggle checkbox
  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }

  // Select all / clear
  function setMany(ids: string[], checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      ids.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });

      return next;
    });
  }

  // Save permissions
  async function save() {
    if (!roleId) return;

    setSaving(true);

    try {
      const permissionNames = permissions
        .filter((p) => selectedIds.has(String(p.id)))
        .map((p) => p.name);

      await apiFetch(`/roles/${roleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({
          permissions: permissionNames,
        }),
      });

      push("success", "Permissions updated successfully");

      await loadRolePermissions(roleId);
    } catch (err) {
      console.error(err);
      push("error", "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  }

  const parsed = useMemo<ParsedPermission[]>(() => {
    return permissions.map((p) => {
      const { module, action } = parsePermissionName(p.name);
      return { ...p, module, action };
    });
  }, [permissions]);

  const filtered = useMemo(() => {
    const query = norm(q);

    if (!query) return parsed;

    return parsed.filter((p) => {
      const hay = `${p.module} ${p.action} ${p.name}`.toLowerCase();
      return hay.includes(query);
    });
  }, [parsed, q]);

  const modules = useMemo(() => {
    return Array.from(new Set(filtered.map((p) => p.module))).sort();
  }, [filtered]);

  const actions = useMemo(() => {
    return Array.from(new Set(filtered.map((p) => p.action))).sort();
  }, [filtered]);

  const matrix = useMemo<Map<string, ParsedPermission>>(() => {
    const map = new Map<string, ParsedPermission>();

    filtered.forEach((p) => {
      map.set(`${p.module}:${p.action}`, p);
    });

    return map;
  }, [filtered]);

  const visiblePermissionIds = useMemo(
    () => filtered.map((p) => String(p.id)),
    [filtered]
  );

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-slate-400">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ADMIN
            </div>

            <div className="text-4xl font-extrabold mt-2">
              Permission Matrix
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-56 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm"
              >
                {roles.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>

              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search permissions..."
                className="w-80"
              />

              <Button
                variant="ghost"
                onClick={() => setMany(visiblePermissionIds, true)}
              >
                Select All
              </Button>

              <Button
                variant="ghost"
                onClick={() => setMany(visiblePermissionIds, false)}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Matrix */}
      <Card className="p-0 overflow-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="border-b border-slate-800 bg-slate-950/40">
            <tr>
              <th className="px-4 py-3 text-left">Module</th>

              {actions.map((act) => (
                <th key={act} className="px-4 py-3 text-left">
                  {act}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {modules.map((mod) => (
              <tr key={mod} className="border-b border-slate-800">
                <td className="px-4 py-3 font-semibold">{mod}</td>

                {actions.map((act) => {
                  const p = matrix.get(`${mod}:${act}`);

                  if (!p) {
                    return (
                      <td key={act} className="px-4 py-3 text-slate-600">
                        —
                      </td>
                    );
                  }

                  const id = String(p.id);
                  const checked = selectedIds.has(id);

                  return (
                    <td key={act} className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(id)}
                        className="h-4 w-4"
                      />
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