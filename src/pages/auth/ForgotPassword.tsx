import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { requestPasswordReset } from "../../services/auth.service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { push } = useToast(); // ✅ Correct

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());

      push("success", "Email verified. Set your new password.");

      navigate(
        `/reset-password?email=${encodeURIComponent(email.trim())}`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Request failed";

      push("error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="text-2xl font-bold">Forgot Password</div>
        <div className="text-sm text-slate-400 mt-1">
          Enter your email to continue.
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
          <Button
            disabled={loading}
            className="w-full py-3 rounded-2xl"
            type="submit"
          >
            {loading ? "Checking…" : "Continue"}
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