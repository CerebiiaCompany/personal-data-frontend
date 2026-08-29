import { CustomSelectOption } from "./forms.types";

/**
 * Contrato del módulo RAT (Registro de Actividades de Tratamiento).
 *
 * Los enums, nombres de campos y reglas de este archivo están alineados 1:1 con
 * `prisma/schema.prisma` y los controladores del backend
 * (`treatment.controller.ts`, `treatmentPurpose.controller.ts`). NO se apoya en
 * la referencia textual: cualquier cambio de contrato debe validarse contra el
 * schema real antes de tocar este archivo.
 */

// --- Enums (idénticos al schema del backend) ---

export type TreatmentStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "ARCHIVED";

// Corregido (auditoría CHK-009/016/062/063/064, 2026-08-27): las 6 bases
// reales del Art. 13 Ley 21.719 para CL. VITAL_INTEREST,
// PUBLIC_INTEREST_OR_AUTHORITY y PUBLIC_SOURCE se eliminaron (no tienen
// contraparte en el Art. 13 para organizaciones privadas); el backend ya no
// las acepta (enum LegalBasis, schema.prisma). ECONOMIC_FINANCIAL_DATA
// (Art. 13 a) y RIGHTS_DEFENSE (Art. 13 e) son nuevas. Para CL, el
// desplegable real se arma desde BD vía useJurisdictionLegalBases (ver
// TreatmentForm.tsx) — este tipo es el contrato compartido con el backend.
export type LegalBasis =
  | "CONSENT"
  | "ECONOMIC_FINANCIAL_DATA"
  | "CONTRACT_PERFORMANCE"
  | "LEGAL_OBLIGATION"
  | "LEGITIMATE_INTEREST"
  | "RIGHTS_DEFENSE";

export type DataCategory =
  | "IDENTIFICATION"
  | "CONTACT"
  | "FINANCIAL"
  | "EMPLOYMENT"
  | "ACADEMIC"
  | "LOCATION"
  | "GEOLOCATION"
  | "BEHAVIORAL_PROFILING"
  | "HEALTH"
  | "BIOMETRIC"
  | "GENETIC"
  | "SEXUAL_ORIENTATION"
  | "UNION_MEMBERSHIP"
  | "RELIGIOUS_BELIEFS"
  | "POLITICAL_OPINIONS"
  | "CRIMINAL_RECORD"
  | "ETHNIC_ORIGIN"
  | "SOCIOECONOMIC_STATUS"
  | "IDEOLOGICAL_BELIEFS"
  | "SEXUAL_LIFE"
  | "GENDER_IDENTITY";

export type DataSubjectCategory =
  | "EMPLOYEES"
  | "CANDIDATES"
  | "CUSTOMERS"
  | "SUPPLIERS"
  | "WEBSITE_USERS"
  | "COMMERCIAL_PROSPECTS"
  | "MINORS"
  | "OTHER";

export type SystemType =
  | "CRM"
  | "ERP"
  | "DATABASE"
  | "CLOUD_STORAGE"
  | "ON_PREMISE"
  | "HR_PLATFORM"
  | "MARKETING_PLATFORM"
  | "ANALYTICS_PLATFORM"
  | "OTHER";

export type RetentionUnit = "DAYS" | "MONTHS" | "YEARS";

export type RetentionStartEvent =
  | "DATA_COLLECTION"
  | "RELATIONSHIP_END"
  | "LEGAL_OBLIGATION_END"
  | "CONSENT_WITHDRAWAL";

export type SecurityMeasure =
  | "ENCRYPTION_AT_REST"
  | "ENCRYPTION_IN_TRANSIT"
  | "ACCESS_CONTROL_RBAC"
  | "MFA"
  | "AUDIT_LOGGING"
  | "ANONYMIZATION"
  | "PSEUDONYMIZATION"
  | "BACKUP_POLICY"
  | "VENDOR_DPA_SIGNED"
  | "PHYSICAL_SECURITY";

