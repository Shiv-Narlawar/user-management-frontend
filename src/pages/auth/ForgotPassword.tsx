import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { requestPasswordReset, resetPassword } from "../../services/auth.service";

function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => scorePassword(newPassword), [newPassword]);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      
      showToast("Reset code generated. Check your email only if email sending is configured.", "success");
      setStep("reset");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword });
      showToast("Password reset successful. You can sign in now.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="text-2xl font-bold">Forgot Password</div>
        <div className="text-sm text-slate-400 mt-1">
          Generate a reset code and set a new password.
        </div>

        {step === "request" ? (
          <form onSubmit={onRequest} className="mt-6 space-y-3">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
            />
            <Button disabled={loading} className="w-full py-3 rounded-2xl">
              {loading ? "Sending…" : "Generate reset code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={onReset} className="mt-6 space-y-3">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
            />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              required
            />
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              type="password"
              required
            />
            <div className="text-xs text-slate-500">
              Strength score:{" "}
              <span className="text-slate-200 font-semibold">{strength}/4</span>
            </div>
            <Button disabled={loading} className="w-full py-3 rounded-2xl">
              {loading ? "Resetting…" : "Reset password"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-sm text-slate-400">
          <Link to="/login" className="text-blue-300 hover:text-blue-200 font-semibold">
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}