import { apiFetch } from "../lib/api";
import type { RoleNode } from "../types/rbac";

export async function fetchRoles(): Promise<RoleNode[]> {
  const result = await apiFetch("/roles");
  return result as RoleNode[];
}

export async function createRole(payload: {
  name: string;
  parentRoleId?: string | null;
  childRoleIds?: string[];
}): Promise<RoleNode> {
  const result = await apiFetch("/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result as RoleNode;
}

export async function updateRole(
  id: string,
  payload: Partial<{
    name: string;
    parentRoleId: string | null;
    childRoleIds: string[];
  }>
): Promise<RoleNode> {
  const result = await apiFetch(`/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return result as RoleNode;
}