import { fetchCampaigns } from "@/lib/campaign.api";
import { fetchCompanyUsersActionLogs } from "@/lib/userActionLogs.api";
import { QueryParams } from "@/types/api.types";
import { Campaign } from "@/types/campaign.types";
import { UserActionLog } from "@/types/userActionLogs.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UseCompanyActionLogsParams extends QueryParams {
  /**
   * Si es false, no hará el fetch automático
   */
  enabled?: boolean;
}

export function useCompanyActionLogs<T = UserActionLog[]>(params: UseCompanyActionLogsParams) {
  const { enabled = true, ...queryParams } = params;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCompanyUsersActionLogs(queryParams);

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
