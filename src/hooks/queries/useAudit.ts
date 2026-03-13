import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../services/audit.api";

export function useAuditLogs(search: string, page: number, limit: number) {
  return useQuery({
    queryKey: ["auditLogs", search, page, limit],
    queryFn: () =>
      getAuditLogs({
        search,
        page,
        limit,
      }),
  });
}