import { fetchCalcCampaignAudience } from "@/lib/campaign.api";
import { QueryParams } from "@/types/api.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCampaignAudience(params: QueryParams) {
  const [data, setData] = useState<{ count: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !params.companyId ||
      !params.sourceForms ||
      !params.gender ||
      !params.minAge ||
      !params.maxAge ||
      params.minAge > params.maxAge
    ) {
      setData(null);
      return;
    }

    (async () => {
      setLoading(true);
      const fetchedData = await fetchCalcCampaignAudience(params);

      if (fetchedData.error) {
        let parsedError = parseApiError(fetchedData.error);
        setError(parsedError);
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(false);
      setData(fetchedData.data);
    })();
  }, [
    params.sourceForms,
    params.gender,
    params.minAge,
    params.maxAge,
    params.companyId,
  ]);

  return {
    data,
    loading,
    error,
  };
}
