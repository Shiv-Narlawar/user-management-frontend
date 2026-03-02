const BASE_URL = "http://localhost:7000/api";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  setTokens(data.token, data.refreshToken);
  return data.token;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const accessToken = getAccessToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired → refresh
  if (response.status === 401) {
    const newAccess = await refreshAccessToken();

    headers.set("Authorization", `Bearer ${newAccess}`);

    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}

export { setTokens, clearTokens };