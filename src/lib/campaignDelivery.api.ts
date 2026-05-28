import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CampaignDeliveriesQuery,
  CampaignDelivery,
} from "@/types/campaignDelivery.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCampaignDeliveries(
  params: CampaignDeliveriesQuery
): Promise<APIResponse<CampaignDelivery[]>> {
  const { companyId, campaignId, deliveryId, ...query } = params;

  let endpoint: string;
  if (campaignId && deliveryId) {
    endpoint = `/companies/${companyId}/campaigns/${campaignId}/deliveries/${deliveryId}`;
  } else if (campaignId) {
    endpoint = `/companies/${companyId}/campaigns/${campaignId}/deliveries`;
  } else {
    endpoint = `/companies/${companyId}/campaigns/deliveries`;
  }

  return customFetch<CampaignDelivery[]>(endpoint, {}, query as QueryParams);
}

/** @deprecated Usar fetchCampaignDeliveries sin campaignId */
export async function fetchCompanyCampaignsDeliveries(
  params: QueryParams
): Promise<APIResponse<CampaignDelivery[]>> {
  if (!params.companyId) {
    return { error: { message: "companyId requerido", code: "validation/missing-company" } };
  }
  return fetchCampaignDeliveries({
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
    from: params.from,
    to: params.to,
    status: params.status as CampaignDeliveriesQuery["status"],
  });
}
