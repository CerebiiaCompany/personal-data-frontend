export type CampaignGoal =
  | "INTERACTION"
  | "POTENTIAL_CUSTOMERS"
  | "SALES"
  | "PROMOTION"
  | "OTHER";

export type CampaignStatus = "COMPLETED" | "EXPIRED" | "DRAFT" | "ACTIVE" | "SCHEDULED";

export const campaignGoalLabels: Record<CampaignGoal, string> = {
  INTERACTION: "Interacción",
  POTENTIAL_CUSTOMERS: "Clientes potenciales",
  SALES: "Ventas",
  PROMOTION: "Promoción",
  OTHER: "Otro",
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  COMPLETED: "Completada",
  EXPIRED: "Expirada",
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  SCHEDULED: "Programada",
};

export const campaignStatusColors: Record<CampaignStatus, string> = {
  COMPLETED: "bg-green-100 text-green-700 border-green-300",
  EXPIRED: "bg-red-100 text-red-700 border-red-300",
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
  ACTIVE: "bg-blue-100 text-blue-700 border-blue-300",
  SCHEDULED: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

export const deliveryChannelLabels: Record<CampaignDeliveryChannel, string> = {
  SMS: "SMS",
  EMAIL: "Correo",
  WHATSAPP: "WhatsApp",
};

export type CampaignAudienceGender = "MALE" | "FEMALE" | "OTHER" | "ALL";

/** Cómo definir destinatarios en el asistente de campaña. */
export type CampaignAudienceSelectionMode = "FILTERS" | "MANUAL";

export type CampaignDeliveryChannel = "SMS" | "EMAIL" | "WHATSAPP";

/**
 * Mínimo de minutos en el futuro para programar el envío de una campaña.
 * SMS se mantiene en 5 minutos porque es un requisito real de la API de
 * MasivApp (rechaza envíos programados con menos anticipación); el resto de
 * canales usa 3 minutos.
 */
export const MIN_SCHEDULE_MINUTES_SMS = 5;
export const MIN_SCHEDULE_MINUTES_DEFAULT = 3;

export function getMinScheduleMinutes(
  deliveryChannel?: CampaignDeliveryChannel
): number {
  return deliveryChannel === "SMS"
    ? MIN_SCHEDULE_MINUTES_SMS
    : MIN_SCHEDULE_MINUTES_DEFAULT;
}

/** Contenido específico de WhatsApp: solo admite plantillas pre-aprobadas por Meta (no texto libre). */
export interface CampaignWhatsappContent {
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
  /** Si la plantilla lleva un parámetro de texto en el header, se usa el nombre del destinatario. Default true. */
  whatsappHeaderParam?: boolean;
}

/**
 * Plantillas de WhatsApp aprobadas en Meta Business — no configurables desde el
 * formulario (usar cualquier otro nombre/idioma falla contra la API de Meta). Cada
 * campaña usa la que corresponde a su propósito:
 *   - cerebiia_data_v2: campañas CONSENT_REQUEST (consentimiento de tratamiento de datos).
 *     Header: nombre del destinatario. Sin body.
 *   - cerebiia_data_notificaciones: el resto (marketing, notificación, ventas, etc.).
 *     Header: nombre de la empresa. Body: {{1}} nombre destinatario, {{2}} nombre
 *     empresa, {{3}} texto libre (content.bodyText) — validado por
 *     whatsappTemplateValidation.utils.ts contra las políticas de WhatsApp Business.
 */
export const WHATSAPP_TEMPLATE_NAME = "cerebiia_data_v2";
export const WHATSAPP_TEMPLATE_LANGUAGE = "es_CO";
export const WHATSAPP_NOTIFICATION_TEMPLATE_NAME = "cerebiia_data_notificaciones";
export const WHATSAPP_NOTIFICATION_TEMPLATE_LANGUAGE = "es_CO";

export interface CreateCampaign {
  type?: "MARKETING" | "CONSENT_REQUEST";
  name: string;
  active: boolean;
  goal: CampaignGoal;
  scheduling: {
    startDate: string;
    endDate: string;
    ocurrences: number; // Amount of times the campaign will be sent
  };
  sourceFormIds: string[];
  deliveryChannel: CampaignDeliveryChannel;
  audience: {
    minAge: number;
    maxAge: number;
    gender: CampaignAudienceGender;
    count: number;
  };
  content: {
    name: string;
    bodyText: string;
    link?: string;
    imageUrl?: string;
  } & CampaignWhatsappContent;
  targetedResponseIds?: string[];
}

// Tipo para campañas programadas (con fecha/hora específica)
export interface CreateScheduledCampaign {
  name: string;
  active: boolean;
  goal: CampaignGoal;
  scheduling: {
    scheduledDateTime: string; // Para campañas programadas
  };
  sourceFormIds: string[];
  deliveryChannel: CampaignDeliveryChannel;
  audience: {
    minAge: number;
    maxAge: number;
    gender: CampaignAudienceGender;
    count: number;
  };
  content: {
    name: string;
    bodyText: string;
    link?: string;
    imageUrl?: string;
  } & CampaignWhatsappContent;
  targetedResponseIds?: string[];
}

export interface CreateConsentCampaign {
  type: "CONSENT_REQUEST";
  name: string;
  deliveryChannel: CampaignDeliveryChannel;
  sourceFormIds: [string];
  scheduling: {
    scheduledDateTime: string;
  };
  content: {
    name: string;
    bodyText: string;
  } & CampaignWhatsappContent;
}

export interface Campaign {
  _id: string;
  type?: "MARKETING" | "CONSENT_REQUEST";
  active: boolean;
  companyId: string;
  name: string;
  goal: CampaignGoal;
  status?: CampaignStatus;
  scheduledFor?: string;
  scheduling: {
    startDate?: string;
    endDate?: string;
    ocurrences?: number;
    scheduledDateTime?: string; // Para campañas programadas
  };
  sourceFormIds: string[];
  deliveryChannel: CampaignDeliveryChannel;
  audience: {
    minAge: number;
    maxAge: number;
    gender: CampaignAudienceGender;
    count: number;
    total?: number;
    delivered?: number;
  };
  content: {
    name: string;
    bodyText: string;
    link?: string;
    imageUrl?: string;
  } & CampaignWhatsappContent;
  targetedResponseIds?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
