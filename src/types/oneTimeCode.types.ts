import { CampaignDeliveryChannel } from "./campaign.types";

export type OtpStatus = "PENDING" | "VERIFIED" | "EXPIRED";

export interface CreateOneTimeCode {
  collectFormId: string;
  recipientData: {
    channel: CampaignDeliveryChannel;
    address: string; //? email if channel is "EMAIL", phone númber if channel is "SMS"
  };
}

export interface OneTimeCode extends CreateOneTimeCode {
  _id: string;
  code: string;
  expiresAt: Date;
  status: OtpStatus;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
