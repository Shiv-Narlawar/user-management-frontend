import {
  ArrowRight,
  Building2,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "../../context/ToastContext";

export default function Landing() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const { push } = useToast();

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          redirect_uri: window.location.origin,
          prompt: "login",
        },
        appState: {
          returnTo: "/app",
        },
      });
    } catch {
      push("error", "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300">
              <ShieldCheck size={22} />
            </div>

            <div>
              <div className="text-base font-semibold text-slate-100">
                User Management Application
              </div>
              <div className="text-sm text-slate-400">
                RBAC Access Control
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Sign In
          </button>
        </header>

        <main className="flex flex-1 items-center py-16">
          <section className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-8 shadow-2xl md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-sm text-slate-300">
                <ShieldCheck size={16} />
                User Management + RBAC
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                Secure user access, role control, and department ownership in one place.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                This application is built for managing users, assigning roles,
                organizing departments, and controlling permissions with RBAC.
                Access is limited to authorized users only.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Continue to Login
                  <ArrowRight size={18} />
                </button>

                <div className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                  Auth0 secured sign-in
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3 text-sky-300">
                  <Users size={18} />
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                    Core Scope
                  </div>
                </div>

                <div className="mt-4 space-y-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    Manage users with clear role assignments.
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    Organize teams and departments with controlled access.
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    Protect actions using role-based permissions.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/55 p-5">
                  <div className="flex items-center gap-3 text-slate-100">
                    <KeyRound size={18} className="text-emerald-300" />
                    <div className="font-semibold">Authentication</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Hosted login with Auth0 and protected application routes.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/55 p-5">
                  <div className="flex items-center gap-3 text-slate-100">
                    <Building2 size={18} className="text-amber-300" />
                    <div className="font-semibold">Administration</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Admins manage users, managers, departments, and permission-driven access.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
