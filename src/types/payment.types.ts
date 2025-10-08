import { PlanPeriodType } from "./plan.types";

export interface CreateCompanyPayment {
  planId: string; // ref Plan
  period: {
    start: Date;
    end: Date;
  };
  periodType: PlanPeriodType;
}

export interface CompanyPayment extends CreateCompanyPayment {
  _id: string;
  companyId: string; // ref Company
  amount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
