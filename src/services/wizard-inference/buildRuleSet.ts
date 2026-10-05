import {
  LegalBasisAssignment,
  WizardInferenceRuleSet,
  WizardInferenceRulesResponse,
} from "./types";

/**
 * Item wizard_treatment_rules (auditoría externa, 2026-09-08) — indexa la
 * respuesta cruda de GET /companies/:id/wizard-risk/rules (arrays planos,
 * tal como vienen de Postgres) en la forma que el motor consume (Maps por
 * treatmentId, más los 4 fallbacks nombrados). Se hace una sola vez al
 * cargar el Bloque 5, no en cada evaluación.
 */
export function buildRuleSet(response: WizardInferenceRulesResponse): WizardInferenceRuleSet {
  const legalBasisByTreatment = new Map<string, LegalBasisAssignment>();
  const legalBasisFallback = {} as WizardInferenceRuleSet["legalBasisFallback"];

  for (const row of response.legalBasisRules) {
    const assignment: LegalBasisAssignment = {
      code: row.code,
      label: row.label,
      article: row.article,
      alternative: row.alternative ?? undefined,
      restriction: row.restriction,
      locked: row.locked,
    };
    if (row.treatmentId) {
      legalBasisByTreatment.set(row.treatmentId, assignment);
    } else if (row.fallbackKey) {
      legalBasisFallback[row.fallbackKey] = assignment;
    }
  }

  const legalBasisRefinements = new Map(
    response.legalBasisRefinements.map((row) => [row.treatmentId, row])
  );

  const retentionByTreatment = new Map(
    response.retentionRules
      .filter((row): row is typeof row & { treatmentId: string } => Boolean(row.treatmentId))
      .map((row) => [row.treatmentId, row])
  );
  const defaultRetentionRow = response.retentionRules.find((row) => row.isDefault);
  // No debería faltar (siempre sembrado, ver wizardInferenceRules.seed.ts) —
  // fallback defensivo mínimo si un ambiente nuevo todavía no corrió el seed.
  const defaultRetention = defaultRetentionRow ?? {
    durationLabel: "El tiempo estrictamente necesario para la finalidad",
    durationYears: null,
    durationDays: null,
    startEvent: "Fecha de recolección del dato",
    legalFoundation: "Principio de minimización — Art. 3 c) Ley 21.719",
    canReduce: true,
  };

  const finalidadByTreatment = new Map(
    response.finalidadTemplates.map((row) => [row.treatmentId, row])
  );

  return {
    treatmentRules: response.treatmentRules,
    legalBasisByTreatment,
    legalBasisFallback,
    legalBasisRefinements,
    securityRules: response.securityRules,
    retentionByTreatment,
    defaultRetention,
    finalidadByTreatment,
  };
}