/**
 * Categorías de datos consideradas sensibles por el backend
 * (`SENSITIVE_DATA_CATEGORIES` en treatment.controller.ts). Se replica solo
 * para PREVISUALIZAR `containsSensitiveData` en el formulario: el valor real lo
 * calcula SIEMPRE el backend a partir de `dataCategories`.
 */
export const SENSITIVE_DATA_CATEGORIES: DataCategory[] = [
  "HEALTH",
  "BIOMETRIC",
  "GENETIC",
  "SEXUAL_ORIENTATION",
  "UNION_MEMBERSHIP",
  "RELIGIOUS_BELIEFS",
  "POLITICAL_OPINIONS",
  "CRIMINAL_RECORD",
  "ETHNIC_ORIGIN",
  "SOCIOECONOMIC_STATUS",
  "IDEOLOGICAL_BELIEFS",
  "SEXUAL_LIFE",
  "GENDER_IDENTITY",
];

export function isSensitiveDataCategory(category: DataCategory): boolean {
  return SENSITIVE_DATA_CATEGORIES.includes(category);
}

export function computeContainsSensitiveData(
  dataCategories: DataCategory[]
): boolean {
  return dataCategories.some(isSensitiveDataCategory);
}

// --- Registro de tratamiento (respuesta del backend) ---

export interface Treatment {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: TreatmentStatus;
  version: number;

  purposeId: string | null;
  purposeDetail: string | null;
  legalBasis: LegalBasis | null;
  legalBasisJustification: string | null;
  /** Item CON-001/B8 (Art. 12 + Art. 14) — obligatorio para activar cuando legalBasis === "CONSENT". */
  consentTemplateId: string | null;
  /** Item CHK-076 (sprint de cierre 2026-08-28) — literales e/j del Art. 14 ter, texto libre opcional. */
  dataSource: string | null;
  nonDeliveryConsequences: string | null;

  dataCategories: DataCategory[];
  containsSensitiveData: boolean;
  dataSubjectCategories: DataSubjectCategory[];

  internalOwnerId: string | null;

  /**
   * DEPRECADO — texto libre, ya no se escribe desde este formulario.
   * Se conserva solo como histórico de lectura para tratamientos creados
   * antes de estructurar la retención (ver retentionValue/retentionUnit/
   * retentionStartEvent). No mostrar como editable.
   */
  retentionPeriod: string | null;
  retentionValue: number | null;
  retentionUnit: RetentionUnit | null;
  retentionStartEvent: RetentionStartEvent | null;
  securityMeasures: SecurityMeasure[];

  internationalTransferOccurs: boolean;
  internationalTransferCountry: string | null;
  internationalTransferMechanism: string | null;

  /** RF-72 (Art. 16 sexies) — solo gatean canActivate cuando dataCategories incluye GEOLOCATION. */
  geolocationDuration: string | null;
  geolocationSharedWithThirdParties: boolean | null;
  geolocationThirdPartiesIdentity: string | null;

  activatedAt: string | null;
  archivedAt: string | null;
  archivedReason: string | null;

  /** RF-03 — workflow de aprobación DPO (DRAFT -> PENDING_APPROVAL -> ACTIVE). */
  approvalRequestedAt: string | null;
  approvedAt: string | null;
  approvedById: string | null;

  createdAt: string;
  updatedAt: string;
}

