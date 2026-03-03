<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api";

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

function clearTokens(): void {
=======
const BASE_URL = "http://localhost:7000/api";
=======
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api";
>>>>>>> 27e3f98 (Addressed all comments)

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

<<<<<<< HEAD
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
}

function clearTokens() {
>>>>>>> d16fa5a (Build React screens)
=======
function clearTokens(): void {
>>>>>>> 27e3f98 (Addressed all comments)
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 27e3f98 (Addressed all comments)
type RefreshResponse = {
  token?: string;
  refreshToken?: string;
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
<<<<<<< HEAD
=======
async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");
>>>>>>> d16fa5a (Build React screens)
=======
>>>>>>> 27e3f98 (Addressed all comments)

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 27e3f98 (Addressed all comments)
  if (!res.ok) return null;

  const data = (await res.json()) as RefreshResponse;

  if (!data.token) return null;

  localStorage.setItem("accessToken", data.token);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
<<<<<<< HEAD
  }

  return data.token;
}

function isAuthEndpoint(endpoint: string): boolean {
  return (
    endpoint.startsWith("/auth/login") ||
    endpoint.startsWith("/auth/signup") ||
    endpoint.startsWith("/auth/refresh") ||
    endpoint.startsWith("/auth/logout") ||
    endpoint.startsWith("/auth/forgot-password") ||
    endpoint.startsWith("/auth/reset-password")
  );
}

export async function apiFetch<T = unknown>(
=======
export const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:7000/api";

export async function apiFetch<T>(
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
=======
  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
=======
>>>>>>> 27e3f98 (Addressed all comments)
  }

  return data.token;
}

function isAuthEndpoint(endpoint: string): boolean {
  return (
    endpoint.startsWith("/auth/login") ||
    endpoint.startsWith("/auth/signup") ||
    endpoint.startsWith("/auth/refresh") ||
    endpoint.startsWith("/auth/logout") ||
    endpoint.startsWith("/auth/forgot-password") ||
    endpoint.startsWith("/auth/reset-password")
  );
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (accessToken) {
<<<<<<< HEAD
    headers.set("Authorization", `Bearer ${accessToken}`);
>>>>>>> d16fa5a (Build React screens)
=======
    headers.Authorization = `Bearer ${accessToken}`;
>>>>>>> 27e3f98 (Addressed all comments)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  // Try refresh once if 401 and not auth endpoint
  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    const newAccess = await refreshAccessToken();

    if (!newAccess) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    headers.Authorization = `Bearer ${newAccess}`;
=======
  // If token expired → refresh
  if (response.status === 401) {
    const newAccess = await refreshAccessToken();

    headers.set("Authorization", `Bearer ${newAccess}`);
>>>>>>> d16fa5a (Build React screens)
=======
  // Try refresh once if 401 and not auth endpoint
  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    const newAccess = await refreshAccessToken();

    if (!newAccess) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    headers.Authorization = `Bearer ${newAccess}`;
>>>>>>> 27e3f98 (Addressed all comments)

    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const errorBody = isJson ? await response.json() : await response.text();
    const message =
      typeof errorBody === "string"
        ? errorBody
        : (errorBody as { message?: string })?.message || response.statusText;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (isJson ? await response.json() : await response.text()) as T;
}
<<<<<<< HEAD
=======
=======
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

>>>>>>> 27e3f98 (Addressed all comments)
  if (!response.ok) {
    const errorBody = isJson
      ? await response.json()
      : await response.text();

    const message =
      typeof errorBody === "string"
        ? errorBody
        : (errorBody as { message?: string })?.message ||
          response.statusText;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

<<<<<<< HEAD
export { setTokens, clearTokens };
>>>>>>> d16fa5a (Build React screens)
=======
  return (isJson ? await response.json() : await response.text()) as T;
}
>>>>>>> 27e3f98 (Addressed all comments)
=======

const api = {
  get: async <T>(endpoint: string) => ({
    data: await apiFetch<T>(endpoint, { method: "GET" }),
  }),

  post: async <T, B = unknown>(endpoint: string, body?: B) => ({
    data: await apiFetch<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    }),
  }),

  put: async <T, B = unknown>(endpoint: string, body?: B) => ({
    data: await apiFetch<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    }),
  }),

  patch: async <T, B = unknown>(endpoint: string, body?: B) => ({
    data: await apiFetch<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    }),
  }),

  delete: async <T>(endpoint: string) => ({
    data: await apiFetch<T>(endpoint, { method: "DELETE" }),
  }),
};

export default api;
>>>>>>> e5e6fd3 (feat: implement frontend updates for user management system)
