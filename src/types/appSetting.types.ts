export type AppSettingKey =
  | "TRM_COP"
  | "SMS_PRICE_PER_MESSAGE"
  | "SMS_PRICE_PER_MESSAGE_TWILIO"
  | "SMS_PRICE_PER_MESSAGE_MASIVAPP"
  | "EMAIL_PRICE_PER_MESSAGE"
  | "SMS_CAMPAIGN_PRICE_PER_MESSAGE"
  | "SMS_CAMPAIGN_PRICE_PER_MESSAGE_TWILIO"
  | "SMS_CAMPAIGN_PRICE_PER_MESSAGE_MASIVAPP"
  | "EMAIL_CAMPAIGN_PRICE_PER_MESSAGE";

export type AppSettingType = "STRING" | "NUMBER" | "BOOLEAN";

export interface AppSetting {
  _id?: string;
  key: AppSettingKey;
  value: string | number | boolean;
  type: AppSettingType;
  source?: "ENV" | "DB" | string;
  createdAt?: Date;
  updatedAt?: Date;
}
