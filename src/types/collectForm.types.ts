import {
  CollectFormResponse,
  CollectFormResponseUser,
} from "./collectFormResponse.types";
import { CustomSelectOption } from "./forms.types";
import { DocType } from "./user.types";

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

export interface CreateCollectFormFromTemplate
  extends Omit<CreateCollectForm, "questions" | "description"> {
  responses: CollectFormResponseUser[];
}

export interface CollectForm extends CreateCollectForm {
  companyId: string;
  _id: string;
  createdAt: Date;
  isImported: boolean;
  updated: Date;
  questions: CollectFormQuestion[];
}

export interface CollectFormClasification {
  _id: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updated: Date;
  verifiedResponses: number;
  totalResponses: number;
}

export interface CollectFormWithResponses {
  _id: string;
  name: string;
  responses: CollectFormResponse[];
}
