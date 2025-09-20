type MarketingChannel = "SMS" | "WHATSAPP" | "EMAIL";
type MarketingChannels = Record<MarketingChannel, boolean>;

export type AnswerType = "TEXT" | "DATE";
export type DataType = "PERSONAL" | "MEDICAL"; // ...research legal terms

export interface CollectFormQuestion {
  _id: string;
  title: string;
  answerType: AnswerType;
  dataType: DataType;
  order: number;
}

export interface CreateCollectForm {
  name: string;
  description: string;
  marketingChannels: MarketingChannels;
  questions: Omit<CollectFormQuestion, "_id">[];
}

export interface CollectForm extends CreateCollectForm {
  companyId: string;
  _id: string;
  createdAt: Date;
  updated: Date;
  questions: CollectFormQuestion[];
}
