import { LegalBasis, RetentionStartEvent, RetentionUnit, SecurityMeasure } from "@/types/treatment.types";
import { WizardTreatment } from "@/types/wizardRisk.types";
import { isBiometricConsentWizardTreatment } from "@/utils/wizardBiometricConsent";

/**
 * Contrato que el backend acepta en POST .../confirm para materializar RATs.
 * Alineado con generateTreatmentsFromWizardAnswers (personal-data-backend).
 */
export interface WizardTreatmentPersistPayload {
  id: string;
  name: string;
  // Item Especificación de Finalidad (SMG, 02-sep-2026) — antes un mapa
  // PURPOSE_BY_TREATMENT_ID hardcodeado acá mismo, contra un catálogo plano
  // de 10 códigos (eliminado, ver git history). Ahora Nivel 1/2/3 completo,
  // ya resuelto por el motor (WizardInferenceService.assignFinalidad) contra
  // wizard_finalidad_templates — "reglas como datos", no un mapa en este
  // archivo.
  purposeNivel1Code?: string;
  purposeNivel2?: string;
  purposeDetail?: string;
  description: string;
  legalBasis: LegalBasis;
  legalBasisJustification: string;
  containsSensitiveData: boolean;
  internationalTransferOccurs: boolean;
  securityMeasures: SecurityMeasure[];
  retentionPeriod: string;
  retentionValue: number | null;
  retentionUnit: RetentionUnit | null;
  retentionStartEvent: RetentionStartEvent | null;
  // Item C-04/N-15 — llega tal cual a Treatment.wizardTreatmentKey (backend,
  // wizardTreatmentGeneration.ts). Primera sourceKey del tratamiento: la
  // pregunta principal que lo originó.
  wizardTreatmentKey: string | null;
  // Item C-04/N-14 (mecanismo de "Incertidumbre") — ver
  // WizardTreatment.generatesPendingReview/pendingReviewQuestionKey.
  generatesPendingReview: boolean;
  pendingReviewQuestionKey: string | null;
  dataCategories: string[];
}

const LEGAL_BASIS_BY_CODE: Record<string, LegalBasis> = {
  OBLIGACION_LEGAL: "LEGAL_OBLIGATION",
  EJECUCION_CONTRATO: "CONTRACT_PERFORMANCE",
  CONSENTIMIENTO: "CONSENT",
  CONSENTIMIENTO_EXPRESO: "CONSENT",
  CONSENTIMIENTO_REPRESENTANTE: "CONSENT",
  CONSENTIMIENTO_O_INTERES: "CONSENT",
  INTERES_LEGITIMO: "LEGITIMATE_INTEREST",
  DATOS_ECONOMICOS: "ECONOMIC_FINANCIAL_DATA",
};

function mapLegalBasis(treatment: WizardTreatment): LegalBasis {
  if (treatment.legalBasisCode && LEGAL_BASIS_BY_CODE[treatment.legalBasisCode]) {
    return LEGAL_BASIS_BY_CODE[treatment.legalBasisCode];
  }
  const text = treatment.legalBasis.toLowerCase();
  if (text.includes("económic") || text.includes("13 a")) return "ECONOMIC_FINANCIAL_DATA";
  if (text.includes("obligación") || text.includes("13 b")) return "LEGAL_OBLIGATION";
  if (text.includes("contrato") || text.includes("13 c")) return "CONTRACT_PERFORMANCE";
  if (text.includes("interés") || text.includes("13 d")) return "LEGITIMATE_INTEREST";
  if (text.includes("consent")) return "CONSENT";
  return "LEGITIMATE_INTEREST";
}

