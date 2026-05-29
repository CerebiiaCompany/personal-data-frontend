import { fetchCollectFormResponses } from "@/lib/collectFormResponse.api";
import { APIResponse, QueryParams } from "@/types/api.types";
import { CollectFormWithResponses } from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useCollectFormResponses<T = CollectFormWithResponses>(
  params: QueryParams
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [summary, setSummary] = useState<APIResponse["summary"] | null>(null);

  // Mantenemos los parámetros en un ref para que `fetch` sea estable
  // y siempre lea los valores más recientes (paginación, filtros, etc.).
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const fetch = useCallback(async () => {
    const currentParams = paramsRef.current;
    if (!currentParams.companyId || !currentParams.id) return;

    setLoading(true);
    setError(null);

    const fetchedData = await fetchCollectFormResponses(currentParams);

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      if (fetchedData.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
    setMeta(fetchedData.meta || null);
    setSummary(fetchedData.summary || null);
  }, []);

  useEffect(() => {
    if (!params.companyId || !params.id) return;

    fetch();
    // Todos los filtros documentados del endpoint de respuestas.
  }, [
    params.companyId,
    params.id,
    params.search,
    params.page,
    params.pageSize,
    params.consentStatus,
    params.startDate,
    params.endDate,
    fetch,
  ]);

  return {
    data,
    loading,
    error,
    meta,
    summary,
    refresh: fetch,
  };
}
