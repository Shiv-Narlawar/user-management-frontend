import React, { useEffect } from "react";
import { X } from "lucide-react";
export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl glass rounded-3xl shadow-glow p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800/70"><X size={18} /></button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
