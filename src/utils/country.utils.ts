import { CountryIsoCode } from "@/types/companyArea.types";

function getFlagUrl(
  code: CountryIsoCode,
  format = "png",
  size = "64",
  style = "flat"
): string {
  // ejemplo usando FlagsAPI
  return `https://flagsapi.com/${code}/${style}/${size}.${format}`;
}

// Item CHK-014 (auditoría 2026-08-26/27): ampliado junto con
// companyArea.types.ts#countriesOptions — Record<CountryIsoCode,...> obliga
// a que las 22 claves estén presentes (el compilador lo verifica).
const COUNTRIES_DICT: Record<CountryIsoCode, { name: string; flag: string }> = {
  cl: { name: "Chile", flag: getFlagUrl("cl") },
  ar: { name: "Argentina", flag: getFlagUrl("ar") },
  bo: { name: "Bolivia", flag: getFlagUrl("bo") },
  br: { name: "Brasil", flag: getFlagUrl("br") },
  co: { name: "Colombia", flag: getFlagUrl("co") },
  cr: { name: "Costa Rica", flag: getFlagUrl("cr") },
  cu: { name: "Cuba", flag: getFlagUrl("cu") },
  do: { name: "República Dominicana", flag: getFlagUrl("do") },
  ec: { name: "Ecuador", flag: getFlagUrl("ec") },
  sv: { name: "El Salvador", flag: getFlagUrl("sv") },
  es: { name: "España", flag: getFlagUrl("es") },
  gt: { name: "Guatemala", flag: getFlagUrl("gt") },
  hn: { name: "Honduras", flag: getFlagUrl("hn") },
  mx: { name: "México", flag: getFlagUrl("mx") },
  ni: { name: "Nicaragua", flag: getFlagUrl("ni") },
  pa: { name: "Panamá", flag: getFlagUrl("pa") },
  py: { name: "Paraguay", flag: getFlagUrl("py") },
  pe: { name: "Perú", flag: getFlagUrl("pe") },
  pr: { name: "Puerto Rico", flag: getFlagUrl("pr") },
  uy: { name: "Uruguay", flag: getFlagUrl("uy") },
  ve: { name: "Venezuela", flag: getFlagUrl("ve") },
  us: { name: "Estados Unidos", flag: getFlagUrl("us") },
};

export function normalizeCountryIsoCode(
  code?: string | null
): CountryIsoCode | undefined {
  if (!code) return undefined;
  const normalized = code.toLowerCase() as CountryIsoCode;
  return COUNTRIES_DICT[normalized] ? normalized : undefined;
}

export function getCountryData(
  code?: string | CountryIsoCode | null
): (typeof COUNTRIES_DICT)["co"] {
  const normalized = normalizeCountryIsoCode(code);
  return normalized
    ? COUNTRIES_DICT[normalized]
    : { name: "País inválido", flag: "" };
}
