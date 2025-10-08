import { Plan } from "./plan.types";

export type CompanyManagerDocType = "CC";
export type PlanStatus = "ACTIVE" | "INACTIVE";

export interface Company {
  _id: string;
  name: string;
  nit: string;
  manager: {
    name: string;
    docType: CompanyManagerDocType;
    docNumber: number;
  };
  email: string;
  phone: string;
  plan: Pick<Plan, "_id" | "name" | "description" | "monthlyCredits">;
  createdAt: Date;
  updatedAt: Date;
}
