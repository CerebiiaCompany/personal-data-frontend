import { APIResponse, QueryParams } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyUsersActionLogs(
  params: QueryParams
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${params.companyId}/actionLogs`,
    {},
    params
  );

  console.log(res)

  return res;
}
export async function fetchUserActionLogs(
  params: QueryParams
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${params.companyId}/users/${params.id}/actionLogs`,
    {},
    params
  );

  return res;
}
