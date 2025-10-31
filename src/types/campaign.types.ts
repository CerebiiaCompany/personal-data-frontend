export type CampaignGoal =
  | "INTERACTION"
  | "POTENTIAL_CUSTOMERS"
  | "SALES"
  | "PROMOTION"
  | "OTHER";

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
};

export type CampaignAudienceGender = "MALE" | "FEMALE" | "OTHER" | "ALL";

export type CampaignDeliveryChannel = "SMS" | "EMAIL";

export interface CreateCampaign {
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
  };
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
  };
}

export type CampaignStatus = "COMPLETED" | "EXPIRED" | "DRAFT" | "ACTIVE" | "SCHEDULED";

export interface Campaign {
  _id: string;
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
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}
