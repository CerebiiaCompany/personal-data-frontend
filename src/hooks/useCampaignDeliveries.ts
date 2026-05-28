import { fetchCampaignDeliveries } from "@/lib/campaignDelivery.api";
import { APIResponse } from "@/types/api.types";
import {
  CampaignDeliveriesQuery,
  CampaignDelivery,
  CampaignDeliveryStatus,
} from "@/types/campaignDelivery.types";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { useCallback, useEffect, useState } from "react";

interface Params extends Omit<CampaignDeliveriesQuery, "companyId"> {
  companyId: string | undefined;
  enabled?: boolean;
}

export function useCampaignDeliveries(params: Params) {
  const {
    companyId,
    campaignId,
    status,
    page = 1,
    pageSize = 20,
    from,
    to,
    enabled = true,
  } = params;

  const [data, setData] = useState<CampaignDelivery[] | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    const res = await fetchCampaignDeliveries({
      companyId,
      campaignId,
      status,
      page,
      pageSize,
      from,
      to,
    });

    setLoading(false);

    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar entregas");
      return;
    }

    setData(Array.isArray(res.data) ? res.data : []);
    setMeta(res.meta ?? null);
  }, [companyId, campaignId, status, page, pageSize, from, to]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, meta, loading, error, refresh };
}

export type { CampaignDeliveryStatus };