/** Item A (Inventario de Sistemas, RF-01 a RF-07) — "Paso 3.5" del formulario. */
export interface TreatmentSystem {
  id: string;
  treatmentId: string;
  name: string;
  type: SystemType;
  provider: string | null;
  isOutsideChile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentSystemInput {
  name: string;
  type: SystemType;
  provider?: string | null;
  isOutsideChile?: boolean;
}

/** Entrada del catálogo de finalidades (dropdown de purposeId). */
export interface TreatmentPurpose {
  id: string;
  code: string;
  label: string;
  /** null = entrada global compartida; "<id>" = propia de la empresa. */
  companyId: string | null;
  isActive: boolean;
}

/**
 * Payload de creación/edición. Todos los campos son opcionales salvo `name` en
 * la creación. `containsSensitiveData`, `status`, `version` y las marcas de
 * ciclo de vida NO se envían: el backend los ignora o los deriva.
 */
export interface TreatmentInput {
  name?: string;
  description?: string | null;
  purposeId?: string | null;
  purposeDetail?: string | null;
  legalBasis?: LegalBasis | null;
  legalBasisJustification?: string | null;
  consentTemplateId?: string | null;
  dataSource?: string | null;
  nonDeliveryConsequences?: string | null;
  dataCategories?: DataCategory[];
  dataSubjectCategories?: DataSubjectCategory[];
  internalOwnerId?: string | null;
  retentionValue?: number | null;
  retentionUnit?: RetentionUnit | null;
  retentionStartEvent?: RetentionStartEvent | null;
  securityMeasures?: SecurityMeasure[];
  internationalTransferOccurs?: boolean;
  internationalTransferCountry?: string | null;
  internationalTransferMechanism?: string | null;
  geolocationDuration?: string | null;
  geolocationSharedWithThirdParties?: boolean | null;
  geolocationThirdPartiesIdentity?: string | null;
}

export interface CreateTreatmentPayload extends TreatmentInput {
  name: string;
}

export interface ArchiveTreatmentPayload {
  archivedReason: string;
}

// --- Opciones con etiqueta en español para los formularios ---

export const TREATMENT_STATUS_OPTIONS: CustomSelectOption<TreatmentStatus>[] = [
  { value: "DRAFT", title: "Borrador" },
  { value: "PENDING_APPROVAL", title: "Pendiente de aprobación" },
  { value: "ACTIVE", title: "Activo" },
  { value: "ARCHIVED", title: "Archivado" },
];

export const TREATMENT_STATUS_LABELS: Record<TreatmentStatus, string> = {
  DRAFT: "Borrador",
  PENDING_APPROVAL: "Pendiente de aprobación",
  ACTIVE: "Activo",
  ARCHIVED: "Archivado",
};

export const SYSTEM_TYPE_OPTIONS: CustomSelectOption<SystemType>[] = [
  { value: "CRM", title: "CRM" },
  { value: "ERP", title: "ERP" },
  { value: "DATABASE", title: "Base de datos" },
  { value: "CLOUD_STORAGE", title: "Almacenamiento en la nube" },
  { value: "ON_PREMISE", title: "Servidor propio (on-premise)" },
  { value: "HR_PLATFORM", title: "Plataforma de RR.HH." },
  { value: "MARKETING_PLATFORM", title: "Plataforma de marketing" },
  { value: "ANALYTICS_PLATFORM", title: "Plataforma de analítica" },
  { value: "OTHER", title: "Otro" },
];

export const SYSTEM_TYPE_LABELS: Record<SystemType, string> = SYSTEM_TYPE_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt.title }),
  {} as Record<SystemType, string>
);

// Catálogo genérico (usado como fallback para países sin tabla
// jurisdiction_legal_bases poblada, ej. CO — ver useJurisdictionLegalBases).
// Para CL, TreatmentForm.tsx reemplaza estas opciones por las de BD
// (jurisdiction_legal_bases WHERE country='CL'), que incluye además
// ECONOMIC_FINANCIAL_DATA y RIGHTS_DEFENSE.
export const LEGAL_BASIS_OPTIONS: CustomSelectOption<LegalBasis>[] = [
  { value: "CONSENT", title: "Consentimiento del titular" },
  { value: "CONTRACT_PERFORMANCE", title: "Ejecución de un contrato" },
  { value: "LEGAL_OBLIGATION", title: "Obligación legal" },
  { value: "LEGITIMATE_INTEREST", title: "Interés legítimo" },
];

