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

const COUNTRIES_DICT: Record<CountryIsoCode, { name: string; flag: string }> = {
  ve: {
    name: "Venezuela",
    flag: getFlagUrl("ve"),
  },
  co: {
    name: "Colombia",
    flag: getFlagUrl("co"),
  },
  us: {
    name: "United States",
    flag: getFlagUrl("us"),
  },
};

export function getCountryData(
  code: CountryIsoCode
): (typeof COUNTRIES_DICT)["co"] {
  return COUNTRIES_DICT[code] || { name: "País inválido", flag: "" };
}
