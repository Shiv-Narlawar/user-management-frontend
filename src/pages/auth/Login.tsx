import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

import { login } from "../../services/auth.service";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setUserFromAuth } = useAuth();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const onChange =
    (key: keyof LoginForm) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({
        email: form.email.trim(),
        password: form.password,
      });

      setUserFromAuth(res.user);
      showToast("Login successful", "success");
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-100">Sign In</h1>
          <p className="mt-1 text-sm text-slate-400">
            Use your credentials to access the dashboard.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
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
            value={form.password}
            onChange={onChange("password")}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-blue-300 hover:text-blue-200">
              Forgot password?
            </Link>
            <Link to="/forgot-username" className="text-blue-300 hover:text-blue-200">
              Forgot username?
            </Link>
          </div>

          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-blue-300 hover:text-blue-200 font-semibold">
              Create one
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}