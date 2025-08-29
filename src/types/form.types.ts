export type MARKETING_CHANNELS = "SMS" | "EMAIL" | "WHATSAPP";

export interface CustomFormData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  marketingChannels: MARKETING_CHANNELS[];
}
