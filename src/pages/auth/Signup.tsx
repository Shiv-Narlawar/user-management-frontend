import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Shield } from "lucide-react";

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

function passwordLabel(score: number) {
  if (score <= 1) return { label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { label: "Okay", color: "bg-amber-500" };
  if (score === 3) return { label: "Good", color: "bg-sky-500" };
  return { label: "Strong", color: "bg-emerald-500" };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { setUserFromAuth } = useAuth();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    role: "USER",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const score = useMemo(() => passwordScore(form.password), [form.password]);
  const strength = useMemo(() => passwordLabel(score), [score]);

  const onChange =
    <K extends keyof SignupForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value as SignupForm[K],
      }));
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

      if (!res.token || !res.user) {
        throw new Error("Signup failed");
      }

      setUserFromAuth(res.user);

      push("success", "Account created successfully");
      navigate("/app/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      push("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-10 backdrop-blur-xl bg-slate-900/80 border border-slate-800 shadow-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Access the RBAC User Management platform
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">

          {/* Name */}
          <Input
            label="Full Name"
            type="text"
            value={form.name}
            onChange={onChange("name")}
            icon={<User size={18} />}
            required
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            icon={<Mail size={18} />}
            required
          />

          {/* Role */}
          <div>
            <label className="text-sm text-slate-300 mb-1 block">
              Role
            </label>

            <div className="relative">
              <Shield
                size={16}
                className="absolute left-3 top-3 text-slate-400"
              />

              <select
                value={form.role}
                onChange={onChange("role")}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={onChange("password")}
            icon={<Lock size={18} />}
            required
          />

          {/* Password Strength */}
          {form.password && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Password strength</span>
                <span className="text-slate-300 font-medium">
                  {strength.label}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all`}
                  style={{ width: `${(score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
            <div className="flex-1 h-px bg-slate-800" />
            OR
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Login Link */}
          <p className="text-sm text-slate-400 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-semibold hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </form>

      </Card>
    </div>
  );
}