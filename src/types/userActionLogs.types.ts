import { CustomSelectOption } from "./forms.types";
import { SessionUser } from "./user.types";

const userActionLogKeys = [] as const;
export type UserActionLogKey = (typeof userActionLogKeys)[number];

export type UserActionLogType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  // Item AUD-F1-002/B28
  | "EXPORT"
  | "APPROVE"
  | "REJECT"
  | "ARCHIVE";

export const userActionLogTypeOptions: CustomSelectOption<UserActionLogType>[] = [
  { title: "Crear", value: "CREATE" },
  { title: "Editar", value: "UPDATE" },
  { title: "Eliminar", value: "DELETE" },
  { title: "Restaurar", value: "RESTORE" },
  { title: "Exportar", value: "EXPORT" },
  { title: "Aprobar", value: "APPROVE" },
  { title: "Rechazar", value: "REJECT" },
  { title: "Archivar", value: "ARCHIVE" },
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
  | "EVALUATION"
  | "TREATMENT"
  // Item AUD-F1-002/B28
  | "ARCO_REQUEST"
  | "CONSENT";

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
      title: "Política de tratamiento",
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
    {
      title: "Tratamiento (RAT)",
      value: "TREATMENT",
    },
    {
      title: "Solicitud ARCO",
      value: "ARCO_REQUEST",
    },
    {
      title: "Consentimiento",
      value: "CONSENT",
    },
  ];
export const parseActionLogTargetModelToString = (
  type: UserActionLogTargetModel
): string =>
  userActionLogTargetModelOptions.find((e) => e.value === type)?.title ||
  "Modelo afectado inválido";

export interface UserActionLog {
  /** @deprecated el backend nunca devolvió `_id` para este recurso (usa `id`) — se mantiene tipado por compatibilidad con código previo, no usar en código nuevo. */
  _id: string;
  id: string;
  companyId: string;
  userId?: string;

  // action details
  type: UserActionLogType;
  targetModel: UserActionLogTargetModel;
  /** Ruta del API que generó la acción */
  endpoint: string;
  summary?: string;
  /** Item OBS-36 — SHA-256 de integridad, null en filas previas a este campo */
  hash?: string | null;
  /** Item OBS-33 (31 ago 2026): snapshots antes/después ya saneados (sin
   * password/token/hash) — usados por el botón "Ver detalles" para mostrar
   * el diff completo campo por campo, no solo el resumen truncado. */
  resourceId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;

  // virtual field
  user?: Pick<SessionUser, "name" | "lastName">;

  createdAt: string;
  updatedAt: string;
}
