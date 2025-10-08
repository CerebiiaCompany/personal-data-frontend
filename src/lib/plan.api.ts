import { APIResponse, QueryParams } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchPlans(params: QueryParams): Promise<APIResponse> {
  let endpoint = `/plans`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}
