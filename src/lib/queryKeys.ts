export const qk = {
  users: (params: { search: string; page: number; limit: number }) =>
    ["users", params.search, params.page, params.limit] as const,

  dashboardStats: () => ["dashboardStats"] as const,

  roles: () => ["roles"] as const,
  permissions: () => ["permissions"] as const,
  rolePermissions: (roleId: string) => ["rolePermissions", roleId] as const,

  departments: () => ["departments"] as const,
  unassignedUsers: () => ["unassignedUsers"] as const,
};