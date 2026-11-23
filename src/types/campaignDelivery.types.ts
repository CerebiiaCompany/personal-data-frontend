import { CampaignDeliveryChannel } from "./campaign.types";

export type CampaignDeliveryStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface CampaignDeliveryUser {
  docType: string;
  docNumber: number | string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
}

export interface CampaignDelivery {
  _id?: string;
  campaignId: string;
  companyId: string;
  formResponseId: string;
  recipient: string;
  deliveryChannel: CampaignDeliveryChannel;
  status: CampaignDeliveryStatus;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  user: CampaignDeliveryUser | null;
  /** Estado real en WhatsApp (YCloud): ACCEPTED, SENT, DELIVERED, READ o FAILED. */
  /** Id del mensaje en el proveedor (WhatsApp / Brevo), para rastrearlo allá. */
  providerMessageId?: string | null;
  providerStatus?: string | null;
  providerErrorCode?: string | null;
  providerErrorMessage?: string | null;
  providerStatusAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  /** Auditoría de envío (email): intentos, último intento y próximo reintento si quedó reprogramado. */
  attempts?: number;
  lastAttemptAt?: string | null;
  nextAttemptAt?: string | null;
}

export interface CampaignDeliveriesQuery {
  companyId: string;
  campaignId?: string;
  deliveryId?: string;
  /** "DEFERRED" = pendientes reprogramados por cupo/proveedor. */
  status?: CampaignDeliveryStatus | "DEFERRED";
  /** Filtra por código de motivo (providerErrorCode). */
  reason?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
}

export interface CampaignDeliveryReason {
  code: string | null;
  message: string | null;
  count: number;
}

export interface CampaignEmailQuota {
  enabled: boolean;
  day: string;
  timezone: string;
  used: number;
  limit: number;
  reserve: number;
  campaignCap: number;
  campaignRemaining: number;
  resetsAt: string;
  providerBlockedUntil: string | null;
}

/** GET /campaigns/:id/deliveries/summary — auditoría de la campaña. */
export interface CampaignDeliverySummary {
  channel: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  deferred: number;
  retryQueued: number;
  queued: number;
  progressPct: number;
  firstSentAt: string | null;
  lastSentAt: string | null;
  nextAttemptAt: string | null;
  failureReasons: CampaignDeliveryReason[];
  deferReasons: CampaignDeliveryReason[];
  canRetryFailed: boolean;
  emailQuota: CampaignEmailQuota | null;
}
