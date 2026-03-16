import { UserActionLogTargetModel } from "@/types/userActionLogs.types";

export type RestoreableTargetModel =
  | "USER"
  | "COMPANY_AREA"
  | "COMPANY_ROLE"
  | "CAMPAIGN"
  | "COLLECT_FORM"
  | "COLLECT_FORM_RESPONSE"
  | "POLICY_TEMPLATE";

/** Result of parsing an action log endpoint for restore. */
export interface ParsedRestoreIds {
  companyId: string;
  targetModel: RestoreableTargetModel;
  /** For COLLECT_FORM response restore: formId and responseId. For form restore: only resourceId. */
  resourceId: string;
  responseId?: string;
}

/**
 * Parsea el endpoint de un action log (ej. /api/v1/companies/XXX/users/YYY)
 * y extrae companyId y el ID del recurso para poder llamar al restore.
 * Para respuestas de formulario devuelve resourceId (formId) y responseId.
 */
export function parseEndpointForRestore(
  endpoint: string,
  targetModel: UserActionLogTargetModel
): ParsedRestoreIds | null {
  if (!endpoint) return null;

  const segments = endpoint.split("/").filter(Boolean);
  const companiesIdx = segments.indexOf("companies");
  if (companiesIdx === -1 || companiesIdx + 1 >= segments.length) return null;

  const companyId = segments[companiesIdx + 1];
  if (!companyId) return null;

  const rest = segments.slice(companiesIdx + 2);

  switch (targetModel) {
    case "USER": {
      const usersIdx = rest.indexOf("users");
      if (usersIdx === -1 || usersIdx + 1 >= rest.length) return null;
      return {
        companyId,
        targetModel: "USER",
        resourceId: rest[usersIdx + 1],
      };
    }
    case "COMPANY_AREA": {
      const areasIdx = rest.indexOf("areas");
      if (areasIdx === -1 || areasIdx + 1 >= rest.length) return null;
      return {
        companyId,
        targetModel: "COMPANY_AREA",
        resourceId: rest[areasIdx + 1],
      };
    }
    case "COMPANY_ROLE": {
      const rolesIdx = rest.indexOf("roles");
      if (rolesIdx === -1 || rolesIdx + 1 >= rest.length) return null;
      return {
        companyId,
        targetModel: "COMPANY_ROLE",
        resourceId: rest[rolesIdx + 1],
      };
    }
    case "CAMPAIGN": {
      const campaignsIdx = rest.indexOf("campaigns");
      if (campaignsIdx === -1 || campaignsIdx + 1 >= rest.length) return null;
      return {
        companyId,
        targetModel: "CAMPAIGN",
        resourceId: rest[campaignsIdx + 1],
      };
    }
    case "COLLECT_FORM": {
      const formsIdx = rest.indexOf("collectForms");
      if (formsIdx === -1 || formsIdx + 1 >= rest.length) return null;
      const formId = rest[formsIdx + 1];
      const responsesIdx = rest.indexOf("responses", formsIdx);
      if (responsesIdx !== -1 && responsesIdx + 1 < rest.length) {
        return {
          companyId,
          targetModel: "COLLECT_FORM",
          resourceId: formId,
          responseId: rest[responsesIdx + 1],
        };
      }
      return {
        companyId,
        targetModel: "COLLECT_FORM",
        resourceId: formId,
      };
    }
    case "COLLECT_FORM_RESPONSE": {
      const formsIdx = rest.indexOf("collectForms");
      if (formsIdx === -1 || formsIdx + 1 >= rest.length) return null;
      const formId = rest[formsIdx + 1];
      const responsesIdx = rest.indexOf("responses", formsIdx);
      if (responsesIdx === -1 || responsesIdx + 1 >= rest.length) return null;

      return {
        companyId,
        targetModel: "COLLECT_FORM_RESPONSE",
        resourceId: formId,
        responseId: rest[responsesIdx + 1],
      };
    }
    case "POLICY_TEMPLATE": {
      const templatesIdx = rest.indexOf("policyTemplates");
      if (templatesIdx === -1 || templatesIdx + 1 >= rest.length) return null;
      return {
        companyId,
        targetModel: "POLICY_TEMPLATE",
        resourceId: rest[templatesIdx + 1],
      };
    }
    default:
      return null;
  }
}

/** Modelos que tienen endpoint de restore en el backend. */
export const RESTOREABLE_TARGET_MODELS: UserActionLogTargetModel[] = [
  "USER",
  "COMPANY_AREA",
  "COMPANY_ROLE",
  "CAMPAIGN",
  "COLLECT_FORM",
  "COLLECT_FORM_RESPONSE",
  "POLICY_TEMPLATE",
];

export function isRestoreableTargetModel(
  model: UserActionLogTargetModel
): model is RestoreableTargetModel {
  return RESTOREABLE_TARGET_MODELS.includes(model);
}
