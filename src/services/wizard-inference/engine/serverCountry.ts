/**
 * País de alojamiento del sistema (Bloque 4 / N-16).
 *
 * El catálogo puede sugerir un país ISO; el cliente siempre puede
 * cambiarlo. Si no puede confirmarlo, el valor estable es `no_seguro`
 * (misma convención que B2-P11) y cae en C-04: no se asume Chile ni
 * transferencia internacional.
 */

export const UNKNOWN_SERVER_COUNTRY = "no_seguro";
export const UNKNOWN_SERVER_COUNTRY_LABEL = "No estoy seguro";

/** Clave de nota C-04 cuando la incertidumbre nace del país del servidor. */
export const B4_SYSTEMS_PENDING_KEY = "B4-systems";

const UNKNOWN_ALIASES = new Set([
  "no_seguro",
  "no estoy seguro",
  "por confirmar",
  "extranjero",
  "unknown",
  "n/a",
  "na",
]);

const COMMON_NAME_TO_CODE: Record<string, string> = {
  chile: "CL",
  "estados unidos": "US",
  usa: "US",
  "ee.uu.": "US",
  eeuu: "US",
};

export interface CountryOption {
  code: string;
  name: string;
}

/** Misma lista que backend/src/utils/isoCountries.ts — respaldo si el API no responde. */
export const DEFAULT_ISO_COUNTRIES: CountryOption[] = [
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "AR", name: "Argentina" },
  { code: "BR", name: "Brasil" },
  { code: "MX", name: "México" },
  { code: "PE", name: "Perú" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "EC", name: "Ecuador" },
  { code: "VE", name: "Venezuela" },
  { code: "PA", name: "Panamá" },
  { code: "CR", name: "Costa Rica" },
  { code: "GT", name: "Guatemala" },
  { code: "SV", name: "El Salvador" },
  { code: "HN", name: "Honduras" },
  { code: "NI", name: "Nicaragua" },
  { code: "DO", name: "República Dominicana" },
  { code: "CU", name: "Cuba" },
  { code: "US", name: "Estados Unidos" },
  { code: "CA", name: "Canadá" },
  { code: "ES", name: "España" },
  { code: "PT", name: "Portugal" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Alemania" },
  { code: "IT", name: "Italia" },
  { code: "GB", name: "Reino Unido" },
  { code: "IE", name: "Irlanda" },
  { code: "NL", name: "Países Bajos" },
  { code: "BE", name: "Bélgica" },
  { code: "CH", name: "Suiza" },
  { code: "SE", name: "Suecia" },
  { code: "NO", name: "Noruega" },
  { code: "DK", name: "Dinamarca" },
  { code: "FI", name: "Finlandia" },
  { code: "PL", name: "Polonia" },
  { code: "AT", name: "Austria" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japón" },
  { code: "KR", name: "Corea del Sur" },
  { code: "SG", name: "Singapur" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "Nueva Zelanda" },
  { code: "ZA", name: "Sudáfrica" },
  { code: "IL", name: "Israel" },
  { code: "AE", name: "Emiratos Árabes Unidos" },
];

export function isUnknownServerCountry(value?: string | null): boolean {
  return UNKNOWN_ALIASES.has((value ?? "").trim().toLowerCase());
}

export function canonicalizeServerCountry(
  value: string | undefined | null,
  countries: CountryOption[] = DEFAULT_ISO_COUNTRIES
): string {
  const list = countries.length > 0 ? countries : DEFAULT_ISO_COUNTRIES;
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (isUnknownServerCountry(raw)) return UNKNOWN_SERVER_COUNTRY;

  const upper = raw.toUpperCase();
  if (list.some((country) => country.code === upper)) return upper;

  const byName = list.find((country) => country.name.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.code;

  const common = COMMON_NAME_TO_CODE[raw.toLowerCase()];
  if (common) return common;

  return UNKNOWN_SERVER_COUNTRY;
}

/** País ISO conocido distinto de Chile. `no_seguro` nunca cuenta como extranjero. */
export function isConfirmedForeignCountry(
  value?: string | null,
  countries: CountryOption[] = []
): boolean {
  const canonical = canonicalizeServerCountry(value, countries);
  return Boolean(canonical) && canonical !== UNKNOWN_SERVER_COUNTRY && canonical !== "CL";
}
