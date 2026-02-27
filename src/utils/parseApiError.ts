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
  "otp/pending-code": "Ya hay un código pendiente para este usuario",
  "masivapp/error": "Error al enviar el mensaje",
};

export function parseApiError(error: APIError): string {
  // Priorizar el mensaje que viene del backend si existe
  if (error?.message && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  // Si no hay mensaje, usar el diccionario por código
  if (error?.code && ERROR_DICTIONARY[error.code]) {
    return ERROR_DICTIONARY[error.code];
  }

  // Fallback seguro
  return "Error desconocido";
}
