import { apiFetch } from "../lib/apiFetch";
import { getAuth0Token } from "../lib/auth0Token";

export type Role = "ADMIN" | "MANAGER" | "USER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  permissions?: string[];
  departmentId?: string;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  mustChangePassword?: boolean;
  user?: AuthUser;
  message?: string;
}

//Store tokens + user locally
 
function setTokens(token: string, refreshToken?: string, user?: AuthUser) {
  localStorage.setItem("accessToken", token);

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
}

//SIGNUP
 
export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  role: "USER" | "MANAGER";
}): Promise<AuthResponse> {
  const result = (await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

  if (!result.token) {
    throw new Error("Signup failed: token missing");
  }

  setTokens(result.token, result.refreshToken, result.user);
  return result;
}

// LOGIN (Local login)
 
export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const result = (await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;

  if (!result.token) {
    throw new Error("Login failed: token missing");
  }

  setTokens(result.token, result.refreshToken, result.user);
  return result;
}

// LOGOUT
 
export async function logout(refreshToken: string | null): Promise<void> {
  try {
    if (refreshToken) {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // ignore logout errors
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
}

// REFRESH TOKEN
 
export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const result = (await apiFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })) as AuthResponse;

  if (!result.token) {
    throw new Error("Refresh failed: token missing");
  }

  setTokens(result.token, result.refreshToken, result.user);
  return result;
}

//PASSWORD RESET REQUEST
 
export async function requestPasswordReset(
  email: string
): Promise<AuthResponse> {
  return (await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })) as AuthResponse;
}

//RESET PASSWORD
 
export async function resetPassword(payload: {
  email: string;
  newPassword: string;
}): Promise<AuthResponse> {
  return (await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;
}

// FORGOT USERNAME
 
export async function forgotUsername(payload: {
  email: string;
}): Promise<AuthResponse> {
  return (await apiFetch("/auth/forgot-username", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as AuthResponse;
}


export async function getCurrentUser(): Promise<AuthUser | null> {
  try {

    const token = await getAuth0Token();

    const user = (await apiFetch("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })) as AuthUser;

    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    }

    return user;

  } catch {
    return null;
  }
}