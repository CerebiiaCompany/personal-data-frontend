import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CampaignDeliveriesQuery,
  CampaignDelivery,
  CampaignDeliverySummary,
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

/** Resumen de auditoría de una campaña (conteos, motivos, cupo de email). */
export async function fetchCampaignDeliverySummary(
  companyId: string,
  campaignId: string
): Promise<APIResponse<CampaignDeliverySummary>> {
  return customFetch<CampaignDeliverySummary>(
    `/companies/${companyId}/campaigns/${campaignId}/deliveries/summary`
  );
}

/** Reencola los correos FALLIDOS de una campaña de Email. */
export async function retryFailedCampaignDeliveries(
  companyId: string,
  campaignId: string
): Promise<APIResponse<{ requeued: number }>> {
  return customFetch<{ requeued: number }>(
    `/companies/${companyId}/campaigns/${campaignId}/deliveries/retry-failed`,
    { method: "POST" }
  );
}
