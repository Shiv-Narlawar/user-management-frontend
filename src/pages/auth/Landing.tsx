import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";

const highlights = [
  {
    title: "Role-driven access",
    description: "Organize access by role, permission, and team structure without losing control.",
    icon: LockKeyhole,
  },
  {
    title: "Department visibility",
    description: "Keep managers, users, and department membership aligned from one workspace.",
    icon: Building2,
  },
  {
    title: "Audit-ready flow",
    description: "Support accountable operations with consistent, secure administrative actions.",
    icon: BadgeCheck,
  },
];

const stats = [
  { label: "Auth Provider", value: "Auth0" },
  { label: "Access Model", value: "RBAC" },
  { label: "Workspace", value: "Unified" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(16,185,129,0.10),transparent_24%),linear-gradient(180deg,#08111e_0%,#0b1324_55%,#07101b_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-sky-300 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
              <ShieldCheck size={22} />
            </div>

            <div>
              <div className="text-base font-semibold tracking-wide text-slate-100">
                RBAC Manager
              </div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Secure Access Platform
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="rounded-full border border-slate-700/80 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-800/80"
          >
            Sign In
          </button>
        </header>

        <main className="flex flex-1 items-center py-12 lg:py-16">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <section className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                <Users size={15} />
                Built for teams using centralized Auth0 sign-in
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white md:text-6xl">
                Professional access control for teams that need structure, speed, and trust.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Manage users, departments, managers, and permissions through one secure workspace.
                Authentication is handled through Auth0, so your team signs in through a single trusted flow.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-[0_18px_60px_rgba(14,165,233,0.28)] transition hover:bg-sky-400"
                >
                  Continue to Sign In
                  <ArrowRight size={18} />
                </button>

                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/45 px-5 py-3.5 text-sm leading-6 text-slate-300">
                  No public sign-up.
                  <br />
                  Access is provisioned through your organization.
                </div>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-800/90 bg-slate-950/50 px-5 py-4 backdrop-blur-sm"
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-xl font-bold text-slate-100">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="lg:pl-4">
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-950/60 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                      Platform Overview
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      Secure entry, clear governance
                    </div>
                  </div>

                  <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {highlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-slate-800 p-3 text-sky-300">
                            <Icon size={18} />
                          </div>

                          <div>
                            <div className="text-base font-semibold text-slate-100">
                              {item.title}
                            </div>
                            <div className="mt-1 text-sm leading-6 text-slate-400">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/8 p-4">
                <div className="text-sm font-semibold text-emerald-200">
                  Authentication note
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-300">
                    Users sign in through Auth0. Account access and onboarding are managed internally, not through public self-registration.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
