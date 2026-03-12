import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../../services/department.api";

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 5
  });
}