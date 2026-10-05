/**
 * Contratos del Motor de Inferencia (REQ Wizard v2.2, secciones 4-7).
 * Módulo agnóstico de framework: el mismo código corre en cliente o en
 * personal-data-backend.
 */

export type WizardAnswerMap = Record<string, string[]>;

export interface WizardInferenceSystemInput {
  id: string;
  name: string;
  type?: string;
  provider?: string;
  storedData?: string;
  serverCountry?: string;
  dpoProvidesServices?: boolean;
}

export interface WizardInferenceInput {
  answers: WizardAnswerMap;
  systems?: WizardInferenceSystemInput[];
}

export type TriggerExpr =
  | { kind: "always" }
  | { kind: "yes"; key: string; anyOf?: string[] }
  | { kind: "industry"; in: string[] }
  | { kind: "employeesGt"; n: number }
  | { kind: "all"; of: TriggerExpr[] }
  | { kind: "any"; of: TriggerExpr[] }
  // Item N-01 — negación, para condiciones compuestas tipo "X pero no Y"
  // (ej. control_biometrico: huella_empleados SOLO si B3-P18 no es "sí",
  // porque si lo es ya lo cubre asistencia_biometrica).
  | { kind: "not"; of: TriggerExpr };

export type InternationalTransferRule =
  | { mode: "never" }
  | { mode: "always" }
  // `reason` (antes FLAG_REASONS en internationalTransfer.ts) ahora viaja
  // en la propia regla — ver wizard_treatment_rules en el schema del backend.
  | { mode: "if"; flag: keyof WizardInferenceFlags; reason?: string };

export interface TreatmentMappingRule {
  id: string;
  name: string;
  sourceKeys: string[];
  trigger: TriggerExpr;
  /** Si este tratamiento se genera, no emitir estos ids. */
  suppresses?: string[];
  tags: string[];
  primaryData: string[];
  isSensitive: boolean;
  sensitiveLegalRef?: string;
  internationalTransfer: InternationalTransferRule;
  /**
   * Item wizard_treatment_rules (auditoría externa, 2026-09-08) — antes
   * FORCE_INCLUDE_ON_UNCERTAINTY[id] en pendingReview.ts. Si esta pregunta
   * se respondió "no estoy seguro", el tratamiento se genera igual (marcado
   * con incertidumbre pendiente) aunque su trigger normal no dispare.
   */
  forceIncludeOnUncertaintyKey?: string | null;
}

export type LegalBasisCode =
  | "OBLIGACION_LEGAL"
  | "EJECUCION_CONTRATO"
  | "CONSENTIMIENTO"
  | "CONSENTIMIENTO_EXPRESO"
  | "CONSENTIMIENTO_REPRESENTANTE"
  | "INTERES_LEGITIMO"
  | "DATOS_ECONOMICOS"
  | "CONSENTIMIENTO_O_INTERES";

export interface LegalBasisAssignment {
  code: LegalBasisCode;
  label: string;
  article: string;
  alternative?: string;
  restriction: string;
  /** Las obligaciones legales no se pueden cambiar en Bloque 5. */
  locked: boolean;
}

export type SecurityLevel = "OBLIGATORIO" | "ALTO_RIESGO" | "RECOMENDADO";

export type SecurityApplyTo =
  | { target: "all" }
  | { target: "sensitive" }
  | { target: "international" }
  | { target: "tags"; tags: string[] }
  | { target: "ids"; ids: string[] };

export type SecurityWhen =
  | { kind: "always" }
  | { kind: "flag"; flag: keyof WizardInferenceFlags }
  | { kind: "yes"; key: string };

export interface SecurityRule {
  id: string;
  when: SecurityWhen;
  applyTo: SecurityApplyTo;
  measures: string[];
  foundation: string;
  level: SecurityLevel;
}

export interface SecurityMeasureItem {
  code: string;
  label: string;
  foundation: string;
  level: SecurityLevel;
  removable: boolean;
}

export interface RetentionAssignment {
  durationLabel: string;
  durationYears: number | null;
  durationDays: number | null;
  startEvent: string;
  legalFoundation: string;
  canReduce: boolean;
}

export interface WizardInferenceFlags {
  industry: string | null;
  employeeBand: string | null;
  employeeCountMin: number;
  employeesGt5: boolean;
  employeesGt50: boolean;
  hasWebsite: boolean;
  hasMobileApp: boolean;
  hasHealthClientData: boolean;
  hasHealthEmployeeData: boolean;
  hasCameras: boolean;
  hasBiometrics: boolean;
  hasEmployeeBiometrics: boolean;
  hasMarketing: boolean;
  hasMinors: boolean;
  hasForeignCloud: boolean;
  hasForeignCrm: boolean;
  hasForeignMarketingSaas: boolean;
  hasForeignPayment: boolean;
  hasExternalProcessor: boolean;
  hasProfiling: boolean;
  hasAutomatedDecisions: boolean;
  hasSurveys: boolean;
  hasPhysicalPremises: boolean;
  // Item C-02 — reemplaza al tratamiento standalone "Transferencias a
  // Servicios Extranjeros" (eliminado del catálogo): el hecho de que la
  // empresa transfiera datos al extranjero pasa a ser un atributo que
  // cualquier otro tratamiento puede consultar (ver InternationalTransferRule
  // "if"), en vez de un tratamiento en sí mismo. Es el OR de las 3 señales de
  // B2-P11 más B2-P12 (destinatario en el extranjero) — esa última no tenía
  // ningún otro flag que la capturara.
  hasIntlTransfer: boolean;
}

