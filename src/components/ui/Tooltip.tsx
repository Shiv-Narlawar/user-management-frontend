import React, { useState } from "react";
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span className="absolute z-50 -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 border border-slate-700 px-3 py-1 text-xs text-slate-200 shadow-glow">
          {label}
        </span>
      )}
    </span>
  );
}
