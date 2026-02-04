import { fetchCollectFormClasifications } from "@/lib/collectForm.api";
import { QueryParams } from "@/types/api.types";
import { CollectFormClasification } from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCollectFormClasifications(queryParams);

    if (fetchedData.error) {
      let parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      
      // Solo mostrar error si NO es 403 (sin permisos)
      if (fetchedData.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
  }

  useEffect(() => {
    // No hacer fetch si está deshabilitado o no hay companyId
    if (!enabled || !queryParams.companyId) return;

    fetch();
  }, [enabled, queryParams.companyId, queryParams.search, queryParams.startDate, queryParams.endDate]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
