import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/users.service";
import { useToast } from "../context/ToastContext";
import { changePassword } from "../services/auth.service";
import {
  CheckCircle2,
  Loader2,
  Moon,
  Save,
  Shield,
  Sun,
} from "lucide-react";
import type { AuthUser } from "../services/auth.service";

type Tab = "account" | "security" | "preferences";
type Theme = "dark" | "light";

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

function getRoleLabel(u: AuthUser | null): string {
  return u?.role ?? "USER";
}

function getStatusLabel(u: AuthUser | null): string {
  return u?.status ?? "—";
}

export default function SettingsPage() {
  const { user, patchUserLocal, signOut } = useAuth();
  const { push } = useToast();

  const roleLabel = getRoleLabel(user);
  const statusLabel = getStatusLabel(user);
  const email = user?.email ?? "";

  const [tab, setTab] = useState<Tab>("account");

  // profile
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const canSave = useMemo(() => {
    return name.trim() && name !== user?.name && !saving;
  }, [name, user?.name, saving]);

  async function onSaveProfile() {
    try {
      setSaving(true);

      const updated = await updateMyProfile({
        name: name.trim(),
      });

      patchUserLocal({ name: updated.name });

      setSaved(true);
      setTimeout(() => setSaved(false), 1200);

      push("success", "Profile updated");
    } catch {
      push("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  // auth0 reset
  async function handleChangePassword() {
  try {
    await changePassword(email);

    push(
      "success",
      "Password reset email sent. Please sign in again after updating your password."
    );

    setTimeout(() => {
      void signOut();
    }, 1200);
  } catch {
    push("error", "Failed to send reset email");
  }
}

  // theme
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ACCOUNT
            </div>

            <div className="text-4xl font-extrabold mt-2">
              Settings
            </div>

            <div className="text-slate-400 mt-2">
              Manage your profile, security and preferences
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {(["account", "security", "preferences"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx(
                "px-4 py-2 rounded-2xl text-sm font-semibold border transition",
                tab === t
                  ? "bg-blue-600/15 text-blue-200 border-blue-500/25"
                  : "bg-slate-900/30 text-slate-300 border-slate-800 hover:bg-slate-900/50"
              )}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </Card>

      {/* ACCOUNT */}
      {tab === "account" && (
        <Card className="p-6 space-y-5">
          <div className="text-lg font-bold">Profile</div>

          <div className="space-y-4">

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

      {/* SECURITY */}
      {tab === "security" && (
  <Card className="p-6">
    <div className="text-lg font-bold">Security</div>

    <div className="mt-5 space-y-4">

      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
        
        <div>
          <div className="text-sm font-semibold text-slate-200">
            Password
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Reset your password via email
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleChangePassword}
          className="gap-2"
        >
          <Shield size={14} />
          Change
        </Button>

      </div>

    </div>
  </Card>
)}

      {/* PREFERENCES */}
      {tab === "preferences" && (
        <Card className="p-6 space-y-5">
          <div className="text-lg font-bold">Appearance</div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Theme</span>

            <Button
              variant="ghost"
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              {theme}
            </Button>
          </div>

          <div className="text-sm text-slate-400">
            Light theme is experimental
          </div>
        </Card>
      )}
    </div>
  );
}
