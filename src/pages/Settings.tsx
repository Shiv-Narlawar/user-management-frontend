import  { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/users.service";
import {
  CheckCircle2,
  Loader2,
  Moon,
  Save,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const roleLabel = getRoleLabel(user);
  const statusLabel = getStatusLabel(user);
  const email = user?.email ?? "";

  const [tab, setTab] = useState<Tab>("account");

  // ---------------- PROFILE ----------------
  const [name, setName] = useState<string>(user?.name ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
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

  // ---------------- PREFERENCES ----------------
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "dark"
  );

  const [compactTables, setCompactTables] = useState<boolean>(
    localStorage.getItem("pref_compactTables") === "true"
  );

  const [reduceMotion, setReduceMotion] = useState<boolean>(
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

  // ---------------- SECURITY ----------------
  const [loginAlerts, setLoginAlerts] = useState<boolean>(
    localStorage.getItem("sec_loginAlerts") !== "false"
  );

  const [twoFA, setTwoFA] = useState<boolean>(
    localStorage.getItem("sec_twoFA") === "true"
  );

  useEffect(() => {
    localStorage.setItem("sec_loginAlerts", String(loginAlerts));
  }, [loginAlerts]);

  useEffect(() => {
    localStorage.setItem("sec_twoFA", String(twoFA));
  }, [twoFA]);

  return (
    <div className="space-y-5">

      {/* HEADER */}
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

      {/* ACCOUNT TAB */}
      {tab === "account" && (
        <Card className="p-6">
          <div className="text-lg font-bold">Profile</div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="text-sm text-slate-400">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <div className="text-sm text-slate-400">Email</div>
              <Input value={email} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input value={roleLabel} readOnly />
              <Input value={statusLabel} readOnly />
            </div>

            {errorMsg && (
              <div className="text-rose-400 text-sm">{errorMsg}</div>
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
                <div className="flex items-center gap-2 text-emerald-300 text-sm">
                  <CheckCircle2 size={16} />
                  Saved
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* SECURITY TAB */}
      {tab === "security" && (
        <Card className="p-6">
          <div className="text-lg font-bold">Security</div>

          <div className="mt-5 flex gap-2">
            <Button onClick={() => navigate("/update-password")} className="gap-2">
              <Shield size={16} />
              Change password
            </Button>
          </div>

          <div className="mt-6 space-y-3">

            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <span>
                <div className="font-semibold text-slate-200">Login alerts</div>
                <div className="text-sm text-slate-400">Stored locally</div>
              </span>
              <input
                type="checkbox"
                checked={loginAlerts}
                onChange={(e) => setLoginAlerts(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <span>
                <div className="font-semibold text-slate-200">
                  Two-factor authentication
                </div>
                <div className="text-sm text-slate-400">UI toggle</div>
              </span>
              <input
                type="checkbox"
                checked={twoFA}
                onChange={(e) => setTwoFA(e.target.checked)}
              />
            </label>

          </div>
        </Card>
      )}

      {/* PREFERENCES TAB */}
      {tab === "preferences" && (
        <Card className="p-6">
          <div className="text-lg font-bold">Appearance</div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-slate-300">Theme</span>

            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              {theme}
            </Button>
          </div>

          <div className="mt-5 space-y-3">

            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <span className="text-slate-200">Compact tables</span>
              <input
                type="checkbox"
                checked={compactTables}
                onChange={(e) => setCompactTables(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <span className="text-slate-200">Reduce motion</span>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
            </label>

          </div>
        </Card>
      )}

    </div>
  );
}