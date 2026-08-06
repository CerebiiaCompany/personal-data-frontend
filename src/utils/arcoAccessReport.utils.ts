import {
  ArcoAccessProcessingPurpose,
  ArcoAccessReportAutoPopulated,
  ArcoAccessReportDraftResponse,
  ArcoMissingDataOverride,
  ArcoMissingOverrideField,
  ArcoOfficerFieldsConfig,
} from "@/types/arco.admin.types";
import { isArcoDataOriginFromSystem } from "@/utils/arcoAdmin.utils";

export function getResolvedAccessReport(
  draft: ArcoAccessReportDraftResponse | null | undefined
) {
  if (!draft) return undefined;
  return draft.accessReport ?? draft.savedReport;
}

export function getMissingOverrideFields(
  officerFields?: ArcoOfficerFieldsConfig
): Set<ArcoMissingOverrideField> {
  const items = officerFields?.missingDataOverrides ?? [];
  if (items.length > 0) {
    return new Set(items.map((m) => m.field));
  }
  return new Set();
}

export function needsDataOriginOverride(
  autoPopulated: ArcoAccessReportAutoPopulated | undefined,
  missing: Set<ArcoMissingOverrideField>
): boolean {
  if (missing.has("dataOriginOverride")) return true;
  if (missing.size > 0) return false;
  return Boolean(
    autoPopulated && !isArcoDataOriginFromSystem(autoPopulated.dataOriginRaw)
  );
}

export function needsConsentStatusOverride(
  missing: Set<ArcoMissingOverrideField>
): boolean {
  return missing.has("consentStatusOverride");
}

export function needsProcessingPurposesOverride(
  missing: Set<ArcoMissingOverrideField>
): boolean {
  return missing.has("processingPurposesOverride");
}

const FRIENDLY_OVERRIDE_DESCRIPTIONS: Record<ArcoMissingOverrideField, string> = {
  dataOriginOverride:
    "Indica cómo se obtuvieron los datos (ej: formulario físico en tienda, campaña 2021).",
  consentStatusOverride:
    "Describe el estado del consentimiento en lenguaje claro (ej: otorgado verbalmente antes del sistema digital).",
  processingPurposesOverride:
    "Completa tipo de dato y finalidad. Lo ideal es que vengan del RAT (tratamientos ACTIVE).",
};

export function getOverrideDescription(
  overrides: ArcoMissingDataOverride[] | undefined,
  field: ArcoMissingOverrideField
): string {
  const fromApi = overrides?.find((o) => o.field === field)?.description?.trim();
  // Evita filtrar a la UI descripciones técnicas del backend (ej. "array de objetos").
  if (fromApi && !/array de objetos|\{.*dataType/i.test(fromApi)) {
    return fromApi;
  }
  return FRIENDLY_OVERRIDE_DESCRIPTIONS[field];
}

/** Mensaje del banner según qué campos faltan (no siempre es "registro antiguo"). */
export function getMissingDataBannerMessage(
  missing: Set<ArcoMissingOverrideField>
): string {
  const legacyOnly =
    (missing.has("dataOriginOverride") || missing.has("consentStatusOverride")) &&
    !missing.has("processingPurposesOverride");
  const purposesOnly =
    missing.has("processingPurposesOverride") &&
    !missing.has("dataOriginOverride") &&
    !missing.has("consentStatusOverride");

  if (purposesOnly) {
    return "No se encontraron finalidades en el RAT (tratamientos ACTIVE). Complétalas abajo o activa un tratamiento con finalidad en Tratamientos (RAT).";
  }
  if (legacyOnly) {
    return "Algunos datos del consentimiento no estánieron autocompletarse (registro sin trazabilidad completa). Complétalos en la sección del oficial.";
  }
  if (missing.has("processingPurposesOverride")) {
    return "Faltan datos para el informe: finalidades del RAT y/o información de consentimiento. Complétalos en la sección del oficial.";
  }
  return "Algunos datos no pudieron autocompletarse. Complétalos en la sección del oficial.";
}

export function chileOfficerFieldRequired(
  officerFields: ArcoOfficerFieldsConfig | undefined,
  field: string
): boolean {
  return officerFields?.requiredForChile?.includes(field) ?? false;
}

export const EMPTY_PROCESSING_PURPOSE: ArcoAccessProcessingPurpose = {
  dataType: "",
  purpose: "",
};
