import { PERSONAS_COUNTRY_CONTENT } from "@/constants/personasCountryContent";
import { usePersonasCountryStore } from "@/store/usePersonasCountryStore";

export function usePersonasCountryContent() {
  const country = usePersonasCountryStore((s) => s.country);
  return PERSONAS_COUNTRY_CONTENT[country];
}
