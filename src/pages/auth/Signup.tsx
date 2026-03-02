import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

import { signup } from "../../services/auth.service";

type SignupRole = "USER" | "MANAGER";

type SignupForm = {
  name: string;
  email: string;
  role: SignupRole;
  password: string;
};

function passwordScore(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function passwordLabel(score: number): { label: string; cls: string } {
  if (score <= 1) return { label: "Weak", cls: "text-rose-300" };
  if (score === 2) return { label: "Okay", cls: "text-amber-300" };
  if (score === 3) return { label: "Good", cls: "text-sky-300" };
  return { label: "Strong", cls: "text-emerald-300" };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setUserFromAuth } = useAuth();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    role: "USER",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const score = useMemo(() => passwordScore(form.password), [form.password]);
  const strength = useMemo(() => passwordLabel(score), [score]);

  const onChange =
    <K extends keyof SignupForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      setForm((prev) => ({ ...prev, [key]: e.target.value as SignupForm[K] }));
    };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setUserFromAuth(res.user);
      showToast("Account created", "success");
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Admin is seeded. Choose User/Manager and continue.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={form.name}
            onChange={onChange("name")}
            placeholder="Your name"
            autoComplete="name"
            required
          />

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

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange("role")}
              className="w-full rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/35"
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange("password")}
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Password strength</span>
            <span className={`${strength.cls} font-semibold`}>
              {strength.label} ({score}/4)
            </span>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Account"}
          </Button>

          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-300 hover:text-blue-200 font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}