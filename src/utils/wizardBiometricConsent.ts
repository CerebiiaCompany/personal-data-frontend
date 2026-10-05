import { WizardTreatment } from "@/types/wizardRisk.types";

const BIOMETRIC_TREATMENT_IDS = new Set([
  "control_biometrico",
  "asistencia_biometrica",
  "control_biometrico_clientes",
]);

/** Tratamientos inferidos que requieren consentimiento biométrico (Art. 16 / C-01). */
export function isBiometricConsentWizardTreatment(treatment: Pick<WizardTreatment, "id" | "name" | "sourceKeys">): boolean {
  if (BIOMETRIC_TREATMENT_IDS.has(treatment.id)) return true;
  if (treatment.sourceKeys.some((key) => key === "B2-P8" || key.startsWith("B2-P8-"))) return true;
  return /biometr/i.test(treatment.name);
}

export function acceptedBiometricConsentTreatments(treatments: WizardTreatment[]): WizardTreatment[] {
  return treatments.filter((row) => row.accepted && isBiometricConsentWizardTreatment(row));
}
