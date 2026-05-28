import { APIError } from "@/types/api.types";
import { ERROR_DICTIONARY, parseApiError } from "@/utils/parseApiError";

export type ApiErrorToastVariant =
  | "rate-limit"
  | "auth"
  | "validation"
  | "network"
  | "server"
  | "default";

export interface ApiErrorPresentation {
  title: string;
  message: string;
  variant: ApiErrorToastVariant;
  duration: number;
  hint?: string;
}

const RATE_LIMIT_CODES = new Set([
  "http/too-many-requests",
  "rate-limit/lookup",
  "rate-limit/verify",
  "rate-limit/otp-document",
  "rate-limit/exceeded",
]);

function isRateLimitError(error: APIError, httpStatus?: number): boolean {
  if (httpStatus === 429) return true;
  if (error.code && RATE_LIMIT_CODES.has(error.code)) return true;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("intenta de nuevo") ||
    message.includes("demasiadas solicitudes") ||
    message.includes("rate limit") ||
    message.includes("límite")
  );
}

function isAuthError(code?: string, httpStatus?: number): boolean {
  if (httpStatus === 401 || httpStatus === 403) return true;
  return Boolean(
    code?.startsWith("auth/") ||
      code === "http/unauthorized" ||
      code === "http/forbidden"
  );
}

function isValidationError(code?: string, httpStatus?: number): boolean {
  if (httpStatus === 400 || httpStatus === 422) return true;
  return Boolean(
    code === "http/bad-request" ||
      code === "otp/pending-code" ||
      code?.startsWith("validation/")
  );
}

function isNetworkError(code?: string): boolean {
  return Boolean(
    code === "http/network-error" ||
      code === "http/timeout" ||
      code === "http/invalid-response"
  );
}

function getRateLimitHint(code?: string): string {
  if (code === "rate-limit/otp-document") {
    return "Por seguridad solo se permiten 3 códigos por documento cada hora.";
  }
  if (code === "rate-limit/verify") {
    return "Has superado el límite de intentos de verificación desde tu conexión.";
  }
  if (code === "rate-limit/lookup") {
    return "Has superado el límite de búsquedas desde tu conexión.";
  }
  return "Es una medida de seguridad para proteger tu información.";
}

export function getApiErrorPresentation(
  error: APIError,
  httpStatus?: number
): ApiErrorPresentation {
  const message = parseApiError(error);
  const status = httpStatus ?? error.status;
  const code = error.code;

  if (isRateLimitError(error, status)) {
    return {
      title: "Demasiados intentos",
      message,
      variant: "rate-limit",
      duration: 9000,
      hint: getRateLimitHint(code),
    };
  }

  if (isAuthError(code, status)) {
    return {
      title: "Acceso no permitido",
      message,
      variant: "auth",
      duration: 7000,
    };
  }

  if (isValidationError(code, status)) {
    return {
      title: "No pudimos continuar",
      message,
      variant: "validation",
      duration: 7000,
    };
  }

  if (isNetworkError(code)) {
    return {
      title: "Problema de conexión",
      message,
      variant: "network",
      duration: 7000,
      hint: "Verifica tu internet e intenta de nuevo.",
    };
  }

  if (status && status >= 500) {
    return {
      title: "Error del servidor",
      message,
      variant: "server",
      duration: 7000,
      hint: "Si el problema persiste, intenta más tarde.",
    };
  }

  if (code && code in ERROR_DICTIONARY && code !== "http/unknown-error") {
    return {
      title: "Algo salió mal",
      message,
      variant: "default",
      duration: 6000,
    };
  }

  return {
    title: "Algo salió mal",
    message,
    variant: "default",
    duration: 6000,
  };
}
