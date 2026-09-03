import { useEffect } from "react";
import { useWizardContext } from "@/contexts/WizardContext";
import { logWizardAbandonedEvent } from "@/lib/wizardSession.api";
import { WIZARD_ABANDON_AFTER_DAYS } from "@/types/wizardRisk.types";

const DEFAULT_CHECK_INTERVAL_MINUTES = 60;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

/**
 * Detecta sesiones inactivas por más de WIZARD_ABANDON_AFTER_DAYS y las marca
 * ABANDONED. Se ejecuta al montar y luego cada `intervalMinutes`.
 */
export function useWizardAbandonDetector(intervalMinutes: number = DEFAULT_CHECK_INTERVAL_MINUTES) {
  const { state, setStatus } = useWizardContext();

  useEffect(() => {
    function check() {
      if (state.status !== "IN_PROGRESS" || !state.sessionId || !state.lastActivityAt) return;
      const elapsedMs = Date.now() - new Date(state.lastActivityAt).getTime();
      if (elapsedMs <= WIZARD_ABANDON_AFTER_DAYS * MS_PER_DAY) return;

      setStatus("ABANDONED");
      void logWizardAbandonedEvent({
        sessionId: state.sessionId,
        organizationId: state.organizationId,
        lastActivityAt: state.lastActivityAt,
      });
    }

    check();
    const intervalId = setInterval(check, intervalMinutes * MS_PER_MINUTE);
    return () => clearInterval(intervalId);
  }, [state.status, state.sessionId, state.lastActivityAt, state.organizationId, setStatus, intervalMinutes]);
}
