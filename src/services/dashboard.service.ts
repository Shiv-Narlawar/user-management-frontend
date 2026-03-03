import { apiFetch } from "../lib/api";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  managers: number;
  admins: number;
  users: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const result = await apiFetch("/dashboard/stats");
  return result as DashboardStats;
}