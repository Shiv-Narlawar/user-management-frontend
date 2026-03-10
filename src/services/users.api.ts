import { apiFetch } from "../lib/api";
import type { Role, Status } from "../types/rbac";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  roleName: Role;
  status: Status;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
}

export interface UsersResponse {
  data: UserRow[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getUsers(params: {
  search: string;
  page: number;
  limit: number;
}): Promise<UsersResponse> {
  const qs = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });

  return apiFetch<UsersResponse>(`/users?${qs.toString()}`);
}

/**
 * 🔹 Only USER role without department
 * Used for Assign User dropdown
 */
export async function getAssignableUsers(): Promise<UserRow[]> {
  const res = await apiFetch<{ data: UserRow[] }>("/users/unassigned");
  return res.data;
}

export async function updateUserStatus(payload: {
  id: string;
  status: Status;
}): Promise<void> {
  await apiFetch<void>(`/users/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify({ status: payload.status }),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}