import { APIResponse } from "@/types/api.types";
import {
  SystemRecord,
  WizardAnswers,
  WizardConfirmResult,
  WizardSessionResponse,
} from "@/types/wizardRisk.types";
import { customFetch } from "@/utils/customFetch";

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
  payload: { dpoAssigned: string; acknowledge: boolean; compliancePlan: WizardConfirmResult["compliancePlan"] }
): Promise<APIResponse<WizardConfirmResult>> {
  return customFetch(`/companies/${companyId}/wizard-risk/sessions/${sessionId}/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
