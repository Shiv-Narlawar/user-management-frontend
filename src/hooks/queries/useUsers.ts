import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { Status } from "../../types/rbac";
import { qk } from "../../lib/queryKeys";
import type { UsersResponse } from "../../services/users.api";
import { deleteUser, getUsers, updateUserStatus } from "../../services/users.api";

export function useUsersQuery(params: {
  search: string;
  page: number;
  limit: number;
}) {
  return useQuery<UsersResponse>({
    queryKey: qk.users(params),
    queryFn: () => getUsers(params),

    placeholderData: (prev) => prev,
  });
}

type UsersSnapshot = Array<[QueryKey, UsersResponse | undefined]>;

export function useUpdateUserStatusMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; status: Status }) =>
      updateUserStatus(payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["users"] });

      const snapshots = qc.getQueriesData<UsersResponse>({
        queryKey: ["users"],
      }) as UsersSnapshot;

      snapshots.forEach(([key, data]) => {
        if (!data) return;

        qc.setQueryData<UsersResponse>(key, {
          ...data,
          data: data.data.map((r) =>
            r.id === payload.id ? { ...r, status: payload.status } : r
          ),
        });
      });

      return { snapshots };
    },

    // rollback if API fails
    onError: (_err, _payload, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: qk.dashboardStats() });
    },
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: qk.dashboardStats() });
    },
  });
}