import { CustomSelectOption } from "./forms.types";
import { DocType } from "./user.types";

export type CollectFormDocType = DocType | "NIT";

export const parseCollectFormDocTypeToString = (type: CollectFormDocType): string => {
  if (type === "NIT") return "NIT";
  return (
    { CC: "C.C.", TI: "T.I.", OTHER: "Otro" }[type] ?? "Tipo de documento inválido"
  );
};

/** Estados de consentimiento soportados por el backend (portal ARCO y clasificación). */
export type ConsentStatus =
  | "ACTIVE"
  | "PENDING"
  | "REVOKED"
  | "CLAIM_IN_PROGRESS"
  | "LEGAL_DISPUTE";

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
  ACTIVE: "Consentimiento activo",
  PENDING: "Pendiente de confirmación",
  REVOKED: "Revocado (cancelación ejecutada)",
  CLAIM_IN_PROGRESS: "Solicitud de cancelación en trámite",
  LEGAL_DISPUTE: "En disputa legal",
};

export const CONSENT_STATUS_EMPTY_LABEL =
  "Sin registro de consentimiento formal";

export function getConsentStatusLabel(status?: string | null): string {
  const raw = (status ?? "").trim();
  if (!raw) return CONSENT_STATUS_EMPTY_LABEL;
  const key = raw.toUpperCase();
  if (key in CONSENT_STATUS_LABELS) {
    return CONSENT_STATUS_LABELS[key as ConsentStatus];
  }
  return raw;
}

export function getConsentStatusChipClass(status?: string | null): string {
  const s = (status ?? "").trim().toUpperCase();
  if (!s) return "bg-[#F1F5F9] text-[#64748B]";
  if (s === "ACTIVE") return "bg-[#E8F8EE] text-[#1E8A52]";
  if (s === "REVOKED") return "bg-[#FDECEC] text-[#D84C4C]";
  if (s === "CLAIM_IN_PROGRESS") return "bg-[#EDF2FA] text-[#2563EB]";
  if (s === "LEGAL_DISPUTE") return "bg-[#F3E8FF] text-[#7C3AED]";
  if (s === "PENDING") return "bg-[#FDF4E6] text-[#A97711]";
  return "bg-[#FDF4E6] text-[#A97711]";
}

export const consentStatusOptions: { value: ConsentStatus; title: string }[] = [
  { value: "ACTIVE", title: CONSENT_STATUS_LABELS.ACTIVE },
  { value: "PENDING", title: CONSENT_STATUS_LABELS.PENDING },
  { value: "REVOKED", title: CONSENT_STATUS_LABELS.REVOKED },
  {
    value: "CLAIM_IN_PROGRESS",
    title: CONSENT_STATUS_LABELS.CLAIM_IN_PROGRESS,
  },
  { value: "LEGAL_DISPUTE", title: CONSENT_STATUS_LABELS.LEGAL_DISPUTE },
];

export type PersonKind = "NATURAL" | "JURIDICA";

export const personKindOptions: CustomSelectOption<PersonKind>[] = [
  { value: "NATURAL", title: "Persona natural" },
  { value: "JURIDICA", title: "Persona jurídica" },
];

export function isJuridicaDocType(docType?: string): boolean {
  return (docType || "").toUpperCase() === "NIT";
}

export function getPersonKindFromDocType(docType?: string): PersonKind {
  return isJuridicaDocType(docType) ? "JURIDICA" : "NATURAL";
}

export function getPersonKindLabel(docType?: string): string {
  return isJuridicaDocType(docType) ? "Jurídica" : "Natural";
}

export type UserGender = "MALE" | "FEMALE" | "OTHER";
export const userGendersOptions: CustomSelectOption<UserGender>[] = [
  {
    title: "Masculino",
    value: "MALE",
  },
  {
    title: "Femenino",
    value: "FEMALE",
  },
  {
    title: "Otro",
    value: "OTHER",
  },
];

export const parseUserGenderToString = (role: UserGender): string =>
  userGendersOptions.find((e) => e.value === role)?.title || "Género inválido";

/**
 * Campos que el backend puede reportar como faltantes en el prefill de campaña
 * (GET /public/collectForms/:id/prefill?qct=...). docType, docNumber, email y
 * phone nunca aparecen aquí: siempre se conocen.
 */
export type CollectFormMissingField =
  | "name"
  | "lastName"
  | "age"
  | "gender"
  | "razonSocial";

/** Campos ya conocidos por el backend para una persona de la campaña. */
export interface CollectFormPrefillKnownFields {
  docType?: CollectFormDocType;
  docNumber?: number;
  email?: string;
  phone?: string;
  name?: string;
  lastName?: string;
  age?: number;
  gender?: UserGender;
  razonSocial?: string;
}

export interface CollectFormPrefill {
  knownFields: CollectFormPrefillKnownFields;
  missingFields: CollectFormMissingField[];
  isComplete: boolean;
}

