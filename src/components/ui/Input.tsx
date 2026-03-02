import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className = "", ...props },
  ref
) {
  return (
    <div className="space-y-2">
      {label ? <label className="text-sm text-slate-300">{label}</label> : null}

      <input
        ref={ref}
        className={[
          "w-full rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-2 text-sm",
          "text-slate-100 placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/35",
          className,
        ].join(" ")}
        {...props}
      />
    </div>
  );
});