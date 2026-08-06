"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import {
  hasSeenWelcomeTour,
  markWelcomeTourSeen,
} from "@/utils/welcomeTour.utils";
import OnboardingChecklistWidget from "./OnboardingChecklistWidget";
import WelcomeTourDialog from "./WelcomeTourDialog";

/**
 * Decide si se monta el checklist de onboarding. Deliberadamente compara
 * `user?.role === "COMPANY_ADMIN"` literal en vez de usar
 * `usePermissionCheck().isCompanyAdmin`: ese flag también es `true` para
 * SUPERADMIN, y un SUPERADMIN nunca debe ver el checklist de onboarding
 * de una empresa ajena.
 */
export default function OnboardingChecklistGate() {
  const role = useSessionStore((store) => store.user?.role);

  if (role !== "COMPANY_ADMIN") return null;

  return <CompanyAdminOnboardingExperience />;
}

function CompanyAdminOnboardingExperience() {
  const userId = useSessionStore((store) => store.user?._id);
  const userName = useSessionStore((store) => store.user?.name);
  const { status, loading } = useOnboardingChecklist();

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [focusFirstSteps, setFocusFirstSteps] = useState(false);

  const hasPendingSteps = Boolean(
    status && status.completedCount < status.totalCount
  );

  const shouldOfferWelcome = useMemo(() => {
    if (!userId || loading || !status) return false;
    if (!hasPendingSteps) return false;
    if (hasSeenWelcomeTour(userId)) return false;
    return true;
  }, [userId, loading, status, hasPendingSteps]);

  // El widget decide cuándo ocultarse (incluye animación al completar el
  // último paso). El gate solo deja de montarlo si no hay status.

  useEffect(() => {
    if (shouldOfferWelcome) {
      setWelcomeOpen(true);
      return;
    }
    // Evita dejar el tour "colgado" abierto (oculta el checklist) si ya
    // no corresponde mostrarlo.
    if (userId && hasSeenWelcomeTour(userId)) {
      setWelcomeOpen(false);
    }
  }, [shouldOfferWelcome, userId]);

  const handleWelcomeComplete = useCallback(() => {
    markWelcomeTourSeen(userId);
    setWelcomeOpen(false);
    setFocusFirstSteps(true);
  }, [userId]);

  const handleFocusHandled = useCallback(() => {
    setFocusFirstSteps(false);
  }, []);

  return (
    <>
      <WelcomeTourDialog
        open={welcomeOpen}
        userName={userName}
        onComplete={handleWelcomeComplete}
      />
      {status && (
        <OnboardingChecklistWidget
          status={status}
          hidden={welcomeOpen}
          focusFirstSteps={focusFirstSteps}
          onFocusHandled={handleFocusHandled}
        />
      )}
    </>
  );
}
