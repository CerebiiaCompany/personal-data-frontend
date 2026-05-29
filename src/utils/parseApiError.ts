import { APIError } from "@/types/api.types";

export const ERROR_DICTIONARY = {
  "http/bad-request": "Error en la petición",
  "http/conflict": "Conflicto (registro duplicado)",
  "db/duplicate-key": "Este registro ya existe",
  "http/unknown-error": "Error desconocido",
  "http/not-found": "Recurso no encontrado",
  "http/network-error": "Error de conexión. Verifica tu red.",
  "http/timeout": "La petición excedió el tiempo de espera",
  "http/invalid-response": "Respuesta inválida del servidor",
  "auth/invalid-credentials": "Credenciales inválidas",
  "auth/unauthorized": "No estás autorizado para esta acción",
  "auth/unauthenticated": "Error en la autenticación",
  "auth/forbidden": "No tienes permiso para esta acción",
  "otp/pending-code": "Ya hay un código pendiente para este usuario",
  "masivapp/error": "Error al enviar el mensaje",
  "http/too-many-requests": "Demasiadas solicitudes. Intenta más tarde.",
  "rate-limit/lookup": "Has superado el límite de búsquedas. Intenta más tarde.",
  "rate-limit/verify": "Has superado el límite de verificaciones. Intenta más tarde.",
  "rate-limit/otp-document":
    "Se alcanzó el límite de códigos para este documento. Intenta más tarde.",
  "rate-limit/exceeded": "Demasiadas solicitudes. Intenta más tarde.",
};

export function parseApiError(error: APIError): string {
  // Priorizar el mensaje que viene del backend si existe
  if (error?.message && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  // Si no hay mensaje, usar el diccionario por código
  const code = error?.code;
  if (code && code in ERROR_DICTIONARY) {
    return ERROR_DICTIONARY[code as keyof typeof ERROR_DICTIONARY];
  }

  // Fallback seguro
  return "Error desconocido";
}

/**
 * Mensajes genéricos por código para los flujos públicos de consentimiento
 * (prefill, responses, cct-status). Se usan solo cuando el backend NO envía un
 * `message` explícito.
 */
const PUBLIC_CONSENT_GENERIC_BY_CODE: Record<string, string> = {
  "http/bad-request": "Información incompleta o incorrecta.",
  "auth/unauthenticated": "Enlace expirado o inválido.",
  "auth/unauthorized": "No tienes permiso para esta acción.",
  "http/not-found": "El recurso solicitado no existe.",
  "db/duplicate-key": "Este registro ya existe.",
  "http/unknown-error": "Error inesperado. Intenta de nuevo.",
};

/**
 * Resuelve el mensaje a mostrar al usuario en los flujos públicos de
 * consentimiento, siguiendo la regla del contrato:
 *  1) Si el backend envía `error.message`, se muestra tal cual.
 *  2) Si es un 5xx, mensaje genérico de error inesperado.
 *  3) Si es 4xx sin mensaje, genérico según el `code`.
 */
export function resolvePublicConsentError(error?: APIError): string {
  if (!error) return "Error inesperado. Intenta de nuevo.";

  if (
    error.message &&
    typeof error.message === "string" &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  const status =
    error.status ??
    (error as { statusCode?: number }).statusCode ??
    undefined;

  if (typeof status === "number" && status >= 500) {
    return "Ocurrió un error inesperado. Intenta de nuevo más tarde.";
  }

  const code = error.code ?? "";
  return (
    PUBLIC_CONSENT_GENERIC_BY_CODE[code] ?? "Error inesperado. Intenta de nuevo."
  );
}

/**
 * Mensajes amigables para el import de la base de Excel de un formulario de
 * recolección (POST /companies/:id/collectForms/from-template). El backend puede
 * devolver mensajes técnicos (p. ej. "El campo 'userTempId' ya está en uso"), por
 * lo que mapeamos por `code` a un mensaje claro para el usuario.
 */
const COLLECT_FORM_IMPORT_ERRORS: Record<string, string> = {
  "http/bad-request":
    "Faltan datos requeridos. Verifica que el archivo tenga el formato correcto.",
  "db/duplicate-key": "Algunos registros ya existen en la base de datos.",
  "http/unknown-error": "Error inesperado al importar. Intenta de nuevo.",
};

export function resolveCollectFormImportError(error?: APIError): string {
  if (!error) return "Error inesperado al importar. Intenta de nuevo.";

  const code = error.code ?? "";
  if (code in COLLECT_FORM_IMPORT_ERRORS) {
    return COLLECT_FORM_IMPORT_ERRORS[code];
  }

  const status =
    error.status ?? (error as { statusCode?: number }).statusCode ?? undefined;
  if (typeof status === "number" && status >= 500) {
    return COLLECT_FORM_IMPORT_ERRORS["http/unknown-error"];
  }

  if (
    error.message &&
    typeof error.message === "string" &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return "Error inesperado al importar. Intenta de nuevo.";
}
