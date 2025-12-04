import { Plan } from "./plan.types";
import { DocType } from "./user.types";

export type CompanyManagerDocType = "CC";
export type PlanStatus = "ACTIVE" | "INACTIVE";

export interface CreateCompany {
  name: string;
  nit: string;
  manager: {
    name: string;
    docType: DocType;
    docNumber: string;
  };
  email: string;
  phone: string;
  planId: string;
}

export interface Company extends CreateCompany {
  _id: string;
  plan: Pick<Plan, "_id" | "name" | "description" | "monthlyCredits">;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyCreditsCurrentMonth {
  creditsUsed: number;
  month: number;
  year: number;
  period: string;
}