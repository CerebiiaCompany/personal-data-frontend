import { APIResponse } from "@/types/api.types";
import {
  ArcoCompanyEntry,
  ArcoCreateRequestPayload,
  ArcoCreateRequestResult,
  ArcoLookupPayload,
  ArcoLookupResult,
  ArcoPolicyResult,
  ArcoRightsAttentionPublic,
  ArcoRequestListItem,
  ArcoVerifyPayload,
  ArcoVerifyResult,
} from "@/types/arco.types";
import { API_BASE_URL } from "@/utils/env.utils";
import {
  clearPersonasVerification,
  getArcoSessionToken,
} from "@/utils/personasSession";

/** En el navegador usa el proxy same-origin de Next (/api/v1/arco → backend). */
function resolveArcoUrl(endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (typeof window !== "undefined") {
    return `/api/v1${path}`;
  }
  const base = (API_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}${path}`;
}

async function arcoFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  authenticated = false
): Promise<APIResponse<T>> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (authenticated) {
    const token = getArcoSessionToken();
    if (!token) {
      return {
        error: {
          code: "auth/unauthenticated",
          message: "Tu sesión expiró. Ingresa de nuevo con tu documento.",
        },
      };
    }
    headers["x-arco-token"] = token;
    // Compatibilidad si el backend aún lee Authorization en lugar del header ARCO
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(resolveArcoUrl(endpoint), {
      credentials: "include",
      ...options,
      headers,
    });

    let body: APIResponse<T>;
    try {
      body = (await response.json()) as APIResponse<T>;
    } catch {
      return {
        error: {
          code: "http/invalid-response",
          message: "El servidor no respondió correctamente",
        },
      };
    }

    if (
      authenticated &&
      (response.status === 401 || body.error?.code === "auth/unauthenticated")
    ) {
      clearPersonasVerification();
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/personas")
      ) {
        window.location.href = "/personas/ingresar";
      }
    }

    if (body.error) {
      body.error = {
        ...body.error,
        status: response.status,
        code:
          body.error.code ??
          (response.status === 429 ? "http/too-many-requests" : body.error.code),
      };
    } else if (response.status === 429) {
      return {
        error: {
          code: "http/too-many-requests",
          message: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
          status: 429,
        },
      };
    }

    return body;
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("Failed to fetch")) {
      return {
        error: {
          code: "http/network-error",
          message: "Error de conexión. Verifica tu red e intenta de nuevo.",
        },
      };
    }
    return {
      error: {
        code: "http/unknown-error",
        message: "Error inesperado al comunicarse con el servidor",
      },
    };
  }
}

export function arcoLookup(payload: ArcoLookupPayload) {
  return arcoFetch<ArcoLookupResult>("/arco/lookup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function arcoVerify(payload: ArcoVerifyPayload) {
  return arcoFetch<ArcoVerifyResult>("/arco/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function arcoListCompanies() {
  return arcoFetch<ArcoCompanyEntry[]>("/arco/companies", { method: "GET" }, true);
}

export function arcoGetCompanyPolicy(companyId: string) {
  return arcoFetch<ArcoPolicyResult>(
    `/arco/companies/${companyId}/policy`,
    { method: "GET" },
    true
  );
}

export function arcoGetCompanyRightsAttention(companyId: string) {
  return arcoFetch<ArcoRightsAttentionPublic>(
    `/arco/companies/${companyId}/rights-attention`,
    { method: "GET" },
    true
  );
}

export function arcoCreateRequest(payload: ArcoCreateRequestPayload) {
  return arcoFetch<ArcoCreateRequestResult>(
    "/arco/requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
}

export function arcoListRequests() {
  return arcoFetch<ArcoRequestListItem[]>(
    "/arco/requests",
    { method: "GET" },
    true
  );
}
