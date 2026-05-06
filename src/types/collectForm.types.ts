import {
  CollectFormResponse,
  CollectFormResponseUser,
} from "./collectFormResponse.types";
import { CustomFile } from "./file.types";
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
  policyTemplateId: string;
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
  totalResponses: number;
  updated: Date;
  questions: CollectFormQuestion[];
  policyTemplateFile: Pick<
    CustomFile,
    "_id" | "originalName" | "key" | "contentType"
  >;
}

/** Resumen global devuelto por GET .../collectForms/clasification */
export interface ClasificationListSummary {
  lastResponseAt?: string | Date;
  activeFormsCount: number;
  totalResponses: number;
  verifiedResponses: number;
}

export interface CollectFormClasification {
  _id: string;
  name: string;
  companyId: string;
  createdAt: Date | string;
  /** Fecha de actualización del formulario (campo canónico del backend) */
  updatedAt: Date | string;
  /**
   * @deprecated El backend usa `updatedAt`. Se mantiene por compatibilidad con respuestas antiguas.
   */
  updated?: Date | string;
  verifiedResponses: number;
  totalResponses: number;
  /** Descripción del formulario para listados */
  description?: string;
  /** Fecha del último registro/respuesta de este formulario (ISO) */
  lastResponseAt?: string | Date;
  isActive?: boolean;
}

export interface CollectFormWithResponses {
  _id: string;
  name: string;
  responses: CollectFormResponse[];
}
