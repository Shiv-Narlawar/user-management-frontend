export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  permissions?: string[];
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  mustChangePassword?: boolean;
  user?: AuthUser;
  message?: string;
}