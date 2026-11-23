import { useCompanyCountryCode } from "@/hooks/useCompanyCountryCode";

/**
 * El Wizard de Diagnóstico Inicial de Riesgo (/wizard/**) está construido
 * sobre la Ley 21.719 (Chile): solo aplica a empresas con countryCode "CL".
 * Para cualquier otro país (p. ej. Colombia) no debe mostrarse nunca — el
 * backend también lo rechaza (requireChileanCompany).
 */
export const WIZARD_RISK_COUNTRY = "CL";

export function isWizardRiskEnabledForCountry(countryCode: string | null | undefined): boolean {
  return (countryCode ?? "").trim().toUpperCase() === WIZARD_RISK_COUNTRY;
}

interface UseIsWizardRiskEnabledResult {
  /** true solo si la empresa activa es chilena. */
  enabled: boolean;
  /** false mientras todavía no se conoce el país de la empresa. */
  known: boolean;
}

export function useIsWizardRiskEnabled(): UseIsWizardRiskEnabledResult {
  const countryCode = useCompanyCountryCode();
  return {
    enabled: isWizardRiskEnabledForCountry(countryCode),
    known: Boolean(countryCode),
  };
}
