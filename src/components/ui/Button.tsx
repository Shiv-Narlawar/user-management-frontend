import React from "react";
type Variant = "primary" | "secondary" | "ghost" | "danger";
export function Button({ variant="primary", className="", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles: Record<Variant,string> = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-glow",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-100 border border-slate-800",
    danger: "bg-rose-600 hover:bg-rose-500 text-white"
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
