import { APIError } from "@/types/api.types";

export const ERROR_DICTIONARY = {
  "http/bad-request": "Error en la petición",
  "db/duplicate-key": "Este registro ya existe",
  "http/unknown-error": "Error desconocido",
  "http/not-found": "Recurso no encontrado",
  "auth/invalid-credentials": "Credenciales inválidas",
  "auth/unauthorized": "No estás autorizado para esta acción",
  "auth/unauthenticated": "Error en la autenticación",
  "otp/pending-code": "Ya hay un código pendiente para este usuario",
  "masivapp/error": "Error al enviar el mensaje",
};

export function parseApiError(error: APIError): string {
  const message = ERROR_DICTIONARY[error.code] || "Error desconocido";

  return message;
}
