import { APIResponse } from "@/types/api.types";
import { WizardSessionResponse } from "@/types/wizardRisk.types";
import { customFetch } from "@/utils/customFetch";

/**
 * Crea o retoma la sesión del Wizard de Diagnóstico de Riesgo para la empresa
 * activa. La autenticación viaja por cookie de sesión (ver customFetch), no
 * por header Authorization manual.
 */
export async function createOrResumeWizardSession(
  companyId: string
): Promise<APIResponse<WizardSessionResponse>> {
  return customFetch(
    "/wizard/sessions",
    {
      method: "POST",
      body: JSON.stringify({ companyId }),
    },
    undefined,
    // Los reintentos ante error de red/caída se hacen a nivel de useWizardSession
    // con backoff exponencial (1s, 2s, 4s); aquí no se reintenta.
    { retries: 0 }
  );
}

export interface WizardAbandonedAuditEvent {
  sessionId: string;
  organizationId: string;
  lastActivityAt: string;
}

/** Registra en auditoría que una sesión fue marcada como ABANDONED por inactividad. */
export async function logWizardAbandonedEvent(
  event: WizardAbandonedAuditEvent
): Promise<APIResponse<unknown>> {
  return customFetch("/wizard/sessions/abandoned-audit", {
    method: "POST",
    body: JSON.stringify(event),
  });
}
