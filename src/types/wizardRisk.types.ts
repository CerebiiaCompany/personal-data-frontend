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
// Batch 7-9 — el total real resultó ser 47, no 30: Bloque 4 agrega 5
// preguntas (P31-P35) + 1 paso de tabla de sistemas (no es una pregunta de
// QuestionCard, pero consume un slot de `currentQuestion` igual que las
// demás al guardarse — ver WizardBlock4.tsx), y Bloque 5 agrega hasta 10
// tarjetas de tratamiento (P36-P45, condicionales) + el selector de DPO
// (P46). La pantalla de confirmación (antes "P47" en el prompt) no
// consume un número de pregunta — es el destino real de /wizard/finalizacion,
// alcanzado después de P46, igual que cualquier otro "fin de bloque".
export const WIZARD_TOTAL_QUESTIONS = 47;
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
  systems: SystemRecord[];

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
  systemsSoFar?: SystemRecord[];
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

// Batch 7 — Bloque 4 (Inventario de Sistemas): tabla editable de sistemas,
// guardada como su propio campo en la sesión (no como una respuesta de
// pregunta más) vía PATCH /wizard-risk/sessions/:id/systems.
export type SystemDeployment = "cloud" | "onprem" | "hybrid";

export interface SystemRecord {
  id: string;
  name: string;
  provider: string;
  deployment: SystemDeployment;
  hasSensitiveData: boolean;
  /** El proveedor actúa como encargado de tratamiento (firma DPA). */
  dpoProvidesServices: boolean;
}

// Batch 8 — Bloque 5 Parte 1: tarjetas de tratamiento (variante visual de
// QuestionCard). El nivel de riesgo es puramente informativo para el
// usuario; no afecta el cálculo de cumplimiento (ver Batch 9).
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TreatmentCardDefinition {
  questionKey: string;
  title: string;
  description?: string;
  riskLevel: RiskLevel;
  recommendedTreatments: string[];
  questionText: string;
  options: QuestionOption[];
  showIf?: (answers: WizardAnswers) => boolean;
  hideIf?: (answers: WizardAnswers) => boolean;
}

// Batch 9 — Bloque 5 Parte 2: selector de DPO + confirmación final.
export interface WizardConfirmPayload {
  dpoAssigned: string;
  acknowledge: boolean;
}

export interface WizardCompliancePlan {
  score: number; // 0-100
  riskCounts: Record<RiskLevel, number>;
  recommendedTreatments: string[];
}

export interface WizardConfirmResult {
  status: string;
  compliancePlan: WizardCompliancePlan;
  nextSteps: string[];
}
