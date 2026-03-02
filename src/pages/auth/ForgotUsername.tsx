import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { forgotUsername } from "../../services/auth.service";

export default function ForgotUsername() {
  const toast = useToast();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotUsername({ emailOrPhone });
      toast.push("success", "Username sent to your registered email/phone (if exists).");
    } catch (err: any) {
      toast.push("error", err?.response?.data?.message ?? "Request failed. Check /auth/forgot-username.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="text-2xl font-bold">Forgot Username</div>
        <div className="text-sm text-slate-400 mt-1">We’ll send your username to the registered email/phone.</div>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Input value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} placeholder="Email or phone" required />
          <Button disabled={loading} className="w-full py-3 rounded-2xl">{loading ? "Sending…" : "Send username"}</Button>
        </form>
        <div className="mt-6 text-sm text-slate-400">
          <Link to="/login" className="text-blue-300 hover:text-blue-200 font-semibold">Back to sign in</Link>
        </div>
      </Card>
    </div>
  );
}
