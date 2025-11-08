import { PlanPeriodType } from "./plan.types";

export interface CreateCompanyPayment {
  planId: string; // ref Plan
  companyId: string;
  period: {
    start: string;
    end: string;
  };
  periodType: PlanPeriodType;
}

export interface CompanyPayment extends CreateCompanyPayment {
  _id: string;
  amount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    _id: string;
    name: string;
  };
}
