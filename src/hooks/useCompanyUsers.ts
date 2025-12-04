import { fetchCompanyUsers } from "@/lib/user.api";
import { APIResponse, QueryParams } from "@/types/api.types";
import { SessionUser } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function useCompanyUsers<T = SessionUser[]>(params: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
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
    
    const fetchedData = await fetchCompanyUsers(currentParams);

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
    setMeta(fetchedData.meta || null);
  }, []);

  useEffect(() => {
    if (!params.companyId) return;

    fetch();
  }, [params.companyId, params.search, params.page, params.pageSize, fetch]);

  return {
    data,
    meta,
    loading,
    error,
    refresh: fetch,
  };
}
