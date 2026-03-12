import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

import { useToast } from "../../context/ToastContext";
import { requestPasswordReset } from "../../services/auth.service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { push } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());

      push("success", "Email verified. Set your new password.");

      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      push("error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100">
            Forgot Password
          </h1>

          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Enter your email address 
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            required
          />

          <Button
            disabled={loading}
            className="w-full"
            type="submit"
          >
            {loading ? "Verifying..." : "Continue"}
          </Button>

        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Remember your password?{" "}
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