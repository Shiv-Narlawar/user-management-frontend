import { apiFetch } from "../lib/api";

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorEmail?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditResponse {
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAuditLogs(params: {
  search?: string;
  page: number;
  limit: number;
}): Promise<AuditResponse> {
  const qs = new URLSearchParams();

  if (params.search) {
    qs.append("search", params.search);
  }

  qs.append("page", String(params.page));
  qs.append("limit", String(params.limit));

  return apiFetch<AuditResponse>(`/audit?${qs.toString()}`);
}