// Completo para las 6 bases (no solo las de LEGAL_BASIS_OPTIONS, que es un
// subconjunto usado como fallback de país) — usado para mostrar el label de
// CUALQUIER tratamiento ya guardado (tabla, historial, detalle),
// independiente de con qué catálogo se creó.
export const LEGAL_BASIS_LABELS: Record<LegalBasis, string> = {
  CONSENT: "Consentimiento del titular",
  ECONOMIC_FINANCIAL_DATA: "Datos económicos, financieros, bancarios o comerciales",
  CONTRACT_PERFORMANCE: "Ejecución de un contrato",
  LEGAL_OBLIGATION: "Obligación legal",
  LEGITIMATE_INTEREST: "Interés legítimo",
  RIGHTS_DEFENSE: "Formulación, ejercicio o defensa de un derecho",
};

export const DATA_CATEGORY_OPTIONS: CustomSelectOption<DataCategory>[] = [
  { value: "IDENTIFICATION", title: "Identificación" },
  { value: "CONTACT", title: "Contacto" },
  { value: "FINANCIAL", title: "Financieros" },
  { value: "EMPLOYMENT", title: "Laborales" },
  { value: "ACADEMIC", title: "Académicos" },
  { value: "LOCATION", title: "Ubicación" },
  { value: "GEOLOCATION", title: "Geolocalización" },
  { value: "BEHAVIORAL_PROFILING", title: "Perfilamiento / comportamiento" },
  { value: "HEALTH", title: "Salud (sensible)" },
  { value: "BIOMETRIC", title: "Biométricos (sensible)" },
  { value: "GENETIC", title: "Genéticos (sensible)" },
  { value: "SEXUAL_ORIENTATION", title: "Orientación sexual (sensible)" },
  { value: "UNION_MEMBERSHIP", title: "Afiliación sindical (sensible)" },
  { value: "RELIGIOUS_BELIEFS", title: "Creencias religiosas (sensible)" },
  { value: "POLITICAL_OPINIONS", title: "Opiniones políticas (sensible)" },
  { value: "CRIMINAL_RECORD", title: "Antecedentes penales (sensible)" },
  { value: "ETHNIC_ORIGIN", title: "Origen étnico (sensible)" },
  { value: "SOCIOECONOMIC_STATUS", title: "Situación socioeconómica (sensible)" },
  { value: "IDEOLOGICAL_BELIEFS", title: "Convicciones ideológicas (sensible)" },
  { value: "SEXUAL_LIFE", title: "Vida sexual (sensible)" },
  { value: "GENDER_IDENTITY", title: "Identidad de género (sensible)" },
];

export const DATA_CATEGORY_LABELS: Record<DataCategory, string> =
  DATA_CATEGORY_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.title }),
    {} as Record<DataCategory, string>
  );

export const DATA_SUBJECT_CATEGORY_OPTIONS: CustomSelectOption<DataSubjectCategory>[] =
  [
    { value: "EMPLOYEES", title: "Empleados" },
    { value: "CANDIDATES", title: "Candidatos" },
    { value: "CUSTOMERS", title: "Clientes" },
    { value: "SUPPLIERS", title: "Proveedores" },
    { value: "WEBSITE_USERS", title: "Usuarios del sitio web" },
    { value: "COMMERCIAL_PROSPECTS", title: "Prospectos comerciales" },
    { value: "MINORS", title: "Menores de edad" },
    { value: "OTHER", title: "Otros" },
  ];

export const DATA_SUBJECT_CATEGORY_LABELS: Record<DataSubjectCategory, string> =
  DATA_SUBJECT_CATEGORY_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.title }),
    {} as Record<DataSubjectCategory, string>
  );

export const SECURITY_MEASURE_OPTIONS: CustomSelectOption<SecurityMeasure>[] = [
  { value: "ENCRYPTION_AT_REST", title: "Cifrado en reposo" },
  { value: "ENCRYPTION_IN_TRANSIT", title: "Cifrado en tránsito" },
  { value: "ACCESS_CONTROL_RBAC", title: "Control de acceso (RBAC)" },
  { value: "MFA", title: "Autenticación multifactor (MFA)" },
  { value: "AUDIT_LOGGING", title: "Registro de auditoría" },
  { value: "ANONYMIZATION", title: "Anonimización" },
  { value: "PSEUDONYMIZATION", title: "Seudonimización" },
  { value: "BACKUP_POLICY", title: "Política de respaldos" },
  { value: "VENDOR_DPA_SIGNED", title: "Acuerdo de tratamiento (DPA) firmado" },
  { value: "PHYSICAL_SECURITY", title: "Seguridad física" },
];

