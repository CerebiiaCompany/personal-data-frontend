import { CustomSelectOption } from "./forms.types";
import { SessionUser } from "./user.types";

const userActionLogKeys = [] as const;
export type UserActionLogKey = (typeof userActionLogKeys)[number];

export type UserActionLogType = "CREATE" | "UPDATE" | "DELETE";

export type UserActionLogTargetModel =
  | "USER"
  | "COMPANY"
  | "COMPANY_ROLE"
  | "COMPANY_AREA"
  | "CAMPAIGN"
  | "COLLECT_FORM"
  | "POLICY_TEMPLATE"
  | "FILE";

export const userActionLogTargetModelOptions: CustomSelectOption<UserActionLogTargetModel>[] =
  [
    {
      title: "Usuario",
      value: "USER",
    },
    {
      title: "Empresa",
      value: "COMPANY",
    },
    {
      title: "Rol",
      value: "COMPANY_ROLE",
    },
    {
      title: "Área",
      value: "COMPANY_AREA",
    },
    {
      title: "Campaña",
      value: "CAMPAIGN",
    },
    {
      title: "Formulario",
      value: "COLLECT_FORM",
    },
    {
      title: "Plantilla",
      value: "POLICY_TEMPLATE",
    },
    {
      title: "Archivo",
      value: "FILE",
    },
  ];
export const parseActionLogTargetModelToString = (
  type: UserActionLogTargetModel
): string =>
  userActionLogTargetModelOptions.find((e) => e.value === type)?.title ||
  "Modelo afectado inválido";

export interface UserActionLog {
  _id: string;
  companyId: string;
  userId?: string;

  // action details
  type: UserActionLogType;
  targetModel: UserActionLogTargetModel;
  actionKey: string;
  summary?: string; //? short description to show in activity (Eg. "Campaign creation")

  // virtual field
  user?: Pick<SessionUser, "name" | "lastName">;

  createdAt: Date;
  updatedAt: Date;
}
