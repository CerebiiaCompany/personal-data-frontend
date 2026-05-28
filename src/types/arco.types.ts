import type { ArcoAccessReportFull } from "@/types/arco.admin.types";

export type { ArcoAccessReportFull };

export type ArcoDocType = "CC" | "TI" | "NIT" | "OTHER";

export type ArcoOtpChannel = "EMAIL" | "SMS";

export const ARCO_OTP_CHANNEL_OPTIONS = [
  {
    value: "EMAIL" as const,
    label: "Correo electrónico",
    description: "Código a tu email registrado",
    icon: "tabler:mail",
  },
  {
    value: "SMS" as const,
    label: "Mensaje de texto (SMS)",
    description: "Código a tu celular registrado",
    icon: "tabler:device-mobile",
  },
];

export type ArcoRequestType =
  | "ACCESS"
  | "RECTIFICATION"
  | "CANCELLATION"
  | "OPPOSITION";

export type ArcoRequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export interface ArcoLookupPayload {
  docType: ArcoDocType;
  docNumber: string;
  /** Por defecto el backend usa EMAIL si se omite */
  channel?: ArcoOtpChannel;
}

export interface ArcoLookupResult {
  sessionId: string;
  channel: ArcoOtpChannel;
  maskedEmail?: string;
  maskedPhone?: string;
  expiresInMinutes: number;
}

export interface ArcoVerifyPayload {
  sessionId: string;
  code: string;
}

export interface ArcoVerifyResult {
  sessionToken: string;
  expiresAt: string;
  docType: ArcoDocType;
  docNumber: string;
}

export interface ArcoDataOfficer {
  fullName?: string;
  position?: string;
  email?: string;
  phone?: string;
}

export interface ArcoCompanyInfo {
  name: string;
  nit?: string;
  email?: string;
  phone?: string;
  dataOfficer?: ArcoDataOfficer;
}

export interface ArcoConsentInfo {
  status: string;
  acceptedAt?: string;
  obtainedVia?: string;
  policyTemplateId?: string;
  policyVersionLabel?: string;
  policyName?: string;
}

export interface ArcoCompanyEntry {
  companyId: string;
  company: ArcoCompanyInfo;
  consent: ArcoConsentInfo;
  registeredAt?: string;
}

export interface ArcoPolicyResult {
  policy: {
    id: string;
    name: string;
    versionLabel?: string;
    fileUrl: string;
  };
  consent: ArcoConsentInfo;
}

export interface ArcoRectificationField {
  field: string;
  currentValue: string;
  requestedValue: string;
}

export interface ArcoCreateRequestPayload {
  companyId: string;
  requestType: ArcoRequestType;
  description: string;
  rectificationFields?: ArcoRectificationField[];
  oppositionReason?: string;
}

export interface ArcoRegulationInfo {
  countryCode: string;
  dayType?: string;
  dueDays?: number;
  legalReference?: string;
}

export interface ArcoCreateRequestResult {
  requestId: string;
  requestType: ArcoRequestType;
  status: ArcoRequestStatus;
  dueDate: string;
  regulation?: ArcoRegulationInfo;
  createdAt: string;
}

export interface ArcoRequestListItem {
  requestId: string;
  company: {
    companyId: string;
    name: string;
    nit?: string;
  };
  requestType: ArcoRequestType;
  status: ArcoRequestStatus;
  description: string;
  dueDate: string;
  resolvedAt?: string;
  response?: {
    message: string;
    respondedAt?: string;
  };
  accessReport?: ArcoAccessReportFull;
  createdAt: string;
}

export const ARCO_RECTIFICATION_FIELDS = [
  { value: "name", label: "Nombre" },
  { value: "lastName", label: "Apellido" },
  { value: "email", label: "Correo electrónico" },
  { value: "phone", label: "Teléfono" },
  { value: "razonSocial", label: "Razón social" },
  { value: "gender", label: "Género" },
  { value: "age", label: "Edad" },
] as const;

export const ARCO_REQUEST_TYPE_LABELS: Record<ArcoRequestType, string> = {
  ACCESS: "Acceso",
  RECTIFICATION: "Rectificación",
  CANCELLATION: "Cancelación",
  OPPOSITION: "Oposición",
};

export const ARCO_REQUEST_STATUS_LABELS: Record<ArcoRequestStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelta",
  REJECTED: "Rechazada",
};
