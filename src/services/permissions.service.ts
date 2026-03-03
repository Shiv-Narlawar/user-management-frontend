import { apiFetch } from "../lib/apiFetch";

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

export async function fetchPermissions(): Promise<Permission[]> {
  const result = await apiFetch("/permissions");
  return result as Permission[];
}

export async function setRolePermissions(
  roleId: string,
  permissionIds: string[]
): Promise<void> {
  await apiFetch(`/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionIds }),
  });
}