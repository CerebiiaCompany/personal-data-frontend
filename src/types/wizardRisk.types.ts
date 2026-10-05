/**
 * Tipos del Wizard de Diagnóstico Inicial de Riesgo (5 bloques).
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
  | "ABANDONED"
  // Item N-15 — edición post-wizard (COMPLETED -> EDITING -> COMPLETED),
  // ver reopenWizardSession/confirmReopenedWizardSession. state.status del
  // contexto nunca llega a este valor (queda fijo en IN_PROGRESS, ver
  // WizardContext) — esto solo tipa el `sessionStatus` real que devuelve
  // useWizardSession/useWizardRiskStatus.
  | "EDITING";

export const WIZARD_TOTAL_BLOCKS = 5;
// Techo de slots globales: B1(5) + B2(10) + B3(22, tras sumar las 9
// preguntas de N-10: B3-P30..P33 + B3-P35..P39 a las 13 anteriores) + B4
// tabla(1) + B5 validación(1) + consentimiento biométrico C-01(1) + DPO(1) = 41.
export const WIZARD_TOTAL_QUESTIONS = 41;
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
  treatments: WizardTreatment[];
  dpoForm: WizardDpoForm | null;

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
  /** En MULTIPLE_CHOICE, elegir esta opción limpia las demás (p. ej. "No"). */
  exclusive?: boolean;
}

export interface QuestionCardProps {
  questionKey: string;
  questionText: string;
  helpText?: string;
  tooltipWhy?: string;

