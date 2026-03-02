import { fetchCollectForms } from "@/lib/collectForm.api";
import { fetchCollectFormResponses } from "@/lib/collectFormResponse.api";
import { APIMetadata, QueryParams } from "@/types/api.types";
import {
  CollectForm,
  CollectFormWithResponses,
} from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCollectFormResponses<T = CollectFormWithResponses>(
  params: QueryParams
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<APIMetadata | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCollectFormResponses(params);

    if (fetchedData.error) {
      let parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
    setMeta(fetchedData.meta || null);
  }

  useEffect(() => {
    if (!params.companyId) return;

    fetch();
  }, [params.companyId, params.search, params.page, params.limit]);

  return {
    data,
    loading,
    error,
    meta,
    refresh: fetch,
  };
}