export interface InferredTreatment {
  id: string;
  name: string;
  sourceKeys: string[];
  tags: string[];
  primaryData: string[];
  isSensitive: boolean;
  sensitiveLegalRef?: string;
  internationalTransfer: boolean;
  internationalTransferReason?: string;
  legalBasis: LegalBasisAssignment;
  securityMeasures: SecurityMeasureItem[];
  retention: RetentionAssignment;
  // Item C-04/N-14 (mecanismo de "Incertidumbre") — ver engine/pendingReview.ts.
  generatesPendingReview: boolean;
  pendingReviewQuestionKey?: string;
  // Item Especificación de Finalidad (SMG, 02-sep-2026) — ver
  // engine/finalidadResolver.ts. purposeNivel1Label se resuelve aparte (no
  // viene en wizard_finalidad_templates, sale del catálogo de finalidades ya
  // existente — ver fetchTreatmentPurposes). Ausentes cuando el tratamiento
  // no tiene fila en wizard_finalidad_templates (ver comentario del seed:
  // hoy "decisiones_automatizadas" y "menores").
  purposeNivel1Code?: string;
  purposeNivel1Label?: string;
  purposeNivel2?: string;
  /** Nivel 3 ya renderizado: {datos}/[cliente] reemplazados por los reales. */
  purposeDetail?: string;
}

export interface WizardInferenceResult {
  flags: WizardInferenceFlags;
  treatments: InferredTreatment[];
}

// ---------------------------------------------------------------------------
// Item wizard_treatment_rules / wizard_legal_basis_rules / ... (auditoría
// externa, 2026-09-08) — antes de esta migración estos catálogos vivían
// hardcodeados en ./catalogs/*.ts (borrados). Ahora se obtienen en vivo de
// GET /companies/:id/wizard-risk/rules (ver wizardRules.api.ts) y se pasan
// explícitos a cada función del motor — el algoritmo de evaluación no
// cambió, solo de dónde vienen los datos que evalúa.
// ---------------------------------------------------------------------------

export interface LegalBasisRefinementRule {
  treatmentId: string;
  anyOfFlags: (keyof WizardInferenceFlags)[];
  trueFallbackKey: "sensitive" | "marketing" | "contract" | "legitimate";
  trueRestrictionMode: "preserve" | "override";
  trueRestrictionOverride?: string | null;
  falseFallbackKey?: "sensitive" | "marketing" | "contract" | "legitimate" | null;
  falseRestrictionMode?: "preserve" | "override" | null;
  falseRestrictionOverride?: string | null;
}

/** Fila cruda de wizard_legal_basis_rules — treatmentId XOR fallbackKey. */
export interface LegalBasisRuleRow extends LegalBasisAssignment {
  treatmentId?: string | null;
  fallbackKey?: "sensitive" | "marketing" | "contract" | "legitimate" | null;
}

/** Fila cruda de wizard_retention_rules — treatmentId XOR isDefault. */
export interface RetentionRuleRow extends RetentionAssignment {
  treatmentId?: string | null;
  isDefault?: boolean;
}

/**
 * Item Especificación de Finalidad de Tratamiento (Niveles 1, 2 y 3) — SMG,
 * 02-sep-2026. nivel1Code referencia TreatmentPurposeCatalog (20 categorías,
 * ver FINALIDAD_NIVEL1_CATEGORIES en config/db.ts del backend). nivel2Texto
 * es texto libre (no FK) — ver comentario en Treatment.purposeNivel2 del
 * schema. nivel3Variantes: mapa clave->texto opcional para tratamientos
 * cuyo detalle cambia según la respuesta (hoy solo "asistencia", con claves
 * propias que no corresponden a un valor de respuesta real — ver
 * wizardInferenceRules.seed.ts).
 */
export interface FinalidadTemplateRow {
  treatmentId: string;
  nivel1Code: string;
  nivel2Texto: string;
  nivel3Template: string;
  nivel3Variantes?: Record<string, string> | null;
}

/** Payload completo de GET /companies/:id/wizard-risk/rules. */
export interface WizardInferenceRulesResponse {
  treatmentRules: TreatmentMappingRule[];
  legalBasisRules: LegalBasisRuleRow[];
  legalBasisRefinements: LegalBasisRefinementRule[];
  securityRules: SecurityRule[];
  retentionRules: RetentionRuleRow[];
  finalidadTemplates: FinalidadTemplateRow[];
}

/** Estructura ya indexada (Maps) que consume el motor — ver buildRuleSet en WizardInferenceService.ts. */
export interface WizardInferenceRuleSet {
  treatmentRules: TreatmentMappingRule[];
  legalBasisByTreatment: Map<string, LegalBasisAssignment>;
  legalBasisFallback: Record<"sensitive" | "marketing" | "contract" | "legitimate", LegalBasisAssignment>;
  legalBasisRefinements: Map<string, LegalBasisRefinementRule>;
  securityRules: SecurityRule[];
  retentionByTreatment: Map<string, RetentionAssignment>;
  defaultRetention: RetentionAssignment;
  finalidadByTreatment: Map<string, FinalidadTemplateRow>;
}
