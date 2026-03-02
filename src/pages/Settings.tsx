import React from "react";
import { Card } from "../components/ui/Card";
import { env } from "../lib/env";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="text-4xl font-extrabold">Settings</div>
        <div className="text-slate-400 mt-2">Environment + integration notes.</div>
      </Card>
      <Card className="p-5">
        <div className="text-sm text-slate-400">Current API base URL</div>
        <div className="mt-2 font-mono text-sm text-slate-200">{env.API_BASE_URL}</div>
        <div className="mt-3 text-sm text-slate-400">
          Create <span className="text-slate-200 font-semibold">.env</span> and set <span className="text-slate-200 font-semibold">VITE_API_BASE_URL</span>.
        </div>
      </Card>
    </div>
  );
}
