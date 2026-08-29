import { useMemo } from "react";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { useSessionStore } from "@/store/useSessionStore";

/**
 * Resuelve el `countryCode` de la empresa activa (p. ej. "CL", "CO").
 *
 * Prioridad:
 * 1. Store de GET /companies/own (más completo: jerarquías, etc.)
 * 2. Objeto `company` embebido en la sesión (/auth)
 * 3. Fallback opcional (p. ej. país del primer área listada)
 */
export function useCompanyCountryCode(
  fallback?: string | null
): string | undefined {
  const companyFromStore = useOwnCompanyStore((store) => store.company?.countryCode);
  const sessionCompanyCode = useSessionStore(
    (store) => store.user?.company?.countryCode
  );

  return useMemo(
    () => companyFromStore ?? sessionCompanyCode ?? fallback ?? undefined,
    [companyFromStore, sessionCompanyCode, fallback]
  );
}
