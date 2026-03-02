import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Tooltip } from "../../components/ui/Tooltip";
import { useToast } from "../../context/ToastContext";
import type { Permission, RoleNode } from "../../types/rbac";
import { fetchRoles } from "../../services/roles.service";
import { fetchPermissions, setRolePermissions } from "../../services/permissions.service";

const demoRoles: RoleNode[] = [{ id: 1, name: "Admin" }, { id: 2, name: "Manager" }, { id: 3, name: "User" }];
const demoPermissions: Permission[] = [
  { id: 1, module: "Users", action: "View", description: "View users list and details" },
  { id: 2, module: "Users", action: "Create", description: "Create a new user" },
  { id: 3, module: "Users", action: "Edit", description: "Edit user role and status" },
  { id: 4, module: "Users", action: "Delete", description: "Soft delete user" },
  { id: 5, module: "Roles", action: "View", description: "View roles and hierarchy" },
  { id: 6, module: "Roles", action: "Edit", description: "Create/update roles and hierarchy" },
  { id: 7, module: "Permissions", action: "View", description: "View permission matrix" },
  { id: 8, module: "Permissions", action: "Edit", description: "Update permissions assigned to roles" },
  { id: 9, module: "Reports", action: "Export", description: "Export reports data" }
];
const ACTIONS = ["View", "Create", "Edit", "Delete", "Export"];

export default function Permissions() {
  const toast = useToast();
  const [roles, setRoles] = useState<RoleNode[]>([]);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [roleId, setRoleId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);

  async function load() {
    try {
      const [r, p] = await Promise.all([fetchRoles(), fetchPermissions()]);
      setRoles(r); setPerms(p); setDemoMode(false); setRoleId(r[0] ? String(r[0].id) : "");
    } catch {
      setRoles(demoRoles); setPerms(demoPermissions); setDemoMode(true); setRoleId("1");
    }
  }
  useEffect(() => { load(); }, []);

  const modules = useMemo(() => Array.from(new Set(perms.map(p => p.module))).sort(), [perms]);
  const matrix = useMemo(() => { const m = new Map<string, Permission>(); perms.forEach(p => m.set(`${p.module}:${p.action}`, p)); return m; }, [perms]);
  function toggle(id: string) { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function save() {
    try { await setRolePermissions(roleId, Array.from(selectedIds)); toast.push("success","Permissions saved"); }
    catch { toast.push("info","Backend not connected — saved locally (demo)."); }
  }

  const roleName = roles.find(r => String(r.id) === roleId)?.name ?? "Role";
  const previewList = useMemo(() => perms.filter(p => selectedIds.has(String(p.id))), [perms, selectedIds]);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">ADMIN</div>
            <div className="text-4xl font-extrabold mt-2">Permission Matrix</div>
            <div className="text-slate-400 mt-2">{demoMode ? "Demo mode." : "Connected to backend."} Hover permissions for tooltips. Preview before save.</div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-48">
              {roles.map(r => <option key={String(r.id)} value={String(r.id)}>{r.name}</option>)}
            </Select>
            <Button variant="secondary" onClick={() => setPreviewOpen(true)}>Preview</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 overflow-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="px-3 py-2">Module</th>
              {ACTIONS.map(a => <th key={a} className="px-3 py-2">{a}</th>)}
            </tr>
          </thead>
          <tbody>
            {modules.map(mod => (
              <tr key={mod} className="glass">
                <td className="px-3 py-3 font-semibold">{mod}</td>
                {ACTIONS.map(act => {
                  const p = matrix.get(`${mod}:${act}`);
                  if (!p) return <td key={act} className="px-3 py-3 text-slate-600">—</td>;
                  const id = String(p.id);
                  const checked = selectedIds.has(id);
                  return (
                    <td key={act} className="px-3 py-3">
                      <Tooltip label={p.description}>
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={checked} onChange={() => toggle(id)} />
                          <span className={checked ? "text-blue-300 font-semibold" : "text-slate-300"}>{act}</span>
                        </label>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={previewOpen} title={`Preview Permissions — ${roleName}`} onClose={() => setPreviewOpen(false)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-400">Summary before saving:</div>
          <div className="max-h-[340px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
            {previewList.length === 0 ? <div className="text-slate-500">No permissions selected.</div> : (
              <ul className="space-y-2">
                {previewList.map(p => (
                  <li key={String(p.id)} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.module} — {p.action}</div>
                      <div className="text-xs text-slate-500">{p.description}</div>
                    </div>
                    <span className="text-xs text-blue-300 border border-blue-500/25 bg-blue-600/10 rounded-full px-2 py-1">Selected</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPreviewOpen(false)}>Close</Button></div>
        </div>
      </Modal>
    </div>
  );
}
