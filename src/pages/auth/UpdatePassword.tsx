import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { push } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-100">
          Update Password
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          For security reasons, you must change your password before continuing.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}