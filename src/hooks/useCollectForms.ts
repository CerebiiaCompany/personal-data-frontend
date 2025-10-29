import { fetchCollectForms } from "@/lib/collectForm.api";
import { QueryParams } from "@/types/api.types";
import { CollectForm } from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function useCollectForms<T = CollectForm[]>(params: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);

  // Update ref when params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const fetch = useCallback(async () => {
    const currentParams = paramsRef.current;
    if (!currentParams.companyId) return;

    setLoading(true);
    setError(null);
    
    const fetchedData = await fetchCollectForms(currentParams);

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
  }, [params.companyId, params.search, fetch]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
