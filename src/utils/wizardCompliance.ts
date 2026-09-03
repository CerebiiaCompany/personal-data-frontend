import { BLOCK5_TREATMENT_CARDS } from "@/constants/wizard-blocks/block5Questions";
import { RiskLevel, WizardAnswers, WizardCompliancePlan } from "@/types/wizardRisk.types";

const EMPTY_RISK_COUNTS: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

/**
 * Batch 9 — cálculo del plan de cumplimiento. Vive en el frontend porque
 * las tarjetas de tratamiento (título, riesgo, recomendaciones) son
 * contenido que solo existe acá (block5Questions.ts) — el backend no
 * duplica este catálogo, solo persiste el resultado ya calculado (ver
 * POST /wizard-risk/sessions/:id/confirm).
 *
 * Fórmula (primera versión, ajustable): por cada tarjeta de tratamiento
 * visible, "Sí" cuenta como 1 punto, "Parcialmente" como 0.5, "No" como 0;
 * el score es el promedio sobre las tarjetas visibles. Las recomendaciones
 * son las de cualquier tarjeta NO respondida "Sí".
 */
export function computeWizardCompliancePlan(answers: WizardAnswers): WizardCompliancePlan {
  const visibleCards = BLOCK5_TREATMENT_CARDS.filter((card) =>
    card.showIf ? card.showIf(answers) : card.hideIf ? !card.hideIf(answers) : true
  );

  const riskCounts: Record<RiskLevel, number> = { ...EMPTY_RISK_COUNTS };
  const recommendedTreatments = new Set<string>();
  let scoreSum = 0;

  for (const card of visibleCards) {
    const answer = answers[card.questionKey]?.[0];
    if (answer === "yes") scoreSum += 1;
    else if (answer === "partial") scoreSum += 0.5;

    if (answer !== "yes") {
      riskCounts[card.riskLevel] += 1;
      card.recommendedTreatments.forEach((t) => recommendedTreatments.add(t));
    }
  }

  const score = visibleCards.length > 0 ? Math.round((scoreSum / visibleCards.length) * 100) : 100;

  return {
    score,
    riskCounts,
    recommendedTreatments: Array.from(recommendedTreatments),
  };
}
