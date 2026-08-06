import { fetchCompanies } from "@/lib/company.api";
import { APIResponse, QueryParams } from "@/types/api.types";
import { Company } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type CompaniesMeta = NonNullable<APIResponse["meta"]>;

export function useCompanies<T = Company[]>(params: QueryParams) {
  const { companyId, search, page, pageSize } = params;

  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<CompaniesMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const fetchedData = await fetchCompanies({
      companyId,
      search,
      page,
      pageSize,
    });

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setData(fetchedData.data);
    setMeta(fetchedData.meta ?? null);
    setLoading(false);
  }, [companyId, search, page, pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    meta,
    refresh: fetch,
  };
}
