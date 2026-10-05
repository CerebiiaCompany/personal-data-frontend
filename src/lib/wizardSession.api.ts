import { APIResponse } from "@/types/api.types";
import {
  SystemRecord,
  WizardAnswers,
  WizardConfirmResult,
  WizardDpoForm,
  WizardReopenConfirmResult,
  WizardReopenSessionResponse,
  WizardSessionResponse,
} from "@/types/wizardRisk.types";
import { WizardTreatmentPersistPayload } from "@/utils/wizardTreatmentPersist";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/utils/downloadFile";
import { WizardInferenceRulesResponse } from "@/services/wizard-inference";

/**
 * Item wizard_treatment_rules (auditoría externa, 2026-09-08) — el motor de
 * inferencia (WizardInferenceService) antes importaba estos catálogos
 * hardcodeados desde ./services/wizard-inference/catalogs/*.ts (borrados).
 * Se consulta una sola vez al entrar al Bloque 5 (ver WizardBlock5.tsx), no
 * por pregunta — mismo criterio que createOrResumeWizardSession.
 */
export async function fetchWizardInferenceRules(
  companyId: string
): Promise<APIResponse<WizardInferenceRulesResponse>> {
  return customFetch(`/companies/${companyId}/wizard-risk/rules`);
}

/**
 * Crea o retoma la sesión del Wizard de Diagnóstico de Riesgo para la empresa
 * activa. La autenticación viaja por cookie de sesión (ver customFetch), no
 * por header Authorization manual. Backend: wizardRiskSession.controller.ts
 * (personal-data-backend).
 */
export async function createOrResumeWizardSession(
  companyId: string
): Promise<APIResponse<WizardSessionResponse>> {
  return customFetch(
    `/companies/${companyId}/wizard-risk/sessions`,
    { method: "POST" },
    undefined,
    // Los reintentos ante error de red/caída se hacen a nivel de useWizardSession
    // con backoff exponencial (1s, 2s, 4s); aquí no se reintenta.
    { retries: 0 }
  );
}

export interface WizardRiskSessionDetail {
  sessionId: string;
  status: string;
  currentBlock: number;
  currentQuestion: number;
  answers: WizardAnswers;
  createdAt: string;
  lastActivityAt: string;
}

export async function getWizardSession(
  companyId: string,
  sessionId: string
): Promise<APIResponse<WizardRiskSessionDetail>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}`);
}

export interface SaveWizardAnswerResult {
  saved: true;
  nextQuestionKey: string;
  showBlockTransition: boolean;
}

export async function saveWizardAnswer(
  companyId: string,
  sessionId: string,
  questionKey: string,
  answerValue: string[]
): Promise<APIResponse<SaveWizardAnswerResult>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionKey, answerValue }),
  });
}

export interface SaveWizardSystemsResult {
  saved: true;
}

/** Batch 7 — guarda la tabla de sistemas completa (Bloque 4) y avanza currentQuestion. */
export async function saveWizardSystems(
  companyId: string,
  sessionId: string,
  systems: SystemRecord[]
): Promise<APIResponse<SaveWizardSystemsResult>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}/systems`, {
    method: "PATCH",
    body: JSON.stringify({ systems }),
  });
}

/** Batch 9 — confirma y activa el plan de cumplimiento (transición final a COMPLETED). */
export async function confirmWizardSession(
  companyId: string,
  sessionId: string,
  payload: {
    dpoAssigned: string;
    dpoForm: WizardDpoForm;
    acknowledge: boolean;
    compliancePlan: WizardConfirmResult["compliancePlan"];
    treatments?: WizardTreatmentPersistPayload[];
  }
): Promise<APIResponse<WizardConfirmResult>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Item N-15 — reabre una sesión COMPLETED para que el admin corrija
 * Bloques 1 a 4 (el Bloque 5/DPO no se reabre) y actualice sus RATs.
 * Backend: reopenWizardRiskSession (wizardRiskSession.service.ts).
 */
export async function reopenWizardSession(
  companyId: string,
  sessionId: string
): Promise<APIResponse<WizardReopenSessionResponse>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}/reopen`, {
    method: "POST",
  });
}

/**
 * Item N-15 — cierra la edición (EDITING -> COMPLETED) y reconcilia los
 * Treatments contra las respuestas corregidas (crea nuevos, marca
 * PENDING_DEACTIVATION o deja constancia de conflicto en los que dejaron
 * de aplicar) — no vuelve a pedir dpoAssigned/dpoForm/acknowledge.
 */
export async function confirmReopenedWizardSession(
  companyId: string,
  sessionId: string,
  payload: {
    treatments?: WizardTreatmentPersistPayload[];
    compliancePlan?: WizardConfirmResult["compliancePlan"];
  }
): Promise<APIResponse<WizardReopenConfirmResult>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}/reopen/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Batch 10 — descarga el PDF del plan de cumplimiento. No usa customFetch
 * (no maneja bien respuestas binarias): mismo patrón raw-fetch + blob que
 * downloadTreatmentsExport en treatment.api.ts.
 */
export async function downloadWizardCompliancePdf(
  companyId: string,
  sessionId: string
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/wizard-risk/sessions/${sessionId}/compliance-pdf`,
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    if (!response.ok) {
      let body: APIResponse<void> | null = null;
      try {
        body = (await response.json()) as APIResponse<void>;
      } catch {}
      return {
        error: body?.error
          ? { ...body.error, status: response.status }
          : { code: "http/unknown-error", message: "No se pudo descargar el plan de cumplimiento.", status: response.status },
      };
    }
    const blob = await response.blob();
    const filename =
      filenameFromContentDisposition(response.headers.get("content-disposition")) ??
      "plan-cumplimiento.pdf";
    triggerBrowserDownload(blob, filename);
    return {};
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("Failed to fetch")) {
      return { error: { code: "http/network-error", message: "Error de conexión. Verifica tu red e intenta de nuevo." } };
    }
    return { error: { code: "http/unknown-error", message: "Error inesperado al descargar el plan de cumplimiento." } };
  }
}
