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
  search?: string;
  role?: Role;
  status?: Status;
  departmentId?: string;
  page: number;
  limit: number;
  sort?: "ASC" | "DESC";
}): Promise<UsersResponse> {
  const qs = new URLSearchParams();

  if (params.search) {
    qs.append("search", params.search);
  }

  if (params.role) {
    qs.append("role", params.role);
  }

  if (params.status) {
    qs.append("status", params.status);
  }

  if (params.departmentId) {
    qs.append("departmentId", params.departmentId);
  }

  if (params.sort) {
  qs.append("sort", params.sort);
}

  qs.append("page", String(params.page));
  qs.append("limit", String(params.limit));

  return apiFetch<UsersResponse>(`/users?${qs.toString()}`);
}

export async function getAssignableUsers(): Promise<UserRow[]> {
  const res = await apiFetch<{ data: UserRow[] }>("/users/unassigned");
  return res.data;
}

export async function updateUserStatus(payload: {
  id: string;
  status: Status;
  departmentId?: string;
  roleName?: Role;
}): Promise<void> {
  await apiFetch<void>(`/users/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify({
      status: payload.status,
      departmentId: payload.departmentId,
      roleName: payload.roleName,
    }),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<void>(`/users/${id}`, {
    method: "DELETE",
  });
}