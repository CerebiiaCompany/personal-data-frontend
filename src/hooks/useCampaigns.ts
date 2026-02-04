import { fetchCampaigns } from "@/lib/campaign.api";
import { QueryParams } from "@/types/api.types";
import { Campaign } from "@/types/campaign.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseCampaignsParams extends QueryParams {
  /**
   * Si es false, no hará el fetch automático
   * Útil para verificar permisos antes de cargar datos
   */
  enabled?: boolean;
}

export function useCampaigns<T = Campaign[]>(params: UseCampaignsParams) {
  const { enabled = true, ...queryParams } = params;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(queryParams);

  useEffect(() => {
    paramsRef.current = queryParams;
  }, [queryParams]);

  const fetch = useCallback(async () => {
    const currentParams = paramsRef.current;
    if (!currentParams.companyId) return;

    setLoading(true);
    setError(null);
    
    const fetchedData = await fetchCampaigns(currentParams);

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      
      // Solo mostrar error si NO es 403 (sin permisos)
      if (fetchedData.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
  }, []);

  useEffect(() => {
    // No hacer fetch si está deshabilitado o no hay companyId
    if (!enabled || !queryParams.companyId) return;

    fetch();
  }, [enabled, queryParams.companyId, queryParams.search, queryParams.startDate, queryParams.endDate, fetch]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
