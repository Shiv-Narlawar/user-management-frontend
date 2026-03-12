import { apiFetch } from "../lib/api";
import type { UserRow, Role, Status } from "../types/rbac";

export interface UsersResponse {
  data: UserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchUsers(params?: {
  search?: string;
  role?: Role | "ALL";
  status?: Status | "ALL";
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {

  const query = new URLSearchParams();

  if (params?.search) query.append("search", params.search);

  if (params?.role && params.role !== "ALL") {
    query.append("role", params.role);
  }

  if (params?.status && params.status !== "ALL") {
    query.append("status", params.status);
  }

  if (params?.sort) query.append("sort", params.sort);

  if (params?.order) query.append("order", params.order);

  if (params?.page) query.append("page", String(params.page));

  if (params?.limit) query.append("limit", String(params.limit));

  const qs = query.toString();

  return await apiFetch<UsersResponse>(
    `/users${qs ? `?${qs}` : ""}`
  );
}

export async function updateUser(
  id: string,
  payload: Partial<{
    name: string;
    role: Role;
    status: Status;
  }>
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

export async function updateMyProfile(payload: {
  name: string;
}): Promise<{
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