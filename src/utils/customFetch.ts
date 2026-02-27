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

// Función auxiliar para hacer fetch con timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error('La petición excedió el tiempo de espera');
    }
    throw error;
  }
}

// Función auxiliar para reintentar peticiones
async function fetchWithRetry<T>(
  fetchFn: () => Promise<APIResponse<T>>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<APIResponse<T>> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fetchFn();
      
      // Si es un error de red o timeout, reintentar
      if (result.error?.code === 'http/network-error' || 
          result.error?.code === 'http/timeout') {
        if (attempt < maxRetries) {
          console.log(`[customFetch] Reintento ${attempt + 1}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
          continue;
        }
      }
      
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`[customFetch] Reintento ${attempt + 1}/${maxRetries} después de error...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  
  return {
    error: { 
      message: lastError?.message || "Error desconocido después de reintentos", 
      code: "http/unknown-error" 
    },
  };
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

  const fetchFn = async (): Promise<APIResponse<T>> => {
    try {
      const req = await fetchWithTimeout(`${API_BASE_URL}${localEndpoint}`, {
        credentials: "include",
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      }, 30000); // Timeout de 30 segundos

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

      // Verificar si la respuesta es JSON válida
      const contentType = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[customFetch] Respuesta no es JSON:", contentType);
        return {
          error: { 
            message: "El servidor no respondió correctamente", 
            code: "http/invalid-response" 
          },
        };
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
      const err = error as Error;
      console.error("[customFetch] Error en petición:", err.message);
      
      // Clasificar el tipo de error
      if (err.message.includes('tiempo de espera') || err.message.includes('timeout')) {
        return {
          error: { 
            message: "La petición excedió el tiempo de espera. Verifica tu conexión.", 
            code: "http/timeout" 
          },
        };
      }
      
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') ||
          err.message.includes('Network request failed')) {
        return {
          error: { 
            message: "Error de conexión. Verifica tu red e intenta de nuevo.", 
            code: "http/network-error" 
          },
        };
      }
      
      return {
        error: { 
          message: "Error inesperado al comunicarse con el servidor", 
          code: "http/unknown-error" 
        },
      };
    }
  };

  // Solo aplicar reintentos para endpoints críticos (auth, session)
  const shouldRetry = endpoint.includes('/auth/') || endpoint.includes('/session');
  
  if (shouldRetry) {
    return fetchWithRetry(fetchFn, 2, 1000);
  }
  
  return fetchFn();
}
