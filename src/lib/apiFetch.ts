import { getAuth0Token } from "./auth0Token";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api";

export class ApiFetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // token
  const token = await getAuth0Token();

  // headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // request
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // parse
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // error
  if (!response.ok) {
    const errorBody = isJson
      ? await response.json()
      : await response.text();

    const message =
      typeof errorBody === "string"
        ? errorBody
        : (errorBody as { message?: string })?.message ||
          response.statusText;

    if (response.status === 401) {
      console.warn("unauthorized");
    }

    throw new ApiFetchError(response.status, message);
  }

  // empty
  if (response.status === 204) {
    return null as T;
  }

  // success
  return (isJson ? await response.json() : await response.text()) as T;
}
