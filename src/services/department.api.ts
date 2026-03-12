import api from "../lib/api";

export interface DepartmentRow {
  id: string;
  name: string;
  managerId?: string | null;
}

export interface DepartmentsResponse {
  data: DepartmentRow[];
}

export async function getDepartments(): Promise<DepartmentsResponse> {
  const res = await api.get<DepartmentsResponse>("/departments");
  return res.data;
}