function mapSecurityMeasures(treatment: WizardTreatment): SecurityMeasure[] {
  const labels = [
    ...(treatment.securityMeasureItems ?? []).map((item) => item.label),
    ...treatment.securityMeasures.split(/\n|;/).map((item) => item.trim()),
  ].filter(Boolean);

  const measures = new Set<SecurityMeasure>();
  for (const label of labels) {
    const text = label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (text.includes("transito") || text.includes("https") || text.includes("tls")) measures.add("ENCRYPTION_IN_TRANSIT");
    if (text.includes("reposo") || text.includes("aes")) measures.add("ENCRYPTION_AT_REST");
    if (text.includes("rbac") || text.includes("roles") || text.includes("privilegio")) measures.add("ACCESS_CONTROL_RBAC");
    if (text.includes("mfa") || text.includes("doble factor")) measures.add("MFA");
    if (text.includes("auditor") || text.includes("log") || text.includes("registro de")) measures.add("AUDIT_LOGGING");
    if (text.includes("anonimiz")) measures.add("ANONYMIZATION");
    if (text.includes("seudonim") || text.includes("pseudonim")) measures.add("PSEUDONYMIZATION");
    if (text.includes("respald") || text.includes("backup")) measures.add("BACKUP_POLICY");
    if (text.includes("dpa") || text.includes("encargo")) measures.add("VENDOR_DPA_SIGNED");
    if (text.includes("fisic") || text.includes("escritorio limpio")) measures.add("PHYSICAL_SECURITY");
  }
  return [...measures];
}

function mapRetention(treatment: WizardTreatment): Pick<
  WizardTreatmentPersistPayload,
  "retentionValue" | "retentionUnit" | "retentionStartEvent"
> {
  if (treatment.retentionYears && treatment.retentionYears > 0) {
    return {
      retentionValue: treatment.retentionYears,
      retentionUnit: "YEARS",
      retentionStartEvent: mapRetentionEvent(treatment.retentionStartEvent, treatment.retentionPeriod),
    };
  }
  if (treatment.retentionDays && treatment.retentionDays > 0) {
    return {
      retentionValue: treatment.retentionDays,
      retentionUnit: "DAYS",
      retentionStartEvent: mapRetentionEvent(treatment.retentionStartEvent, treatment.retentionPeriod),
    };
  }
  return {
    retentionValue: null,
    retentionUnit: null,
    retentionStartEvent: mapRetentionEvent(treatment.retentionStartEvent, treatment.retentionPeriod),
  };
}

function mapRetentionEvent(event?: string, period?: string): RetentionStartEvent | null {
  const text = `${event ?? ""} ${period ?? ""}`.toLowerCase();
  if (!text.trim()) return null;
  if (text.includes("revoc") || text.includes("consentimiento")) return "CONSENT_WITHDRAWAL";
  if (text.includes("término") || text.includes("termino") || text.includes("egreso") || text.includes("relación") || text.includes("relacion")) {
    return "RELATIONSHIP_END";
  }
  if (text.includes("obligación") || text.includes("obligacion") || text.includes("legal") || text.includes("prescrip")) {
    return "LEGAL_OBLIGATION_END";
  }
  return "DATA_COLLECTION";
}

export function toPersistableTreatments(treatments: WizardTreatment[]): WizardTreatmentPersistPayload[] {
  return treatments
    .filter((row) => row.accepted && row.name.trim())
    .map((row) => {
      const retention = mapRetention(row);
      return {
        id: row.id,
        name: row.name.trim(),
        purposeNivel1Code: row.purposeNivel1Code,
        purposeNivel2: row.purposeNivel2,
        purposeDetail: row.purposeDetail,
        description: `Generado por el Wizard de Configuración Inicial (${row.sourceKeys.join(", ") || "manual"}).`,
        legalBasis: mapLegalBasis(row),
        legalBasisJustification: row.legalBasisRestriction || row.legalBasis,
        containsSensitiveData: Boolean(row.isSensitive),
        internationalTransferOccurs: Boolean(row.internationalTransfer),
        securityMeasures: mapSecurityMeasures(row),
        retentionPeriod: row.retentionPeriod,
        ...retention,
        wizardTreatmentKey: row.sourceKeys[0] ?? null,
        generatesPendingReview: Boolean(row.generatesPendingReview),
        pendingReviewQuestionKey: row.pendingReviewQuestionKey ?? null,
        dataCategories: isBiometricConsentWizardTreatment(row) ? ["BIOMETRIC"] : [],
      };
    });
}
