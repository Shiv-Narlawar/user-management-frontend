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

export async function changePassword(email: string): Promise<void> {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  const response = await fetch(
    `https://${domain}/dbconnections/change_password`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        email,
        connection: "Username-Password-Authentication",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send reset email");
  }
}