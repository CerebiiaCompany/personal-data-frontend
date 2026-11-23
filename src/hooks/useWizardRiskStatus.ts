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
 *
 * Pasar companyId undefined desactiva la consulta (p. ej. empresas no
 * chilenas, ver useIsWizardRiskEnabled): no se crea ninguna sesión.
 */
export function useWizardRiskStatus(companyId: string | undefined): UseWizardRiskStatusResult {
  const [status, setStatus] = useState<string | null>(null);
  // companyId para el que ya se tiene respuesta. Si companyId pasa de
  // undefined a un valor (p. ej. cuando se conoce el país de la empresa),
  // `loading` es true desde ese mismo render — antes de que corra el
  // efecto — para que nadie actúe sobre un status null todavía no pedido.
  const [loadedFor, setLoadedFor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    (async () => {
      const res = await createOrResumeWizardSession(companyId);
      if (cancelled) return;
      setStatus(res.data?.status ?? null);
      setLoadedFor(companyId);
    })();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const loading = Boolean(companyId) && loadedFor !== companyId;
  return { status: companyId && !loading ? status : null, loading };
}
