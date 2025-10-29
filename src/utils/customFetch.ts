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

    // Check for HTTP 401 status before parsing JSON
    if (req.status === 401) {
      // Try to parse server error to preserve backend message
      let serverBody: APIResponse | null = null;
      try {
        serverBody = (await req.json()) as APIResponse;
      } catch {}

      const isPublic = endpoint.startsWith("/public/");

      if (isPublic) {
        // For public endpoints, DO NOT logout or redirect; just return server error/message
        return (
          serverBody ?? {
            error: { code: "auth/unauthenticated", message: "Error en la autenticación" },
          }
        );
      }

      // For protected endpoints, handle logout and redirect, but preserve server message in response
      const sessionStore = useSessionStore.getState();
      sessionStore.logout();
      sessionStore.setError("Sesión expirada");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !isPublic
      ) {
        const currentPath = window.location.pathname;
        setTimeout(() => {
          window.location.href = `/login?callback_url=${encodeURIComponent(currentPath)}`;
        }, 0);
      }

      // Return server error if available, otherwise a default
      return (
        serverBody ?? {
          error: { message: "Sesión expirada", code: "auth/unauthenticated" },
        }
      );
    }

    const res = (await req.json()) as APIResponse;

    if (res.error?.code === "auth/unauthenticated") {
      const isPublic = endpoint.startsWith("/public/");
      if (!isPublic) {
        // notify user session has ended only for protected endpoints
        const sessionStore = useSessionStore.getState();
        sessionStore.logout();
        sessionStore.setError("Sesión expirada");

        // Redirect to login if not already there
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          const currentPath = window.location.pathname;
          setTimeout(() => {
            window.location.href = `/login?callback_url=${encodeURIComponent(currentPath)}`;
          }, 0);
        }
      }
    }

    return res;
  } catch (error) {
    return {
      error: { message: "Error desconocido", code: "http/unknown-error" },
    };
  }
}