export const SECURITY_MEASURE_LABELS: Record<SecurityMeasure, string> =
  SECURITY_MEASURE_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.title }),
    {} as Record<SecurityMeasure, string>
  );

export const RETENTION_UNIT_OPTIONS: CustomSelectOption<RetentionUnit>[] = [
  { value: "DAYS", title: "Días" },
  { value: "MONTHS", title: "Meses" },
  { value: "YEARS", title: "Años" },
];

export const RETENTION_UNIT_LABELS: Record<RetentionUnit, string> =
  RETENTION_UNIT_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.title }),
    {} as Record<RetentionUnit, string>
  );

export const RETENTION_START_EVENT_OPTIONS: CustomSelectOption<RetentionStartEvent>[] = [
  { value: "DATA_COLLECTION", title: "Desde la recolección del dato" },
  { value: "RELATIONSHIP_END", title: "Desde el fin de la relación con el titular" },
  { value: "LEGAL_OBLIGATION_END", title: "Desde el fin de la obligación legal aplicable" },
  { value: "CONSENT_WITHDRAWAL", title: "Desde el retiro del consentimiento" },
];

export const RETENTION_START_EVENT_LABELS: Record<RetentionStartEvent, string> =
  RETENTION_START_EVENT_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.title }),
    {} as Record<RetentionStartEvent, string>
  );

/** Campos requeridos por el backend para activar un tratamiento (DRAFT → ACTIVE). */
export const TREATMENT_ACTIVATION_FIELD_LABELS: Record<string, string> = {
  purposeId: "Finalidad",
  legalBasis: "Base legal",
  dataSubjectCategories: "Categorías de titulares",
  dataCategories: "Categorías de datos",
  internalOwnerId: "Responsable interno",
  // "retention" es una entrada agrupada del backend (retentionValue +
  // retentionUnit + retentionStartEvent) — ver treatment.controller.ts.
  retention: "Período de conservación (duración, unidad y evento que lo inicia)",
  securityMeasures: "Medidas de seguridad",
  // Item D (RF-72, Art. 16 sexies) — entrada agrupada del backend cuando
  // dataCategories incluye GEOLOCATION.
  geolocation: "Datos de geolocalización (duración y comunicación a terceros)",
  // Item CON-001/B8 (Art. 12 + Art. 14) — solo aplica cuando legalBasis === "CONSENT".
  consentTemplateId: "Política de tratamiento vinculada",
};

// --- Historial de versiones (trazabilidad legal) ---

/**
 * Cambio individual dentro de una versión. `field` es uno de los campos que
 * disparan versión en el backend (purposeId, purposeDetail, legalBasis,
 * legalBasisJustification, retentionValue, retentionUnit,
 * retentionStartEvent). `before`/`after` vienen calculados por el backend.
 */
export interface TreatmentVersionChange {
  field: string;
  before: string | null;
  after: string | null;
}

export interface TreatmentVersionEntry {
  id: string;
  /** Número de versión resultante de este cambio. */
  version: number;
  changeReason: string | null;
  changedBy: { id: string; name: string; lastName: string } | null;
  createdAt: string;
  changes: TreatmentVersionChange[];
}

/** Etiquetas en español de los campos versionables (para el diff). */
export const TREATMENT_VERSION_FIELD_LABELS: Record<string, string> = {
  purposeId: "Finalidad",
  purposeDetail: "Detalle de la finalidad",
  legalBasis: "Base legal",
  legalBasisJustification: "Justificación de la base legal",
  consentTemplateId: "Política de tratamiento vinculada",
  retentionValue: "Duración de la retención",
  retentionUnit: "Unidad de la retención",
  retentionStartEvent: "Evento que inicia el conteo de la retención",
};
