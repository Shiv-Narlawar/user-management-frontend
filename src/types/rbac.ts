export type Role = "ADMIN" | "MANAGER" | "USER";

export const ROLES: Role[] = ["ADMIN", "MANAGER", "USER"];

export type Status = "ACTIVE" | "INACTIVE" | "INVITED";

export interface UserRow {
  id: string;
  name: string;
  email: string;

  roleName: Role;

  status: Status;
  
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

export interface RoleNode {
  id: string;
  name: string;
  parentRoleId?: string | null;
  childRoleIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}