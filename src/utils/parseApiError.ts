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
