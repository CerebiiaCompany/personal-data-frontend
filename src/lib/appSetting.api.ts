import { APIResponse, QueryParams } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchAppSettings(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/appSettings`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}
