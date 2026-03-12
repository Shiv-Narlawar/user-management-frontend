import React from "react";

type Variant = "default" | "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    default: "bg-blue-600 hover:bg-blue-500 text-white shadow-glow",
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-glow",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-100 border border-slate-800",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};