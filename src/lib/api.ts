import { apiFetch } from "./apiFetch";

export { apiFetch };

const api = {
  get: async <T>(endpoint: string): Promise<{ data: T }> => {
    const data = await apiFetch<T>(endpoint, { method: "GET" });
    return { data };
  },

  post: async <T, B = unknown>(
    endpoint: string,
    body?: B
  ): Promise<{ data: T }> => {
    const data = await apiFetch<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return { data };
  },

  put: async <T, B = unknown>(
    endpoint: string,
    body?: B
  ): Promise<{ data: T }> => {
    const data = await apiFetch<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return { data };
  },

  patch: async <T, B = unknown>(
    endpoint: string,
    body?: B
  ): Promise<{ data: T }> => {
    const data = await apiFetch<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return { data };
  },

  delete: async <T>(endpoint: string): Promise<{ data: T }> => {
    const data = await apiFetch<T>(endpoint, { method: "DELETE" });
    return { data };
  },
};

export default api;