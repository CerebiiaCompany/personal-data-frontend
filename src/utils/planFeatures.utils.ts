// Espejo de personal-data-backend/src/utils/planFeatures.ts — ver ese
// archivo para el porqué. Mantener ambos sincronizados si se agrega una
// feature de Fase 2 nueva.

export type PlanTier = "SEMILLA" | "PYME" | "PROFESIONAL" | "BUSINESS" | "ENTERPRISE";

const PLAN_TIER_ORDER: PlanTier[] = [
  "SEMILLA",
  "PYME",
  "PROFESIONAL",
  "BUSINESS",
  "ENTERPRISE",
];

export type PlanFeature = "PORTABILITY";

const FEATURE_MIN_TIER: Record<PlanFeature, PlanTier> = {
  PORTABILITY: "PROFESIONAL",
};

/**
 * true si `tier` alcanza el nivel mínimo requerido por `feature`.
 * Fail-closed: sin tier conocido, ninguna feature de Fase 2 se habilita.
 */
export function hasFeature(
  tier: PlanTier | null | undefined,
  feature: PlanFeature
): boolean {
  if (!tier) return false;
  const tierIndex = PLAN_TIER_ORDER.indexOf(tier);
  const minIndex = PLAN_TIER_ORDER.indexOf(FEATURE_MIN_TIER[feature]);
  if (tierIndex === -1 || minIndex === -1) return false;
  return tierIndex >= minIndex;
}
