import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/users.service";
import { CheckCircle2, Loader2, Moon, Save, Shield, Sun, User } from "lucide-react";
import type { AuthUser } from "../services/auth.service";

type Tab = "account" | "security" | "preferences";
type Theme = "dark" | "light";

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

function getRoleLabel(u: AuthUser | null): string {
  if (!u) return "USER";

  const obj = u as unknown as Record<string, unknown>;
  const role = obj["role"];
  const roleName = obj["roleName"];

  if (typeof role === "string" && role.trim()) return role;
  if (typeof roleName === "string" && roleName.trim()) return roleName;

  return "USER";
}

function getStatusLabel(u: AuthUser | null): string {
  if (!u) return "—";

  const obj = u as unknown as Record<string, unknown>;
  const status = obj["status"];
  return typeof status === "string" && status.trim() ? status : "—";
}

export default function SettingsPage() {
  const { user, patchUserLocal } = useAuth();

  const roleLabel = getRoleLabel(user);
  const statusLabel = getStatusLabel(user);
  const email = user?.email ?? "";

  const [tab, setTab] = useState<Tab>("account");

  // -------------------- Profile --------------------
  const [name, setName] = useState(user?.name ?? "");
  useEffect(() => setName(user?.name ?? ""), [user?.name]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSave = useMemo(() => {
    const trimmed = name.trim();
    return Boolean(trimmed) && trimmed !== (user?.name ?? "").trim() && !saving;
  }, [name, user?.name, saving]);

  async function onSaveProfile() {
    const trimmed = name.trim();
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);

    try {
      const updated = await updateMyProfile({ name: trimmed });

      // ✅ instant UI update in AppShell (top bar + sidebar)
      patchUserLocal({ name: updated.name });

      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  // -------------------- Preferences (localStorage) --------------------
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "dark"
  );
  const [compactTables, setCompactTables] = useState(
    localStorage.getItem("pref_compactTables") === "true"
  );
  const [reduceMotion, setReduceMotion] = useState(
    localStorage.getItem("pref_reduceMotion") === "true"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pref_compactTables", String(compactTables));
  }, [compactTables]);

  useEffect(() => {
    localStorage.setItem("pref_reduceMotion", String(reduceMotion));
  }, [reduceMotion]);

  // -------------------- Security toggles (UI only) --------------------
  const [loginAlerts, setLoginAlerts] = useState(
    localStorage.getItem("sec_loginAlerts") !== "false"
  );
  const [twoFA, setTwoFA] = useState(localStorage.getItem("sec_twoFA") === "true");

  useEffect(() => {
    localStorage.setItem("sec_loginAlerts", String(loginAlerts));
  }, [loginAlerts]);

  useEffect(() => {
    localStorage.setItem("sec_twoFA", String(twoFA));
  }, [twoFA]);

  return (
    <div className="space-y-5">
      {/* Header + Tabs */}
      <Card className="p-6">
        <div className="text-4xl font-extrabold">Settings</div>
        <div className="text-slate-400 mt-2">
          Update your profile, security options, and preferences.
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setTab("account")}
            className={cx(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border transition",
              tab === "account"
                ? "bg-blue-600/15 text-blue-200 border-blue-500/25"
                : "bg-slate-900/30 text-slate-300 border-slate-800 hover:bg-slate-900/50"
            )}
          >
            <User size={16} />
            Account
          </button>

          <button
            onClick={() => setTab("security")}
            className={cx(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border transition",
              tab === "security"
                ? "bg-blue-600/15 text-blue-200 border-blue-500/25"
                : "bg-slate-900/30 text-slate-300 border-slate-800 hover:bg-slate-900/50"
            )}
          >
            <Shield size={16} />
            Security
          </button>

          <button
            onClick={() => setTab("preferences")}
            className={cx(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border transition",
              tab === "preferences"
                ? "bg-blue-600/15 text-blue-200 border-blue-500/25"
                : "bg-slate-900/30 text-slate-300 border-slate-800 hover:bg-slate-900/50"
            )}
          >
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            Preferences
          </button>
        </div>
      </Card>

      {/* ACCOUNT */}
      {tab === "account" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-lg font-bold">Profile</div>
            <div className="mt-2 text-sm text-slate-400">
              You can update your own display name.
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-sm text-slate-400">Name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <div className="text-sm text-slate-400">Email</div>
                <Input value={email} readOnly />
                <div className="mt-1 text-xs text-slate-500">
                  Email is read-only (recommended).
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-slate-400">Role</div>
                  <Input value={roleLabel} readOnly />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Status</div>
                  <Input value={statusLabel} readOnly />
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={onSaveProfile} disabled={!canSave} className="gap-2">
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save changes"}
                </Button>

                {saved && (
                  <div className="inline-flex items-center gap-2 text-sm text-emerald-300">
                    <CheckCircle2 size={16} />
                    Saved
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-bold">Account summary</div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <div className="text-sm text-slate-400">Signed in as</div>
                <div className="mt-1 font-semibold text-slate-200">{email || "—"}</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <div className="text-sm text-slate-400">Access model</div>
                <div className="mt-1 text-slate-200"> (RBAC)</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SECURITY */}
      {tab === "security" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-lg font-bold">Password</div>
            <div className="mt-2 text-sm text-slate-400">
              Change your password
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => (window.location.href = "/update-password")} className="gap-2">
                <Shield size={16} />
                Change password
              </Button>

              <Button variant="ghost" disabled title="Optional backend feature">
                Log out all sessions
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-bold">Security controls</div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <span>
                  <div className="font-semibold text-slate-200">Login alerts</div>
                  <div className="text-sm text-slate-400">Stored locally </div>
                </span>
                <input
                  type="checkbox"
                  checked={loginAlerts}
                  onChange={(e) => setLoginAlerts(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <span>
                  <div className="font-semibold text-slate-200">Two-factor authentication</div>
                  <div className="text-sm text-slate-400">UI toggle</div>
                </span>
                <input
                  type="checkbox"
                  checked={twoFA}
                  onChange={(e) => setTwoFA(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* PREFERENCES */}
      {tab === "preferences" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-lg font-bold">Appearance</div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <div>
                <div className="font-semibold text-slate-200">Theme</div>
                <div className="text-sm text-slate-400">Light / Dark</div>
              </div>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              >
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                {theme === "dark" ? "Dark" : "Light"}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-bold">UI preferences</div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <span>
                  <div className="font-semibold text-slate-200">Compact tables</div>
                  <div className="text-sm text-slate-400">Denser rows in tables</div>
                </span>
                <input
                  type="checkbox"
                  checked={compactTables}
                  onChange={(e) => setCompactTables(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <span>
                  <div className="font-semibold text-slate-200">Reduce motion</div>
                  <div className="text-sm text-slate-400">Disable animations</div>
                </span>
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(e) => setReduceMotion(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}