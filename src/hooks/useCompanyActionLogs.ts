import { fetchCompanyActionLogs } from "@/lib/userActionLogs.api";
import { APIResponse, QueryParams } from "@/types/api.types";
import { UserActionLog } from "@/types/userActionLogs.types";
import { parseApiError } from "@/utils/parseApiError";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseCompanyActionLogsParams extends QueryParams {
  companyId: string | undefined;
  enabled?: boolean;
}

export function useCompanyActionLogs(params: UseCompanyActionLogsParams) {
  const { enabled = true, companyId, ...queryParams } = params;
  const [data, setData] = useState<UserActionLog[] | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);
    const result = await fetchCompanyActionLogs({
      companyId,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      type: queryParams.type,
      targetModel: queryParams.targetModel,
      searchUser: queryParams.searchUser,
    });

    if (result.error) {
      const parsedError = parseApiError(result.error);
      setError(parsedError);
      setLoading(false);
      if (result.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    setData(result.data ?? null);
    setMeta(result.meta ?? null);
    setLoading(false);
  }, [
    companyId,
    queryParams.page,
    queryParams.pageSize,
    queryParams.startDate,
    queryParams.endDate,
    queryParams.type,
    queryParams.targetModel,
    queryParams.searchUser,
  ]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    fetch();
  }, [enabled, companyId, fetch]);

  return {
    data,
    meta,
    loading,
    error,
    refresh: fetch,
  };
}
