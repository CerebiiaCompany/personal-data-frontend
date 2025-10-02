export type CampaignGoal =
  | "INTERACTION"
  | "POTENTIAL_CUSTOMERS"
  | "SALES"
  | "PROMOTION"
  | "OTHER";

export type CampaignAudienceGender = "MALE" | "FEMALE" | "ALL";

export type CampaignDeliveryChannel = "SMS" | "EMAIL";

export interface CreateCampaign {
  name: string;
  active?: boolean;
  goal: CampaignGoal;
  scheduling: {
    startDate: Date;
    endDate: Date;
    ocurrences: number; // Amount of times the campaign will be sent
  };
  sourceFormIds: string[];
  deliveryChannel: CampaignDeliveryChannel;
  audience: {
    minAge: number;
    maxAge: number;
    gender: CampaignAudienceGender;
  };
  content: {
    name: string;
    bodyText: string;
    link?: string;
    imageUrl?: string;
  };
}

export interface Campaign extends CreateCampaign {
  _id: string;
  active: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
