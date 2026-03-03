import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className = "", type, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType =
      isPassword && showPassword ? "text" : type;

    return (
      <div className="space-y-2">
        {label ? (
          <label className="text-sm text-slate-300">
            {label}
          </label>
        ) : null}

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={[
              "w-full rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-2 text-sm",
              "text-slate-100 placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/35",
              isPassword ? "pr-10" : "",
              className,
            ].join(" ")}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);