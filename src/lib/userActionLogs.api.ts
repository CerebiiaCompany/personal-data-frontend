import { APIResponse, QueryParams } from "@/types/api.types";
import { UserActionLog } from "@/types/userActionLogs.types";
import { customFetch } from "@/utils/customFetch";

/** Lista registros de auditoría de la empresa (paginado). */
export async function fetchCompanyActionLogs(
  params: QueryParams & { companyId: string }
): Promise<APIResponse<UserActionLog[]>> {
  return customFetch<UserActionLog[]>(
    `/companies/${params.companyId}/actionLogs`,
    {},
    params
  );
}

/** Obtiene un registro de auditoría por ID. */
export async function fetchCompanyActionLogById(
  companyId: string,
  actionLogId: string
): Promise<APIResponse<UserActionLog>> {
  return customFetch<UserActionLog>(
    `/companies/${companyId}/actionLogs/${actionLogId}`,
    {},
    {}
  );
}

/** Lista auditoría de un usuario concreto (solo admin). */
export async function fetchUserActionLogs(
  params: QueryParams & { companyId: string; id: string }
): Promise<APIResponse<UserActionLog[]>> {
  return customFetch<UserActionLog[]>(
    `/companies/${params.companyId}/users/${params.id}/actionLogs`,
    {},
    params
  );
}
