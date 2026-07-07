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
  | "OPPOSITION"
  | "PORTABILITY";

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
  /** API puede enviar `name` o `fullName` */
  name?: string;
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
  /**
   * País de la empresa (ISO-3166-1 alfa-2). Se usa para habilitar derechos
   * dependientes del país; por ejemplo, PORTABILITY solo aplica a Chile ("CL").
   */
  countryCode?: string;
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

export interface ArcoRightsAttentionOfficer {
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
}

export interface ArcoRightsAttentionPublic {
  phoneLine?: string;
  officers?: ArcoRightsAttentionOfficer[];
}

export interface ArcoRectificationField {
  field: string;
  requestedValue: string;
  /** Solo legacy; el portal envía field + requestedValue */
  currentValue?: string;
}

export type ArcoOppositionScope =
  | "ALL_CAMPAIGNS"
  | "MARKETING_CAMPAIGNS"
  | "CONSENT_CAMPAIGNS"
  | "THIRD_PARTY_SHARING";

export const ARCO_OPPOSITION_SCOPE_OPTIONS: {
  value: ArcoOppositionScope;
  label: string;
  description: string;
}[] = [
  {
    value: "ALL_CAMPAIGNS",
    label: "Todas las campañas",
    description:
      "Bloquea campañas de marketing y de consentimiento mientras se resuelve.",
  },
  {
    value: "MARKETING_CAMPAIGNS",
    label: "Solo campañas de marketing",
    description: "Publicidad, promociones y comunicaciones comerciales.",
  },
  {
    value: "CONSENT_CAMPAIGNS",
    label: "Solo campañas de consentimiento",
    description: "Invitaciones para renovar o confirmar tu autorización.",
  },
  {
    value: "THIRD_PARTY_SHARING",
    label: "Compartir con terceros",
    description:
      "Te opones a que compartan tus datos con otras organizaciones.",
  },
];

export interface ArcoCreateRequestPayload {
  companyId: string;
  requestType: ArcoRequestType;
  description: string;
  rectificationFields?: ArcoRectificationField[];
  oppositionReason?: string;
  /** Requerido cuando requestType es OPPOSITION */
  oppositionScopes?: ArcoOppositionScope[];
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

/**
 * Datos personales incluidos en el export de portabilidad (Ley 21.719, Chile).
 * Provienen del último CollectFormResponse del titular en la empresa. Los
 * campos ausentes llegan `undefined` (se omiten en JSON) salvo docType/docNumber
 * que caen al valor original de la solicitud.
 */
export interface PortabilityExportPersonalData {
  docType: string;
  docNumber: string;
  name?: string;
  lastName?: string;
  razonSocial?: string;
  email?: string;
  phone?: string;
  gender?: string;
  age?: number;
}

/** Contenido completo del export de portabilidad (formato PortabilityExportData del backend). */
export interface PortabilityExportData {
  companyName: string;
  countryCode: string;
  personalData: PortabilityExportPersonalData;
  /** ISO 8601. Momento en que se generó/snapshotó el export. */
  exportedAt: string;
}

/** Formatos de descarga soportados por los endpoints de export de portabilidad. */
export type PortabilityExportFormat = "csv" | "json";

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
  /** Presente solo cuando requestType === "PORTABILITY" y la solicitud ya fue resuelta. */
  portabilityExport?: PortabilityExportData;
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
  PORTABILITY: "Portabilidad",
};

export const ARCO_REQUEST_STATUS_LABELS: Record<ArcoRequestStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelta",
  REJECTED: "Rechazada",
};
