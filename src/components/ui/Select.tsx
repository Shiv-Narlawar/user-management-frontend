import React from "react";
export function Select({ className="", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/35 ${className}`} {...props} />;
}
