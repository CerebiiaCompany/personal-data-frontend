/**
 * Validador de RUT chileno (cuerpo numérico + dígito verificador módulo 11,
 * 0-9 o "K"). Espejo de personal-data-backend/src/utils/rutValidator.ts.
 */

function splitRut(raw: string): { body: string; checkDigit: string } | null {
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

/** Dígito verificador módulo 11 (pesos 2..7 cíclicos desde la derecha). */
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

/** Forma canónica "cuerpo-DV" (sin puntos, DV mayúscula). */
export function normalizeRut(raw: string): string {
  const parsed = splitRut(raw);
  if (!parsed) return raw.trim();
  return `${parsed.body}-${parsed.checkDigit}`;
}

/** Formato + dígito verificador correctos (módulo 11). */
export function isValidRut(raw: string): boolean {
  const parsed = splitRut(raw);
  if (!parsed) return false;
  const { body, checkDigit } = parsed;

  if (!/^\d+$/.test(body)) return false;
  if (!/^[0-9K]$/.test(checkDigit)) return false;

  return computeRutCheckDigit(body) === checkDigit;
}

/**
 * Formatea para UI: 123456785 → 12.345.678-5.
 * Con menos de 2 caracteres útiles deja el valor limpio sin forzar guion.
 */
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
