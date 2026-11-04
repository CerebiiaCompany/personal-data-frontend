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
  providerStatus?: string | null;
  providerErrorCode?: string | null;
  providerErrorMessage?: string | null;
  providerStatusAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
}

export interface CampaignDeliveriesQuery {
  companyId: string;
  campaignId?: string;
  deliveryId?: string;
  status?: CampaignDeliveryStatus;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
}
