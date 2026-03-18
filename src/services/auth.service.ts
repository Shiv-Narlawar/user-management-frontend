import { apiFetch } from "../lib/apiFetch";

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

// me
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const user = (await apiFetch("/auth/me")) as AuthUser;
    return user ?? null;
  } catch (err) {
    console.error("failed to fetch user", err);
    return null;
  }
}