import { apiFetch } from "../lib/api";
import type { UserRow, Role, Status } from "../types/rbac";

export async function fetchUsers(params?: {
  search?: string;
  role?: Role | "ALL";
  status?: Status | "ALL";
  sort?: string;
  order?: "asc" | "desc";
}): Promise<UserRow[]> {
  const query = new URLSearchParams();

  if (params?.search) query.append("search", params.search);
  if (params?.role && params.role !== "ALL") query.append("role", params.role);
  if (params?.status && params.status !== "ALL") query.append("status", params.status);
  if (params?.sort) query.append("sort", params.sort);
  if (params?.order) query.append("order", params.order);

  const qs = query.toString();

  const result = await apiFetch(`/users${qs ? `?${qs}` : ""}`);
  return result as UserRow[];
}

export async function updateUser(
  id: string,
  payload: Partial<{ name: string; role: Role; status: Status }>
): Promise<void> {
  await apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function softDeleteUser(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function updateMyProfile(payload: { name: string }): Promise<{
  id: string;
  name: string;
  email: string;
  roleName?: string;
  status?: string;
}> {
  return await apiFetch(`/users/me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}