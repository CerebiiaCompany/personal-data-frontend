import { useEffect, useState } from "react";
import { createOrResumeWizardSession } from "@/lib/wizardSession.api";

interface UseWizardRiskStatusResult {
  /** null mientras carga, o si companyId todavía no está disponible. */
  status: string | null;
  loading: boolean;
}

/**
 * Batch 14 (swap) — versión mínima de useWizardSession.ts (que vive dentro
 * de /wizard/**) para consultar el estado real de la sesión de riesgo
 * desde fuera de ese árbol, sin depender de WizardContext/localStorage.
 * Reutiliza el mismo endpoint create-or-resume (idempotente) — se llama
 * una sola vez por montaje de SetupWizardProvider (persiste durante toda
 * la sesión de navegación bajo el layout con navbar), no en cada página.
 */
export function useWizardRiskStatus(companyId: string | undefined): UseWizardRiskStatusResult {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const res = await createOrResumeWizardSession(companyId);
      if (cancelled) return;
      setStatus(res.data?.status ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return { status, loading };
}
