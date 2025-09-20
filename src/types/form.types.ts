export type MARKETING_CHANNELS = {
  sms?: boolean;
  whatsapp?: boolean;
  email?: boolean;
};

export interface CustomFormData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  marketingChannels: MARKETING_CHANNELS;
}
