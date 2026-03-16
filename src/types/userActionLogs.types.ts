import { CustomSelectOption } from "./forms.types";
import { SessionUser } from "./user.types";

const userActionLogKeys = [] as const;
export type UserActionLogKey = (typeof userActionLogKeys)[number];

export type UserActionLogType = "CREATE" | "UPDATE" | "DELETE" | "RESTORE";

export const userActionLogTypeOptions: CustomSelectOption<UserActionLogType>[] = [
  { title: "Crear", value: "CREATE" },
  { title: "Editar", value: "UPDATE" },
  { title: "Eliminar", value: "DELETE" },
  { title: "Restaurar", value: "RESTORE" },
];

export type UserActionLogTargetModel =
  | "USER"
  | "COMPANY"
  | "COMPANY_ROLE"
  | "COMPANY_AREA"
  | "CAMPAIGN"
  | "COLLECT_FORM"
  | "COLLECT_FORM_RESPONSE"
  | "POLICY_TEMPLATE"
  | "FILE"
  | "EVALUATION";

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
      title: "Respuesta de formulario",
      value: "COLLECT_FORM_RESPONSE",
    },
    {
      title: "Plantilla",
      value: "POLICY_TEMPLATE",
    },
    {
      title: "Archivo",
      value: "FILE",
    },
    {
      title: "Evaluación",
      value: "EVALUATION",
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
  /** Ruta del API que generó la acción */
  endpoint: string;
  summary?: string;

  // virtual field
  user?: Pick<SessionUser, "name" | "lastName">;

  createdAt: string;
  updatedAt: string;
}
