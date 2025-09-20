export type UserRole = "USER" | "COMPANY_ADMIN" | "SUPERADMIN";
export type DocType = "CC" | "TI" | "OTHER";

export type SessionUser = {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  role: UserRole;
  companyUserData?: {
    companyId: string;
    position: string;
    phone: string;
    personalEmail: string;
    companyAreaId: string;
    companyRoleId: string;
    note: string;
    docNumber: number;
    docType: DocType;
  };
  createdAt: Date;
  updated: Date;
};
