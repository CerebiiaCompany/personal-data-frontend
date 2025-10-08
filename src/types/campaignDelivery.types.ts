import { CampaignDeliveryChannel } from "./campaign.types";

export interface CampaignDelivery {
  _id: string;
  companyId: string;
  campaignId: string;
  formResponseId: string;
  deliveryChannel: CampaignDeliveryChannel;
  createdAt: Date;
  updatedAt: Date;
}
