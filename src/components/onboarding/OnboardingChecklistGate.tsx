"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { useSetupWizardOptional } from "@/components/wizard/SetupWizardContext";
import OnboardingChecklistWidget from "./OnboardingChecklistWidget";

/**
 * Checklist flotante de primeros pasos. El tour de bienvenida y el asistente
 * viven en SetupWizardContext; ocultamos el widget mientras esos flujos están activos.
 */
export default function OnboardingChecklistGate() {
  const role = useSessionStore((store) => store.user?.role);

  if (role !== "COMPANY_ADMIN") return null;

  return <CompanyAdminOnboardingExperience />;
}

function CompanyAdminOnboardingExperience() {
  const { status } = useOnboardingChecklist();
  const wizard = useSetupWizardOptional();
  const onboardingFlowActive = Boolean(wizard?.isWelcomeVisible || wizard?.isOpen);

  if (!status || onboardingFlowActive) return null;

  return <OnboardingChecklistWidget status={status} />;
}
