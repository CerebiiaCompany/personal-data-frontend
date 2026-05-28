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

export function getOverrideDescription(
  overrides: ArcoMissingDataOverride[] | undefined,
  field: ArcoMissingOverrideField
): string | undefined {
  return overrides?.find((o) => o.field === field)?.description;
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
