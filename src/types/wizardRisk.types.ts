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

// Batch 4 — definición estática de una pregunta (sin estado/callbacks),
// usada por los catálogos por bloque (constants/wizard-blocks/blockNQuestions.ts)
// para alimentar <QuestionCard>.
export interface WizardQuestionDefinition {
  questionKey: string;
  questionText: string;
  helpText?: string;
  tooltipWhy?: string;
  type: QuestionAnswerType;
  options: QuestionOption[];
  // Batch 5 — metadata semántica para lógica de bloques futuros (Bloque 4-5).
  // Puramente informativa por ahora: no se envía al backend ni se consume
  // todavía en ningún lado (ver constants/wizard-blocks/block2Questions.ts).
  mark?: string;
  // Batch 6 — condicionales de visibilidad (gestionadas 100% en cliente, ver
  // hooks/useWizardBlockQuestions.ts). A lo sumo una de las dos por pregunta;
  // si ninguna está definida, la pregunta siempre es visible.
  showIf?: (answers: WizardAnswers) => boolean;
  hideIf?: (answers: WizardAnswers) => boolean;
}
