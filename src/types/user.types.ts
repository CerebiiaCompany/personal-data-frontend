import { CompanyArea } from "./companyArea.types";
import { CompanyRole } from "./companyRole.types";
import { CustomSelectOption } from "./forms.types";

export type UserRole = "USER" | "COMPANY_ADMIN" | "SUPERADMIN";
export const userRoleOptions: CustomSelectOption<UserRole>[] = [
  {
    value: "USER",
    title: "Usuario",
  },
  {
    value: "COMPANY_ADMIN",
    title: "Administrador de empresa",
  },
  {
    value: "SUPERADMIN",
    title: "Superadministrador",
  },
];
export const parseUserRoleToString = (role: UserRole): string =>
  userRoleOptions.find((e) => e.value === role)?.title || "Rol inválido";

export type DocType = "CC" | "TI" | "OTHER";

export const docTypesOptions: CustomSelectOption<DocType>[] = [
  {
    value: "CC",
    title: "C.C.",
  },
  {
    value: "TI",
    title: "T.I.",
  },
  {
    value: "OTHER",
    title: "Otro",
  },
];

export const parseDocTypeToString = (type: DocType): string =>
  docTypesOptions.find((e) => e.value === type)?.title ||
  "Tipo de documento inválido";

export interface CreateUser {
  name: string;
  lastName: string;
  username: string;
  role: UserRole;
  password: string;
  companyUserData: {
    position: string;
    phone: string;
    personalEmail: string;
    companyAreaId: string;
    /* companyRoleId: string; */
    note?: string;
    docNumber: number;
    docType: DocType;
  };
}

export type UpdateUser = Omit<CreateUser, "password">;

export interface SessionUser {
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
    companyArea: Pick<CompanyArea, "_id" | "name">;
    companyRole: Pick<CompanyRole, "_id" | "position" | "permissions">;
    note?: string;
    docNumber: number;
    docType: DocType;
  };
  createdAt: Date;
  updatedAt: Date;
}
