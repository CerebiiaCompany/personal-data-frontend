import { RiskLevel, WizardAnswers, WizardCompliancePlan, WizardTreatment } from "@/types/wizardRisk.types";
import { hasYesSelection } from "@/utils/wizardQuestionHelpers";

const EMPTY_RISK_COUNTS: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

/**
 * Plan de cumplimiento a partir de los tratamientos aceptados y los
 * factores de riesgo detectados en Bloque 2.
 */
export function computeWizardCompliancePlan(
  answers: WizardAnswers,
  treatments: WizardTreatment[] = []
): WizardCompliancePlan {
  const riskCounts: Record<RiskLevel, number> = { ...EMPTY_RISK_COUNTS };

  if (hasYesSelection(answers["B2-P6"])) riskCounts.CRITICAL += 1;
  if (hasYesSelection(answers["B2-P8"])) riskCounts.CRITICAL += 1;
  if (hasYesSelection(answers["B2-P10"])) riskCounts.CRITICAL += 1;
  if (hasYesSelection(answers["B2-P13"])) riskCounts.CRITICAL += 1;
  if (hasYesSelection(answers["B2-P11"], ["no_chile", "no_seguro"])) riskCounts.HIGH += 1;
  if (hasYesSelection(answers["B2-P12"])) riskCounts.HIGH += 1;
  if (hasYesSelection(answers["B2-P7"])) riskCounts.HIGH += 1;
  if (hasYesSelection(answers["B2-P9"])) riskCounts.MEDIUM += 1;
  if (hasYesSelection(answers["B2-P14"])) riskCounts.MEDIUM += 1;
  if (hasYesSelection(answers["B2-P15"])) riskCounts.MEDIUM += 1;

  const accepted = treatments.filter((row) => row.accepted);
  const score =
    treatments.length > 0 ? Math.round((accepted.length / treatments.length) * 100) : riskCounts.CRITICAL + riskCounts.HIGH === 0 ? 100 : 70;

  return {
    score,
    riskCounts,
    recommendedTreatments: accepted.map((row) => row.name),
  };
}