  type: QuestionAnswerType;
  options: QuestionOption[];
  conditionalFieldsByOption?: Record<string, WizardConditionalField>;

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

// REQ Wizard v2.2 — campo de texto/número adicional que aparece cuando se
// elige una opción concreta de una pregunta SINGLE_CHOICE (ej. la URL del
// sitio propio en B1-P3). Se guarda como el ÍNDICE 1 del mismo array
// answerValue de la pregunta dueña (índice 0 = valor de la opción elegida)
// — NUNCA como una pregunta global aparte — así no consume su propio
// número de pregunta ni requiere cambios en el contrato del backend
// (`saveWizardRiskAnswer` sigue recibiendo un solo `questionKey` + un solo
// `string[]` por click de "Siguiente"). Ver QuestionCard.tsx.
export type WizardConditionalFieldType = "text" | "url" | "number" | "list";

export interface WizardConditionalField {
  label: string;
  placeholder?: string;
  fieldType: WizardConditionalFieldType;
  required?: boolean;
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
  // REQ Wizard v2.2 — clave: value de la opción que revela el campo. Solo
  // tiene sentido en preguntas SINGLE_CHOICE (una opción seleccionada a la
  // vez); QuestionCard no lo renderiza para MULTIPLE_CHOICE.
  conditionalFieldsByOption?: Record<string, WizardConditionalField>;
}

// Batch 7 — Bloque 4 (Inventario de Sistemas): tabla editable de sistemas,
// guardada como su propio campo en la sesión (no como una respuesta de
// pregunta más) vía PATCH /wizard-risk/sessions/:id/systems.
export type SystemDeployment = "cloud" | "onprem" | "hybrid";

export interface SystemRecord {
  id: string;
  name: string;
  type: string;
  provider: string;
  storedData: string;
  serverCountry: string;
  /** Pregunta que originó la fila inferida; vacío si el usuario la agregó. */
  inferredFrom?: string;
  /** Entrada del catálogo global que originó la fila (`systems_catalog`). */
  catalogId?: string;
  /** CEREBIIA y similares: no se pueden borrar ni renombrar. */
  locked?: boolean;
  // Campos legacy que el backend aún puede persistir (PATCH /systems).
  deployment?: SystemDeployment;
  hasSensitiveData?: boolean;
  dpoProvidesServices?: boolean;
}

/** Tratamiento inferido en Bloque 5 para que el usuario acepte o corrija. */
export interface WizardTreatment {
  id: string;
  name: string;
  legalBasis: string;
  securityMeasures: string;
  retentionPeriod: string;
  accepted: boolean;
  modified: boolean;
  sourceKeys: string[];
  primaryData?: string[];
  isSensitive?: boolean;
  sensitiveLegalRef?: string;
  internationalTransfer?: boolean;
  internationalTransferReason?: string;
  legalBasisLocked?: boolean;
  legalBasisCode?: string;
  legalBasisArticle?: string;
  legalBasisRestriction?: string;
  retentionStartEvent?: string;
  retentionYears?: number | null;
  retentionDays?: number | null;
  retentionCanReduce?: boolean;
  securityMeasureItems?: Array<{
    label: string;
    removable: boolean;
    level?: "OBLIGATORIO" | "ALTO_RIESGO" | "RECOMENDADO";
  }>;
  // Item C-04/N-14 (mecanismo de "Incertidumbre") — true cuando este
  // tratamiento depende de una respuesta "No estoy seguro"/"No sé" (B2-P11,
  // B3-P26 o B2-P13, ver services/wizard-inference/engine/pendingReview.ts,
  // el motor real — no el catálogo legacy/no-usado de block5Questions.ts). El
  // tratamiento se genera igual, pero el backend lo crea en
  // PENDING_VERIFICATION en vez de CONFIRMED.
  generatesPendingReview?: boolean;
  // Pregunta concreta que disparó la incertidumbre (ej. "B2-P13") — llega al
  // backend como Treatment.wizardTreatmentKey/TreatmentPendingNote.sourceQuestionKey.
  pendingReviewQuestionKey?: string;
  // Item Especificación de Finalidad de Tratamiento (Niveles 1, 2 y 3) — SMG,
  // 02-sep-2026. purposeDetail (Nivel 3) es la única editable directamente
  // en el resumen (igual que legalBasis/securityMeasures/retentionPeriod);
  // Nivel 1/2 se muestran como contexto de solo lectura junto a ella.
  purposeNivel1Code?: string;
  purposeNivel1Label?: string;
  purposeNivel2?: string;
  purposeDetail?: string;
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

// REQ Wizard v2.2 — reemplaza el selector de categoría de B5-P46 (Batch 9):
// el DPO se captura como formulario libre y el backend crea un usuario
// real con estos datos al confirmar (ver confirmWizardRiskSession).
export interface WizardDpoForm {
  name: string;
  position: string;
  email: string;
  phone: string;
}

// Batch 9 — Bloque 5 Parte 2: selector de DPO + confirmación final.
export interface WizardConfirmPayload {
  dpoAssigned: string;
  dpoForm: WizardDpoForm;
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
  // Batch 13 — cantidad de Treatments reales (RAT) creados en DRAFT a
  // partir de las actividades de tratamiento detectadas en Bloque 3.
  treatmentsGenerated: number;
  // REQ Wizard v2.2 — credenciales del usuario DPO recién creado (se
  // muestran una sola vez en la pantalla de éxito, nunca se persisten en
  // texto plano ni se vuelven a exponer después de esta respuesta).
  dpoCreated?: {
    username: string;
    tempPassword: string;
  };
}

// Item N-15 — POST .../reopen. No trae compliancePlan ni treatments: el
// backend no toca esos datos al reabrir, solo cambia el status.
export interface WizardReopenSessionResponse {
  sessionId: string;
  status: string;
  answers: WizardAnswers;
  systems: SystemRecord[];
  dpoAssigned: string | null;
}

// Item N-15 — POST .../reopen/confirm. No trae nextSteps/dpoCreated (el
// Bloque 5/DPO no se reabre con esta edición) — en su lugar, el resultado
// de la reconciliación contra los Treatments existentes.
export interface WizardReopenConfirmResult {
  status: string;
  compliancePlan: WizardCompliancePlan;
  treatmentsCreated: number;
  treatmentsDeactivated: number;
  treatmentsConflicted: number;
}
