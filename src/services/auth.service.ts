<<<<<<< HEAD
import { apiFetch } from "../lib/api";
import type { Role, UserRow } from "../types/rbac";

export type AuthUser = UserRow & {
  permissions?: string[];
};
=======

import { apiFetch } from "../lib/apiFetch";

export type Role = "ADMIN" | "MANAGER" | "USER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  permissions?: string[];
}
>>>>>>> d16fa5a (Build React screens)

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  user?: AuthUser;
  message?: string;
}

<<<<<<< HEAD
export type LoginResponse = AuthResponse & { token: string; user: AuthUser };
export type SignupResponse = AuthResponse & { token: string; user: AuthUser };

=======
>>>>>>> d16fa5a (Build React screens)
function setTokens(token: string, refreshToken?: string) {
  localStorage.setItem("accessToken", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
<<<<<<< HEAD
  role: Extract<Role, "USER" | "MANAGER">;
}): Promise<SignupResponse> {
=======
  role: "USER" | "MANAGER";
}): Promise<AuthResponse> {
>>>>>>> d16fa5a (Build React screens)
  const result = (await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

<<<<<<< HEAD
  if (!result.token) throw new Error("Signup failed: token missing");
  if (!result.user) throw new Error("Signup failed: user missing");

  setTokens(result.token, result.refreshToken);
  return result as SignupResponse;
=======
  
  return result;
>>>>>>> d16fa5a (Build React screens)
}

export async function login(payload: {
  email: string;
  password: string;
<<<<<<< HEAD
}): Promise<LoginResponse> {
=======
}): Promise<AuthResponse> {
>>>>>>> d16fa5a (Build React screens)
  const result = (await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

  if (!result.token) throw new Error("Login failed: token missing");
<<<<<<< HEAD
  if (!result.user) throw new Error("Login failed: user missing");

  setTokens(result.token, result.refreshToken);
  return result as LoginResponse;
=======

  setTokens(result.token, result.refreshToken);
  return result;
>>>>>>> d16fa5a (Build React screens)
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
<<<<<<< HEAD
    // ignore logout errors;
=======
    // ignore logout errors; frontend already clears tokens in AuthContext
>>>>>>> d16fa5a (Build React screens)
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
<<<<<<< HEAD
=======
  code: string;
>>>>>>> d16fa5a (Build React screens)
  newPassword: string;
}): Promise<AuthResponse> {
  return (await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;
}
<<<<<<< HEAD
=======

export async function forgotUsername(payload: {
  email: string;
}): Promise<AuthResponse> {
  return (await apiFetch("/auth/forgot-username", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;
}
>>>>>>> d16fa5a (Build React screens)
