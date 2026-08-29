const configuredBackendUrl =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";

/**
 * Destino real del backend. Solo para servidor (proxy, SSR).
 * Nunca usarlo desde el navegador: ahí se pierde CORS en 502/503.
 */
export const API_BACKEND_URL = configuredBackendUrl.replace(/\/$/, "");

/**
 * Base URL que usan fetch del cliente y del servidor.
 *
 * En el navegador siempre va al proxy same-origin `/api/v1` para que un
 * 502/503 del gateway (sin cabeceras CORS) no bloquee la app. El servidor
 * puede hablar con el backend directo: CORS no aplica fuera del browser.
 */
export const API_BASE_URL =
  typeof window === "undefined" ? API_BACKEND_URL : "/api/v1";
