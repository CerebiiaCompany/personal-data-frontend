import { useSessionStore } from "@/store/useSessionStore";
import { APIResponse, QueryParams } from "@/types/api.types";
import { API_BASE_URL } from "@/utils/env.utils";
import { isPublicAppRoute } from "@/utils/publicRoutes";

function isPublicClientContext(endpoint: string): boolean {
  if (endpoint.startsWith("/public/")) return true;
  if (typeof window === "undefined") return false;
  return isPublicAppRoute(window.location.pathname);
}

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

/**
 * Configuración de resiliencia de red por petición.
 *
 * Estos parámetros son clave para equipos con internet lento o inestable
 * (p. ej. cajas/puntos de venta): permiten dar más tiempo a la petición y
 * reintentar automáticamente ante caídas momentáneas de red, en lugar de
 * fallar de inmediato.
 */
export interface FetchConfig {
  /** Tiempo máximo de espera (ms) antes de abortar. Default 30000. */
  timeoutMs?: number;
  /** Número de reintentos ante errores de red/timeout. Default 0. */
  retries?: number;
  /** Delay base entre reintentos (ms). Se aplica backoff lineal. Default 1000. */
  retryDelayMs?: number;
  /**
   * Si es true, también reintenta cuando la causa fue un TIMEOUT.
   *
   * IMPORTANTE: úsalo SOLO en operaciones idempotentes (GET) o en POST/PATCH
   * protegidos con `Idempotency-Key`, porque un timeout puede significar que el
   * servidor SÍ procesó la petición y reintentar podría duplicar datos.
   */
  retryOnTimeout?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Función auxiliar para hacer fetch con timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
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

// Reintenta una petición que devuelve APIResponse (nunca lanza) ante errores
// de red y, opcionalmente, timeouts. Aplica backoff lineal.
async function fetchWithRetry<T>(
  fetchFn: () => Promise<APIResponse<T>>,
  retries: number,
  delayMs: number,
  retryOnTimeout: boolean
): Promise<APIResponse<T>> {
  let result: APIResponse<T> = await fetchFn();

  for (let attempt = 1; attempt <= retries; attempt++) {
    const code = result.error?.code;
    const isNetworkError = code === "http/network-error";
    const isTimeout = code === "http/timeout";
    const isRetryable = isNetworkError || (isTimeout && retryOnTimeout);

    if (!isRetryable) return result;

    console.log(`[customFetch] Reintento ${attempt}/${retries} (causa: ${code})...`);
    await delay(delayMs * attempt);
    result = await fetchFn();
  }

  return result;
}

export async function customFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  query?: QueryParams,
  config?: FetchConfig
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

  const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const fetchFn = async (): Promise<APIResponse<T>> => {
    // Detección temprana de "sin conexión": evita esperar todo el timeout
    // cuando el navegador ya sabe que no hay red. `onLine === false` es fiable;
    // se trata como error de red (reintetable) para dar margen a reconectar.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return {
        error: {
          message: "Sin conexión a internet. Verifica tu red e intenta de nuevo.",
          code: "http/network-error",
        },
      };
    }

    try {
      const req = await fetchWithTimeout(`${API_BASE_URL}${localEndpoint}`, {
        credentials: "include",
        // Evita que el navegador/Next sirvan respuestas cacheadas: tras una
        // mutación (crear/editar/eliminar) el refetch siempre debe traer datos
        // frescos del backend.
        cache: "no-store",
        ...options,
        // headers se fusiona al final para no perder Content-Type ni headers
        // propios (p. ej. Idempotency-Key) que vengan en `options.headers`.
        headers: {
          ...headers,
          ...options.headers,
        },
      }, timeoutMs);

      // Check for HTTP 401 status before parsing JSON
      if (req.status === 401) {
        // Try to parse server error to preserve backend message
        let serverBody: APIResponse | null = null;
        try {
          serverBody = (await req.json()) as APIResponse;
        } catch {}

        const isPublic = isPublicClientContext(endpoint);

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
        const isPublic = isPublicClientContext(endpoint);
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

  // Reintentos automáticos para endpoints críticos de sesión (comportamiento
  // histórico) cuando el caller no especifica una config explícita.
  const autoRetry =
    endpoint.includes("/auth/") || endpoint.includes("/session");

  const retries = config?.retries ?? (autoRetry ? 2 : 0);
  const retryDelayMs = config?.retryDelayMs ?? 1000;
  // Por defecto, los reintentos automáticos de sesión sí reintentan en timeout
  // (son GET idempotentes); para el resto, solo si el caller lo habilita.
  const retryOnTimeout = config?.retryOnTimeout ?? autoRetry;

  if (retries > 0) {
    return fetchWithRetry(fetchFn, retries, retryDelayMs, retryOnTimeout);
  }

  return fetchFn();
}
