/** Detección robusta de progreso del wizard (tolerante a campos ausentes en API). */
import { WizardStatus } from "@/types/wizard.types";

const PHASE2_STEP_PREFIX = "rat_";

function isRatStep(stepId: string | undefined): boolean {
  return typeof stepId === "string" && stepId.startsWith(PHASE2_STEP_PREFIX);
}

export function isWizardPhase1Done(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  // Solo cuenta la fase 1 del wizard cuando se aplicó formalmente (applyWizardPhase1).
  // initialSetupCompleted (formulario ONB-01) es un paso previo distinto: no marca phase1CompletedAt.
  return status.phase1Completed === true || Boolean(status.lastAppliedAt);
}

export function isWizardPhase2Done(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  // Exigir señal positiva real. Si el paso actual sigue en rat_* sin treatment,
  // NO está hecha aunque phase2Completed venga true por bug del backend.
  if (isRatStep(status.currentStepId) && !status.phase2TreatmentId && !status.phase2AppliedAt) {
    return false;
  }
  return status.phase2Completed === true || Boolean(status.phase2AppliedAt);
}

export function isWizardPhase3Done(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  return status.phase3Completed === true || Boolean(status.phase3AppliedAt);
}

/** Fase 2 falta si la fase 1 ya pasó y la 2 no está marcada como hecha. */
export function isWizardPhase2Pending(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  if (isWizardPhase2Done(status)) return false;
  if (isWizardPhase1Done(status)) return true;
  if (isRatStep(status.currentStepId)) return true;
  return false;
}

/** Fase 3 falta si la fase 2 ya pasó y la 3 no está hecha. */
export function isWizardPhase3Pending(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  if (!isWizardPhase2Done(status)) return false;
  return !isWizardPhase3Done(status);
}

export function isWizardPhase4Done(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  return status.phase4Completed === true || Boolean(status.phase4AppliedAt);
}

export function isWizardPhase4Pending(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  if (isWizardPhase4Done(status)) return false;
  return isWizardPhase3Done(status);
}

export function isWizardPhase5Pending(status: WizardStatus | null | undefined): boolean {
  if (!status) return false;
  if (!isWizardPhase4Done(status)) return false;
  return (
    status.phase5Pending === true ||
    Boolean(status.policySync?.isOutdated && !status.policySync?.acknowledged)
  );
}

export function resolveWizardEntryPhase(status: WizardStatus | null | undefined): 1 | 2 | 3 | 4 | 5 {
  if (isWizardPhase5Pending(status)) return 5;
  if (isWizardPhase4Pending(status)) return 4;
  if (isWizardPhase3Pending(status)) return 3;
  if (isWizardPhase2Pending(status)) return 2;
  if (!isWizardPhase1Done(status)) return 1;
  return 1;
}
