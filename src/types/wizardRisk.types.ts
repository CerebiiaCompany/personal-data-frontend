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

// Contrato del backend (personal-data-backend, wizardRiskSession.controller.ts) —
// camelCase, consistente con el resto del API (ver APIResponse<T>).
export interface WizardSessionResponse {
  sessionId: string;
  status: string;
  currentBlock: number;
  currentQuestion: number;
  resume: boolean;
  answersSoFar?: WizardAnswers;
}

// Batch 3 — componente pregunta reutilizable (QuestionCard).
export type QuestionAnswerType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

export interface QuestionOption {
  value: string;
  label: string;
  helpText?: string;
}

export interface QuestionCardProps {
  questionKey: string;
  questionText: string;
  helpText?: string;
  tooltipWhy?: string;

  type: QuestionAnswerType;
  options: QuestionOption[];

  currentAnswer?: string[];
  isLoading?: boolean;

  /** Se llama con la selección actual cada vez que cambia (antes de enviar). */
  onAnswer: (answerValue: string[]) => void;
  onPrevious?: () => void;
  /** Se llama al hacer clic en "Siguiente" una vez pasada la validación local. */
  onNext: () => void;

  showPreviousButton?: boolean;
  /** Override externo del gating de "Siguiente"; por defecto se deriva de la selección. */
  canGoNext?: boolean;
}
