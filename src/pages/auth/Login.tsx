import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck } from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

import { login } from "../../services/auth.service";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { setUserFromAuth } = useAuth();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const onChange =
    (key: keyof LoginForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = key === "remember" ? e.target.checked : e.target.value;

      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      push("error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!res.user) {
        throw new Error("Login failed");
      }

      setUserFromAuth(res.user);

      if (res.mustChangePassword) {
        push("info", "Please update your password to continue.");
        navigate("/update-password", { replace: true });
        return;
      }

      push("success", "Welcome back 👋");

      navigate("/app/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      push("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      <Card className="w-full max-w-md p-10 bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">

          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 mb-3">
            <ShieldCheck size={26} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            RBAC Manager
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Secure access control platform
          </p>

        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">

          <Input
            label="Email"
            type="email"
            name="email"
            icon={<Mail size={18} />}
            value={form.email}
            onChange={onChange("email")}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            icon={<Lock size={18} />}
            value={form.password}
            onChange={onChange("password")}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={onChange("remember")}
                className="accent-blue-500"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-400 hover:text-blue-300"
            >
              Forgot password?
            </Link>

          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
            <div className="flex-1 h-px bg-slate-800" />
            OR
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Signup */}
          <p className="text-sm text-slate-400 text-center">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Create one
            </Link>
          </p>

        </form>

      </Card>

    </div>
  );
}