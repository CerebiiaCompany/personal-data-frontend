import { CustomSelectOption } from "./forms.types";
import { DocType } from "./user.types";

export type CollectFormDocType = DocType | "NIT";

export const parseCollectFormDocTypeToString = (type: CollectFormDocType): string => {
  if (type === "NIT") return "NIT";
  return (
    { CC: "C.C.", TI: "T.I.", OTHER: "Otro" }[type] ?? "Tipo de documento inválido"
  );
};

/** Estados de consentimiento soportados por el backend (endpoint de respuestas). */
export type ConsentStatus = "ACTIVE" | "PENDING" | "REVOKED";

export const consentStatusOptions: { value: ConsentStatus; title: string }[] = [
  { value: "ACTIVE", title: "Activo" },
  { value: "PENDING", title: "Pendiente" },
  { value: "REVOKED", title: "Revocado" },
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
