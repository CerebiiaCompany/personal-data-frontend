import { fetchCollectFormClasifications } from "@/lib/collectForm.api";
import { APIResponse, QueryParams } from "@/types/api.types";
import {
  ClasificationListSummary,
  CollectFormClasification,
} from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function normalizeClasificationItem(
  item: CollectFormClasification & { updated?: string | Date }
): CollectFormClasification {
  const updatedAt = item.updatedAt ?? item.updated ?? item.createdAt;
  return { ...item, updatedAt };
}

interface UseCollectFormClasificationsParams extends QueryParams {
  /**
   * Si es false, no hará el fetch automático
   * Útil para verificar permisos antes de cargar datos
   */
  enabled?: boolean;
}

export function useCollectFormClasifications(params: UseCollectFormClasificationsParams) {
  const { enabled = true, ...queryParams } = params;
  const [data, setData] = useState<CollectFormClasification[] | null>(null);
  const [summary, setSummary] = useState<ClasificationListSummary | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"]>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCollectFormClasifications(queryParams);

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setData(null);
      setSummary(null);
      setMeta(undefined);
      setLoading(false);

      // Solo mostrar error si NO es 403 (sin permisos)
      if (fetchedData.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    const list = Array.isArray(fetchedData.data) ? fetchedData.data : [];
    setData(list.map(normalizeClasificationItem));
    setSummary(fetchedData.summary ?? null);
    setMeta(fetchedData.meta);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    // No hacer fetch si está deshabilitado o no hay companyId
    if (!enabled || !queryParams.companyId) return;

    fetch();
  }, [enabled, queryParams.companyId, queryParams.search, queryParams.startDate, queryParams.endDate]);

  return {
    data,
    summary,
    meta,
    loading,
    error,
    refresh: fetch,
  };
}
