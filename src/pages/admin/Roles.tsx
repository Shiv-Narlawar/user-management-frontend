import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import type { RoleNode } from "../../types/rbac";
import { createRole, fetchRoles, updateRole } from "../../services/roles.service";

const demoRoles: RoleNode[] = [
  { id: 1, name: "Admin", parentRoleId: null, childRoleIds: [2, 3] },
  { id: 2, name: "Manager", parentRoleId: 1, childRoleIds: [3] },
  { id: 3, name: "User", parentRoleId: 2, childRoleIds: [] }
];

export default function Roles() {
  const toast = useToast();
  const [roles, setRoles] = useState<RoleNode[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<RoleNode | null>(null);
  const [name, setName] = useState("");
  const [parentRoleId, setParentRoleId] = useState<string>("");
  const [childRoleIds, setChildRoleIds] = useState<string[]>([]);

  async function load() {
    try { const data = await fetchRoles(); setRoles(data); setDemoMode(false); }
    catch { setRoles(demoRoles); setDemoMode(true); }
  }
  useEffect(() => { load(); }, []);
  const opts = useMemo(() => roles.map(r => ({ id: String(r.id), name: r.name })), [roles]);

  function openCreate() { setEdit(null); setName(""); setParentRoleId(""); setChildRoleIds([]); setOpen(true); }
  function openEdit(r: RoleNode) { setEdit(r); setName(r.name); setParentRoleId(r.parentRoleId ? String(r.parentRoleId) : ""); setChildRoleIds((r.childRoleIds ?? []).map(String)); setOpen(true); }

  async function save() {
    try {
      if (!edit) {
        const created = await createRole({ name, parentRoleId: parentRoleId || null, childRoleIds });
        setRoles((x) => [created, ...x]);
        toast.push("success","Role created");
      } else {
        const updated = await updateRole(edit.id, { name, parentRoleId: parentRoleId || null, childRoleIds });
        setRoles((x) => x.map(r => r.id === edit.id ? updated : r));
        toast.push("success","Role updated");
      }
    } catch {
      if (!edit) setRoles((x) => [{ id: Date.now(), name, parentRoleId: parentRoleId || null, childRoleIds }, ...x]);
      else setRoles((x) => x.map(r => r.id === edit.id ? { ...r, name, parentRoleId: parentRoleId || null, childRoleIds } : r));
      toast.push("info","Backend not connected — saved locally (demo).");
    } finally { setOpen(false); }
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">ADMIN</div>
            <div className="text-4xl font-extrabold mt-2">Role Hierarchy</div>
            <div className="text-slate-400 mt-2">{demoMode ? "Demo mode." : "Connected to backend."}</div>
          </div>
          <Button className="h-12 px-5 rounded-2xl" onClick={openCreate}>Create Role</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {roles.map(r => (
          <Card key={String(r.id)} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-bold">{r.name}</div>
                <div className="text-sm text-slate-400 mt-1">Parent: <span className="text-slate-200 font-semibold">{r.parentRoleId ? (opts.find(o => o.id===String(r.parentRoleId))?.name ?? "—") : "—"}</span></div>
                <div className="text-sm text-slate-400 mt-1">Children: <span className="text-slate-200 font-semibold">{(r.childRoleIds ?? []).length ? (r.childRoleIds ?? []).map(id => opts.find(o => o.id===String(id))?.name ?? id).join(", ") : "—"}</span></div>
              </div>
              <Button variant="secondary" className="rounded-2xl" onClick={() => openEdit(r)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} title={edit ? "Edit Role" : "Create Role"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Role name" />
          <Select value={parentRoleId} onChange={(e) => setParentRoleId(e.target.value)}>
            <option value="">No parent</option>
            {opts.filter(o => !edit || o.id !== String(edit.id)).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
          <div className="text-sm font-semibold">Child Role(s)</div>
          <div className="grid grid-cols-2 gap-2">
            {opts.filter(o => !edit || o.id !== String(edit.id)).map(o => {
              const checked = childRoleIds.includes(o.id);
              return (
                <label key={o.id} className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2">
                  <input type="checkbox" checked={checked} onChange={(e) => setChildRoleIds(prev => e.target.checked ? [...prev,o.id] : prev.filter(x=>x!==o.id))} />
                  <span className="text-sm">{o.name}</span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
