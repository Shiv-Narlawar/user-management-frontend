const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api";

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const data: { token?: string; refreshToken?: string } = await res.json();

  if (!data.token) return null;

  localStorage.setItem("accessToken", data.token);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
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
    endpoint.startsWith("/auth/reset-password") ||
    endpoint.startsWith("/auth/forgot-username")
  );
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  
  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    const newAccess = await refreshAccessToken();

    if (!newAccess) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    headers.Authorization = `Bearer ${newAccess}`;

    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const errorBody = isJson
      ? await response.json()
      : await response.text();

    const message =
      typeof errorBody === "string"
        ? errorBody
        : errorBody?.message || response.statusText;

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return isJson ? response.json() : response.text();
}