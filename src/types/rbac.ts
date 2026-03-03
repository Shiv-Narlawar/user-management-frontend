export type Role = "ADMIN" | "MANAGER" | "USER";

export const ROLES: Role[] = ["ADMIN", "MANAGER", "USER"];

export type Status =
  | "ACTIVE"
  | "INACTIVE";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
}