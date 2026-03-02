export type Role = "ADMIN" | "MANAGER" | "USER";

export type Status =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "OFFLINE";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
}