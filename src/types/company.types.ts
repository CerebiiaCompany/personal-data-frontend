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
  planData: {
    planId: string;
    status: PlanStatus;
  };
  createdAt: Date;
  updatedAt: Date;
}
