import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";

import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { push } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordScore(newPassword), [newPassword]);
  const passwordsMatch = newPassword === confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      push("error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      push("success", "Password updated successfully. Please login again.");

      await signOut();
      navigate("/login", { replace: true });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      push("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-6 py-12">

      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-slate-900/80 border border-slate-800 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ShieldCheck size={34} className="text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-100">
            Update Password
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            For security reasons you must update your password before continuing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">

          <Input
            label="Current Password"
            type="password"
            icon={<Lock size={18} />}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            icon={<Lock size={18} />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={<Lock size={18} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* Password Strength */}
          <div className="text-xs text-slate-400">
            Password strength:{" "}
            <span className="font-semibold text-slate-200">
              {strength}/4
            </span>

            {!passwordsMatch && confirmPassword && (
              <span className="ml-2 text-rose-400 font-semibold">
                Passwords do not match
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="w-full py-3"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

        </form>

      </Card>

    </div>
  );
}