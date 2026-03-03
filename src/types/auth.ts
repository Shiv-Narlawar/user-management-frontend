export type Role = "ADMIN" | "MANAGER" | "USER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  permissions?: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  message?: string;
}