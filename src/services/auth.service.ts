import { apiFetch } from "../lib/api";
import type { Role, UserRow } from "../types/rbac";

export type AuthUser = UserRow & {
  permissions?: string[];
};

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  user?: AuthUser;
  message?: string;
}

export type LoginResponse = AuthResponse & { token: string; user: AuthUser };
export type SignupResponse = AuthResponse & { token: string; user: AuthUser };

function setTokens(token: string, refreshToken?: string) {
  localStorage.setItem("accessToken", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "USER" | "MANAGER">;
}): Promise<SignupResponse> {
  const result = (await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

  if (!result.token) throw new Error("Signup failed: token missing");
  if (!result.user) throw new Error("Signup failed: user missing");

  setTokens(result.token, result.refreshToken);
  return result as SignupResponse;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const result = (await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

  if (!result.token) throw new Error("Login failed: token missing");
  if (!result.user) throw new Error("Login failed: user missing");

  setTokens(result.token, result.refreshToken);
  return result as LoginResponse;
}

export async function logout(refreshToken: string | null): Promise<void> {
  try {
    if (refreshToken) {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // ignore logout errors;
  }
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const result = (await apiFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })) as AuthResponse;

  if (!result.token) throw new Error("Refresh failed: token missing");

  setTokens(result.token, result.refreshToken);
  return result;
}

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  return (await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })) as AuthResponse;
}

export async function resetPassword(payload: {
  email: string;
  newPassword: string;
}): Promise<AuthResponse> {
  return (await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;
}
