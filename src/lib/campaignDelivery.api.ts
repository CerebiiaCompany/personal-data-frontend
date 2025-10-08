import { QueryParams, APIResponse } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyCampaignsDeliveries(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/campaigns/deliveries`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}
