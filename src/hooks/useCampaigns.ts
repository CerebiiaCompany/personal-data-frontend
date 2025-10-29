import { fetchCampaigns } from "@/lib/campaign.api";
import { QueryParams } from "@/types/api.types";
import { Campaign } from "@/types/campaign.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function useCampaigns<T = Campaign[]>(params: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

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
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
  }, []);

  useEffect(() => {
    if (!params.companyId) return;

    fetch();
  }, [params.companyId, params.search, params.startDate, params.endDate, fetch]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
