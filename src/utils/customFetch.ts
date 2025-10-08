import { useSessionStore } from "@/store/useSessionStore";
import { APIResponse, QueryParams } from "@/types/api.types";
import { API_BASE_URL } from "@/utils/env.utils";

// Build a query string from an object, skipping null/undefined/empty and the `id` key
function buildQueryString(params?: QueryParams): string {
  if (!params) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (
      key.toLowerCase().includes("id") ||
      value === undefined ||
      value === null ||
      value === ""
    )
      continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === "") continue;
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`
        );
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      );
    }
  }
  return parts.join("&");
}

export async function customFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  query?: QueryParams
): Promise<APIResponse<T>> {
  const headers: HeadersInit = {};

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  let localEndpoint = endpoint;
  const queries = buildQueryString(query);

  if (queries) {
    localEndpoint += `?${queries}`;
  }

  try {
    const req = await fetch(`${API_BASE_URL}${localEndpoint}`, {
      credentials: "include",
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    });

    const res = (await req.json()) as APIResponse;

    if (res.error?.code === "auth/unauthenticated") {
      // notify user session has ended
      useSessionStore.getState().logout();
      useSessionStore.getState().setError("Sesión expirada");
    }

    return res;
  } catch (error) {
    return {
      error: { message: "Error desconocido", code: "http/unknown-error" },
    };
  }
}
