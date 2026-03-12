import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen app-bg flex items-center justify-center px-6 text-white overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl text-center fade-in">
        {/* Brand */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
            <ShieldCheck size={22} />
          </div>

          <div className="text-left">
            <h1 className="text-lg font-semibold tracking-wide text-white">
              RBAC Manager
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Access Control Platform
            </p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
          Secure access management for modern teams
        </h2>

        {/* Description */}
        <p className="mt-6 text-base text-slate-400">
  A simple platform to manage users, roles, and permissions securely.
</p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate("/login")}
            className="rounded-xl bg-blue-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-blue-900/30 transition duration-300 hover:bg-blue-700"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="rounded-xl border border-slate-700 bg-slate-800 px-7 py-3 text-base font-semibold text-white transition duration-300 hover:bg-slate-700"
          >
            Create Account
          </button>
        </div>

        {/* Footer */}
        <p className="mt-14 text-sm text-slate-500">
          Built for teams that require secure and structured access control.
        </p>
      </div>
    </div>
  );
}