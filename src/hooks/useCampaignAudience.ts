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
    // Validar que minAge y maxAge sean números válidos (incluyendo 0)
    const minAgeValid = params.minAge !== undefined && params.minAge !== null && !isNaN(Number(params.minAge));
    const maxAgeValid = params.maxAge !== undefined && params.maxAge !== null && !isNaN(Number(params.maxAge));
    const minAgeNum = Number(params.minAge);
    const maxAgeNum = Number(params.maxAge);

    if (
      !params.companyId ||
      !params.sourceForms ||
      !params.gender ||
      !minAgeValid ||
      !maxAgeValid ||
      minAgeNum > maxAgeNum
    ) {
      setData(null);
      return;
    }

    (async () => {
      setLoading(true);
      const fetchedData = await fetchCalcCampaignAudience({
        ...params,
        minAge: minAgeNum,
        maxAge: maxAgeNum,
      });

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
