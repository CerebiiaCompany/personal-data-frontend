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
