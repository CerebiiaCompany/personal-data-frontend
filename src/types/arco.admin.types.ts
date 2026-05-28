import {
  ArcoDocType,
  ArcoRectificationField,
  ArcoRequestStatus,
  ArcoRequestType,
} from "@/types/arco.types";

export interface ArcoSummary {
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  overdue: number;
}

export interface ArcoRegulationSnapshot {
  countryCode?: string;
  dayType?: string;
  dueDays?: number;
  legalReference?: string;
}

export interface ArcoAdminRequestListItem {
  _id: string;
  docType: ArcoDocType;
  docNumber: string;
  requestType: ArcoRequestType;
  status: ArcoRequestStatus;
  description: string;
  dueDate: string;
  notifiedAt?: string;
  createdAt: string;
}

export interface ArcoRequestResponse {
  message: string;
  respondedAt?: string;
  respondedBy?: string;
  respondedByName?: string;
  attachmentUrls?: string[];
}

export interface ArcoAuditEvent {
  type: string;
  at: string;
  actor: {
    userId?: string;
    name: string;
    role?: string;
  };
  meta?: Record<string, unknown>;
}

export interface ArcoPersonData {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: string | undefined;
}

export interface ArcoAdminRequestDetail extends ArcoAdminRequestListItem {
  companyId: string;
  rectificationFields?: ArcoRectificationField[];
  oppositionReason?: string;
  regulationSnapshot?: ArcoRegulationSnapshot;
  resolvedAt?: string;
  response?: ArcoRequestResponse;
  audit?: ArcoAuditEvent[];
  personData?: ArcoPersonData;
  consentStatus?: string;
  updatedAt?: string;
  accessReport?: ArcoAccessReportFull;
}

export interface ArcoOfficerUser {
  userId: string;
  name: string;
  lastName?: string;
  username?: string;
  position?: string;
  email?: string;
  phone?: string;
}

export interface ArcoOfficersResult {
  officers: ArcoOfficerUser[];
  phoneLine?: string;
}

export interface ArcoUpdateOfficersPayload {
  userIds: string[];
  phoneLine?: string;
}

export interface ArcoUpdateStatusPayload {
  status: Extract<ArcoRequestStatus, "IN_PROGRESS" | "REJECTED">;
}

export interface ArcoRespondPayload {
  finalStatus: Extract<ArcoRequestStatus, "RESOLVED" | "REJECTED">;
  message: string;
  attachmentUrls?: string[];
  accessReportData?: ArcoAccessReportOfficerData;
}

export interface ArcoAccessReportPersonalData {
  docType: ArcoDocType;
  docNumber: string;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export type ArcoConsentStatusCode =
  | "ACTIVE"
  | "REVOKED"
  | "PENDING"
  | (string & {});

export interface ArcoAccessConsentInfo {
  /** Para lógica UI (badge, colores). null = registro antiguo sin subdocumento de consentimiento */
  statusCode?: ArcoConsentStatusCode | null;
  /** Texto listo para mostrar al usuario */
  statusLabel: string;
  /** @deprecated Usar statusCode + statusLabel */
  status?: string;
  acceptedAt?: string;
  collectionPoint?: string;
  policyName?: string;
  policyVersionLabel?: string;
  policyFileUrl?: string;
}

export interface ArcoAccessProcessingPurpose {
  dataType: string;
  purpose: string;
}

export interface ArcoAccessInternationalTransfers {
  occurs: boolean;
  details?: string;
}

export interface ArcoAccessReportAutoPopulated {
  countryCode: string;
  personalData: ArcoAccessReportPersonalData;
  /** Texto legible del origen (auto o mensaje de no registrado) */
  dataOrigin?: string;
  /** Código en sistema; null = el oficial debe completar el origen manualmente */
  dataOriginRaw?: string | null;
  consentInfo?: ArcoAccessConsentInfo;
  processingPurposes?: ArcoAccessProcessingPurpose[];
  internationalTransfers?: ArcoAccessInternationalTransfers;
}

export type ArcoMissingOverrideField =
  | "dataOriginOverride"
  | "consentStatusOverride"
  | "processingPurposesOverride";

export interface ArcoMissingDataOverride {
  field: ArcoMissingOverrideField;
  description: string;
}

export interface ArcoOfficerFieldsConfig {
  required: string[];
  requiredForChile?: string[];
  missingDataOverrides?: ArcoMissingDataOverride[];
}

export interface ArcoAccessAutomatedDecisions {
  occurs: boolean;
  description?: string;
}

/** Campos que completa el oficial al resolver ACCESS */
export interface ArcoAccessReportOfficerData {
  /** Siempre enviar; usar [] si no hay terceros */
  thirdParties: string[];
  dataOriginOverride?: string;
  consentStatusOverride?: string;
  processingPurposesOverride?: ArcoAccessProcessingPurpose[];
  retentionPeriod?: string;
  automatedDecisions?: ArcoAccessAutomatedDecisions;
}

export interface ArcoAccessReportFull extends ArcoAccessReportAutoPopulated {
  thirdParties?: string[];
  retentionPeriod?: string;
  automatedDecisions?: ArcoAccessAutomatedDecisions;
  generatedAt?: string;
}

export interface ArcoAccessReportDraftResponse {
  alreadyResolved: boolean;
  autoPopulated?: ArcoAccessReportAutoPopulated;
  officerFields?: ArcoOfficerFieldsConfig;
  accessReport?: ArcoAccessReportFull;
  /** @deprecated Usar accessReport */
  savedReport?: ArcoAccessReportFull;
}

export interface ArcoRequestsQuery {
  companyId: string;
  status?: ArcoRequestStatus;
  requestType?: ArcoRequestType;
  page?: number;
  pageSize?: number;
}
