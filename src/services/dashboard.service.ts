import { apiFetch } from "../lib/apiFetch";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  managers: number;
  admins: number;
  users: number;
}

// stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
  return await apiFetch<DashboardStats>("/dashboard/stats");
}