export type AppSettingKey = "SMS_PRICE_PER_MESSAGE";

export type AppSettingType = "STRING" | "NUMBER" | "BOOLEAN";

export interface AppSetting {
  _id: string;
  key: AppSettingKey;
  value: string | number | boolean;
  type: AppSettingType;
  createdAt: Date;
  updatedAt: Date;
}
