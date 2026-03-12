import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { resetPassword } from "../../services/auth.service";

function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { push } = useToast(); 
  const query = useQuery();

  const [email, setEmail] = useState<string>(query.get("email") ?? "");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const strength = useMemo(
    () => scorePassword(newPassword),
    [newPassword]
  );

  const passwordsMatch = newPassword === confirmPassword;

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (!passwordsMatch) {
      push("error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email: email.trim(),
        newPassword,
      });

      push("success", "Password updated successfully. Please login.");

      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Reset failed";

      push("error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="text-2xl font-bold">Reset Password</div>
        <div className="text-sm text-slate-400 mt-1">
          Set a new password for your account.
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />

          <Input
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
            required
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            type="password"
            required
          />

          <div className="text-xs text-slate-500">
            Strength score:{" "}
            <span className="text-slate-200 font-semibold">
              {strength}/4
            </span>

            {!passwordsMatch && confirmPassword.length > 0 && (
              <span className="ml-2 text-rose-300 font-semibold">
                Passwords do not match
              </span>
            )}
          </div>

          <Button
            disabled={loading || !passwordsMatch}
            className="w-full py-3 rounded-2xl"
            type="submit"
          >
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          <Link
            to="/login"
            className="text-blue-300 hover:text-blue-200 font-semibold"
          >
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}