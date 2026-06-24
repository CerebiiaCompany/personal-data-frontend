import { fetchCalcCampaignAudience } from "@/lib/campaign.api";
import { QueryParams } from "@/types/api.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";

export function useCampaignAudience(params: QueryParams) {
  const [data, setData] = useState<{ count: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const responseIds = (params.responseIds || "").trim();
  const isManualSelection = Boolean(responseIds);

  useEffect(() => {
    if (!params.companyId) {
      setData(null);
      setLoading(false);
      return;
    }

    if (isManualSelection) {
      (async () => {
        setLoading(true);
        setError(null);
        const fetchedData = await fetchCalcCampaignAudience({
          companyId: params.companyId,
          responseIds,
        });

        if (fetchedData.error) {
          setError(parseApiError(fetchedData.error));
          setData(null);
          setLoading(false);
          return;
        }

        setLoading(false);
        setData(fetchedData.data);
      })();
      return;
    }

    const minAgeValid =
      params.minAge !== undefined &&
      params.minAge !== null &&
      !Number.isNaN(Number(params.minAge));
    const maxAgeValid =
      params.maxAge !== undefined &&
      params.maxAge !== null &&
      !Number.isNaN(Number(params.maxAge));
    const minAgeNum = Number(params.minAge);
    const maxAgeNum = Number(params.maxAge);

    if (
      !params.sourceForms ||
      !params.gender ||
      !minAgeValid ||
      !maxAgeValid ||
      minAgeNum > maxAgeNum
    ) {
      setData(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      const fetchedData = await fetchCalcCampaignAudience({
        ...params,
        minAge: minAgeNum,
        maxAge: maxAgeNum,
      });

      if (fetchedData.error) {
        setError(parseApiError(fetchedData.error));
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
    responseIds,
    isManualSelection,
  ]);

  return {
    data,
    loading,
    error,
  };
}
