/**
 * Validador de RUT chileno con Módulo 11.
 */

/**
 * Implementación estricta del algoritmo Módulo 11 Chileno para calcular
 * y validar el dígito verificador de un RUT (persona natural o jurídica).
 * Limpia puntos, guiones y espacios antes de realizar el cálculo.
 */
export function modulo_11_chileno(rut: string): boolean {
  if (!rut || typeof rut !== "string") return false;
  const cleaned = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const checkDigit = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDigit = "";
  if (remainder === 11) {
    expectedDigit = "0";
  } else if (remainder === 10) {
    expectedDigit = "K";
  } else {
    expectedDigit = String(remainder);
  }

  return expectedDigit === checkDigit;
}

export function splitRut(raw: string): { body: string; checkDigit: string } | null {
  const cleaned = raw.replace(/[.\s]/g, "").toUpperCase();
  if (!cleaned) return null;

  const dashIndex = cleaned.lastIndexOf("-");
  const body =
    dashIndex === -1 ? cleaned.slice(0, -1) : cleaned.slice(0, dashIndex);
  const checkDigit =
    dashIndex === -1 ? cleaned.slice(-1) : cleaned.slice(dashIndex + 1);

  if (!body || !checkDigit) return null;
  return { body, checkDigit };
}

export function computeRutCheckDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

export function normalizeRut(raw: string): string {
  const parsed = splitRut(raw);
  if (!parsed) return raw.trim();
  return `${parsed.body}-${parsed.checkDigit}`;
}

export function isValidRut(raw: string): boolean {
  return modulo_11_chileno(raw);
}

export function formatRutDisplay(raw: string): string {
  const cleaned = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned;

  const body = cleaned.slice(0, -1).replace(/\D/g, "");
  const checkDigit = cleaned.slice(-1);
  if (!body) return checkDigit;

  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${checkDigit}`;
}

export function normalizeDocNumber(
  docType: string | null | undefined,
  raw: string | number | null | undefined
): string {
  const str = String(raw ?? "").trim();
  return docType === "RUT" || docType === "CI" ? normalizeRut(str) : str;
}

export const RUT_INVALID_MESSAGE =
  "RUT inválido. Formato: 12.345.678-5 o 12.345.678-K (revisa el dígito verificador)";