export interface CollectFormResponseUserNatural {
  docType: DocType;
  docNumber: number;
  name: string;
  lastName: string;
  age: number;
  gender: UserGender;
  email: string;
  phone: string;
}

export interface CollectFormResponseUserJuridica {
  docType: Extract<CollectFormDocType, "NIT">;
  docNumber: number;
  razonSocial: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export type CollectFormResponseUserPayload =
  | CollectFormResponseUserNatural
  | CollectFormResponseUserJuridica;

/** Usuario en respuestas del API (natural o jurídica). */
export type CollectFormResponseUser = CollectFormResponseUserPayload & {
  name?: string;
  lastName?: string;
  age?: number;
  gender?: UserGender;
  razonSocial?: string;
};

export interface CreateCollectFormResponse {
  user: CollectFormResponseUserPayload;
  data: { [key: string]: any };
  dataProcessing: boolean;
  otpCode: string;
  otpCodeId: string;
  /** Canal/dirección del OTP que finalmente se usó para verificar (último envío exitoso) */
  recipientData?: OneTimeCodeRecipientData;
}

export interface OneTimeCodeRecipientData {
  channel?: "SMS" | "EMAIL";
  address?: string;
}

export interface OneTimeCodeDeliveryInfo {
  provider?: string;
  providerMessageId?: string;
  status?: string;
  sentAt?: string;
  attempts?: number;
  lastError?: any;
}

export interface OneTimeCodePopulated {
  _id: string;
  status?: string;
  verifiedAt?: string;
  expiresAt?: string;
  recipientData?: OneTimeCodeRecipientData;
  messageText?: string;
  policyUrl?: string;
  delivery?: OneTimeCodeDeliveryInfo;
  failedAttempts?: number;
}

export interface ConsentAuditEntry {
  type?: string;
  at?: string;
  actor?: {
    userId?: string;
    username?: string;
    role?: string;
  };
  meta?: Record<string, any>;
}

export interface ConsentInfo {
  consentId?: string;
  policy?: {
    policyTemplateId?: string;
    policyVersionLabel?: string;
  };
  acceptedAt?: string;
  obtainedVia?: string;
  collectionPoint?: string;
  otp?: {
    otpCodeId?: string;
    verified?: boolean;
    verifiedAt?: string;
    channel?: "SMS" | "EMAIL";
    address?: string;
    providerMessageId?: string;
    sendStatus?: string;
    sendAttempts?: number;
    failedVerifyAttempts?: number;
  };
  otpMessage?: {
    text?: string;
    policyUrl?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  status?: ConsentStatus | (string & {});
  statusUpdatedAt?: string;
  revokedAt?: string | null;
  revokeReason?: string | null;
  audit?: ConsentAuditEntry[];
}

export interface CollectFormPermissionsRestrictions {
  cancellationInProgress?: boolean;
  blockAllCampaigns?: boolean;
  blockMarketingCampaigns?: boolean;
  blockConsentCampaigns?: boolean;
  blockThirdParty?: boolean;
}

export interface CollectFormPermissions {
  canReceiveMarketingCampaigns?: boolean;
  canReceiveConsentCampaigns?: boolean;
  canShareWithThirdParties?: boolean;
  restrictions?: CollectFormPermissionsRestrictions;
}

/** Registro manual desde admin (sin OTP). Campos opcionales según tipo de persona. */
export interface AdminCollectFormRecordInput {
  docType?: CollectFormDocType | string;
  docNumber?: string | number;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  razonSocial?: string;
}

export type CreateAdminCollectFormResponsesBody =
  | AdminCollectFormRecordInput
  | { records: AdminCollectFormRecordInput[] };

export interface CreateAdminCollectFormResponsesResult {
  created: number;
  skipped: number;
  skippedRecords?: AdminCollectFormRecordInput[];
}

/** Body parcial para PATCH de datos recolectados (solo campos a modificar). */
export interface UpdateCollectFormResponseInput {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  docType?: CollectFormDocType | string;
  docNumber?: string | number;
  razonSocial?: string | null;
  age?: number;
  gender?: UserGender | string;
}

export interface UpdateCollectFormResponseResult {
  id: string;
  userDocType?: string;
  userDocNumber?: number;
  userName?: string;
  userLastName?: string;
  userEmail?: string;
  userPhone?: string;
  consentStatus?: ConsentStatus | string;
  dataProcessing?: boolean;
  updatedAt?: string;
}

export interface CollectFormResponse {
  _id: string;
  /** Alias de `_id`. El backend envía ambos con el mismo valor. */
  id?: string;
  companyId?: string;
  collectFormId: string;
  user: CollectFormResponseUser;
  data?: { [key: string]: any };
  dataProcessing?: boolean;

  // En el response del backend puede venir como string (id) o como objeto poblado
  otpCodeId?: string | OneTimeCodePopulated;

  verifiedWithOTP?: boolean;
  consent?: ConsentInfo;
  permissions?: CollectFormPermissions;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    _id?: string;
    userId?: string;
    name?: string;
    lastName?: string;
    email?: string;
    username?: string;
  };
}
