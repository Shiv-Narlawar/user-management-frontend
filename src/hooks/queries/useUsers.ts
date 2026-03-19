import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import type { Status, Role } from "../../types/rbac";
import { qk } from "../../lib/queryKeys";

import type { UsersResponse } from "../../services/users.api";
import {
  deleteUser,
  getUsers,
  inviteUser,
  updateUserStatus,
} from "../../services/users.api";


export function useUsersQuery(params: {
  search?: string;
  role?: Role;
  status?: Status;
  departmentId?: string;
  page: number;
  limit: number;
  sort?: "ASC" | "DESC";  
}) {
  return useQuery<UsersResponse>({
    queryKey: [
      "users",
      params.search,
      params.role,
      params.status,
      params.departmentId,
      params.page,
      params.sort, 
    ],

    queryFn: () =>
      getUsers({
        search: params.search ?? "",
        role: params.role,
        status: params.status,
        departmentId: params.departmentId,
        page: params.page,
        limit: params.limit,
        sort: params.sort, 
      }),

    placeholderData: (prev) => prev,
  });
}

type UsersSnapshot = Array<[QueryKey, UsersResponse | undefined]>;



export function useUpdateUserStatusMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      id: string;
      status: Status;
      departmentId?: string;
      roleName?: Role;
    }) => updateUserStatus(payload),

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
            r.id === payload.id
              ? {
                  ...r,
                  status: payload.status,
                  roleName: payload.roleName ?? r.roleName,
                }
              : r
          ),
        });
      });

      return { snapshots };
    },

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


// DELETE USER
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

export function useInviteUserMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: inviteUser,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: qk.dashboardStats() });
    },
  });
}
