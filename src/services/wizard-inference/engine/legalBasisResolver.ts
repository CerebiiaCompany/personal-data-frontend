import {
  LegalBasisAssignment,
  LegalBasisRefinementRule,
  WizardInferenceFlags,
  WizardInferenceRuleSet,
} from "../types";

export interface LegalBasisDraft {
  id: string;
  tags: string[];
  isSensitive: boolean;
}

/**
 * Item wizard_legal_basis_refinements (auditoría externa, 2026-09-08) —
 * antes LEGAL_BASIS_REFINEMENTS (closures hardcodeados) en este mismo
 * archivo. La condición ("¿algún flag de este OR está activo?") y el
 * resultado (a qué fallback saltar, y si se preserva o se sobreescribe el
 * texto de restricción) ahora vienen de datos (wizard_legal_basis_refinements)
 * — esta función es el único código que interpreta esa forma.
 */
function applyRefinement(
  rule: LegalBasisRefinementRule,
  flags: WizardInferenceFlags,
  catalogued: LegalBasisAssignment,
  rules: WizardInferenceRuleSet
): LegalBasisAssignment {
  const condition = rule.anyOfFlags.some((flag) => Boolean(flags[flag]));
  const outcome = condition
    ? { fallbackKey: rule.trueFallbackKey, mode: rule.trueRestrictionMode, override: rule.trueRestrictionOverride }
    : rule.falseFallbackKey
      ? { fallbackKey: rule.falseFallbackKey, mode: rule.falseRestrictionMode, override: rule.falseRestrictionOverride }
      : null;

  if (!outcome) return catalogued;

  const base = rules.legalBasisFallback[outcome.fallbackKey];
  return {
    ...base,
    restriction: outcome.mode === "override" && outcome.override ? outcome.override : catalogued.restriction,
  };
}

function fallbackByPriority(draft: LegalBasisDraft, rules: WizardInferenceRuleSet): LegalBasisAssignment {
  if (draft.isSensitive || draft.tags.includes("biometria") || draft.tags.includes("salud") || draft.tags.includes("sensible")) {
    return rules.legalBasisFallback.sensitive;
  }
  if (draft.tags.includes("marketing")) {
    return rules.legalBasisFallback.marketing;
  }
  if (draft.tags.includes("clientes") || draft.tags.includes("contratos") || draft.tags.includes("pagos") || draft.tags.includes("app")) {
    return rules.legalBasisFallback.contract;
  }
  return rules.legalBasisFallback.legitimate;
}

/**
 * Asigna la base legal del tratamiento.
 * 1) Catálogo por id (wizard_legal_basis_rules — fuente de verdad de la abogada).
 * 2) Refinamiento condicional si aplica (wizard_legal_basis_refinements).
 * 3) Fallback por prioridad: sensibles/marketing → consentimiento;
 *    contrato → ejecución; resto → interés legítimo.
 */
export function resolveLegalBasis(
  draft: LegalBasisDraft,
  flags: WizardInferenceFlags,
  rules: WizardInferenceRuleSet
): LegalBasisAssignment {
  const catalogued = rules.legalBasisByTreatment.get(draft.id) ?? fallbackByPriority(draft, rules);
  const refinement = rules.legalBasisRefinements.get(draft.id);
  return refinement ? applyRefinement(refinement, flags, catalogued, rules) : catalogued;
}
