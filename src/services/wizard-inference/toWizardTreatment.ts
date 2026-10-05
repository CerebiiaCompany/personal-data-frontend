import { WizardTreatment } from "@/types/wizardRisk.types";
import { formatRetentionPeriod } from "./engine/retentionInjector";
import { InferredTreatment } from "./types";

export function formatLegalBasis(treatment: InferredTreatment): string {
  const { label, article } = treatment.legalBasis;
  return article ? `${label} (${article})` : label;
}

export function formatSecurityMeasures(treatment: InferredTreatment): string {
  return treatment.securityMeasures.map((item) => item.label).join("\n");
}

/**
 * Adapta el DTO del motor al contrato del Bloque 5 (campos string + metadatos).
 */
export function toWizardTreatment(treatment: InferredTreatment): WizardTreatment {
  return {
    id: treatment.id,
    name: treatment.name,
    legalBasis: formatLegalBasis(treatment),
    securityMeasures: formatSecurityMeasures(treatment),
    retentionPeriod: formatRetentionPeriod(treatment.retention),
    accepted: false,
    modified: false,
    sourceKeys: treatment.sourceKeys,
    primaryData: treatment.primaryData,
    isSensitive: treatment.isSensitive,
    sensitiveLegalRef: treatment.sensitiveLegalRef,
    internationalTransfer: treatment.internationalTransfer,
    internationalTransferReason: treatment.internationalTransferReason,
    legalBasisLocked: treatment.legalBasis.locked,
    legalBasisCode: treatment.legalBasis.code,
    legalBasisArticle: treatment.legalBasis.article,
    legalBasisRestriction: treatment.legalBasis.restriction,
    retentionStartEvent: treatment.retention.startEvent,
    retentionYears: treatment.retention.durationYears,
    retentionDays: treatment.retention.durationDays,
    retentionCanReduce: treatment.retention.canReduce,
    securityMeasureItems: treatment.securityMeasures.map((item) => ({
      label: item.label,
      removable: item.removable,
      level: item.level,
    })),
    generatesPendingReview: treatment.generatesPendingReview,
    pendingReviewQuestionKey: treatment.pendingReviewQuestionKey,
    purposeNivel1Code: treatment.purposeNivel1Code,
    purposeNivel1Label: treatment.purposeNivel1Label,
    purposeNivel2: treatment.purposeNivel2,
    purposeDetail: treatment.purposeDetail,
  };
}
