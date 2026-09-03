/**
 * Tipos del Wizard de Diagnóstico Inicial de Riesgo (5 bloques / 30 preguntas).
 *
 * Este es un flujo nuevo e independiente del wizard de configuración inicial
 * (`SetupWizard*`, ver src/components/wizard). No comparte estado ni API con
 * ese flujo; convive con él hasta que este lo reemplace por completo.
 */

export type WizardStatusValue =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "VALIDATING"
  | "COMPLETED"
  | "ABANDONED";

export const WIZARD_TOTAL_BLOCKS = 5;
export const WIZARD_TOTAL_QUESTIONS = 30;
export const WIZARD_ABANDON_AFTER_DAYS = 30;

export interface WizardRiskError {
  code: string;
  message: string;
}

export type WizardAnswers = Record<string, string[]>;

export interface WizardSessionState {
  sessionId: string | null;
  organizationId: string;
  userId: string;

  status: WizardStatusValue;
  currentBlock: number;
  currentQuestion: number;
  progressPercent: number;

  answers: WizardAnswers;

  isLoading: boolean;
  error: WizardRiskError | null;

  createdAt: string | null;
  lastActivityAt: string | null;
}

export interface WizardSessionResponse {
  session_id: string;
  status: string;
  current_block: number;
  current_question: number;
  resume: boolean;
  answers_so_far?: WizardAnswers;
}
