import { CustomSelectOption } from "./forms.types";
import { DocType } from "./user.types";

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

export interface CollectFormResponseUser {
  docType: DocType;
  docNumber: number;
  name: string;
  lastName: string;
  age: number;
  gender: UserGender;
  email: string;
  phone: string;
}

export interface CreateCollectFormResponse {
  user: CollectFormResponseUser;
  data: { [key: string]: any };
  dataProcessing: boolean;
  otpCode: string;
  otpCodeId: string;
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
  status?: string;
  statusUpdatedAt?: string;
  revokedAt?: string | null;
  revokeReason?: string | null;
  audit?: ConsentAuditEntry[];
}

export interface CollectFormResponse {
  _id: string;
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
