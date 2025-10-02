import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCampaign } from "@/types/campaign.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCampaigns({
  companyId,
  id,
}: QueryParams): Promise<APIResponse> {
  let endpoint = `/companies/${companyId}/campaigns`;

  if (id) endpoint += `/${id}`;

  const res = await customFetch(endpoint);

  return res;
}

export async function createCampaign(
  companyId: string,
  data: CreateCampaign
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/campaigns`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateCampaign(
  companyId: string,
  campaignId: string,
  data: UpdatePartial<CreateCampaign>
) {
  const res = await customFetch(
    `/companies/${companyId}/campaigns/${campaignId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  return res;
}

export async function deleteCampaign(
  companyId: string,
  id: string
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/campaigns/${id}`, {
    method: "DELETE",
  });

  return res;
}
