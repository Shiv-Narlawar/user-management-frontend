import React from "react";
import { Card } from "../../components/ui/Card";

export default function Audit() {
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="text-blue-300 text-sm font-semibold tracking-widest">ADMIN</div>
        <div className="text-4xl font-extrabold mt-2">Audit</div>
        <div className="text-slate-400 mt-2">Placeholder for audit logs (future-ready).</div>
      </Card>
      <Card className="p-5">
        <div className="text-sm text-slate-400">Example events</div>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="text-slate-200">• User status changed</li>
          <li className="text-slate-200">• Role updated: Manager </li>
          <li className="text-slate-200">• Permission updated: Users.Edit enabled for Manager</li>
        </ul>
      </Card>
    </div>
  );
}
