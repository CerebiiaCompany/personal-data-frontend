import { fetchCampaigns } from "@/lib/campaign.api";
import { QueryParams } from "@/types/api.types";
import { Campaign } from "@/types/campaign.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCampaigns<T = Campaign[]>({ companyId, id }: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCampaigns({ companyId, id });

    if (fetchedData.error) {
      let parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
  }

  useEffect(() => {
    if (!companyId) return;

    fetch();
  }, [companyId]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
