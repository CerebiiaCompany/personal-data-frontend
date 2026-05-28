import { fetchArcoRequests } from "@/lib/arcoAdmin.api";
import { APIResponse } from "@/types/api.types";
import { ArcoAdminRequestListItem } from "@/types/arco.admin.types";
import { ArcoRequestStatus, ArcoRequestType } from "@/types/arco.types";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  page?: number;
  pageSize?: number;
  status?: ArcoRequestStatus;
  requestType?: ArcoRequestType;
  enabled?: boolean;
}

export function useCompanyArcoRequests(params: Params) {
  const {
    companyId,
    page = 1,
    pageSize = 20,
    status,
    requestType,
    enabled = true,
  } = params;

  const [data, setData] = useState<ArcoAdminRequestListItem[] | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const res = await fetchArcoRequests({
      companyId,
      page,
      pageSize,
      status,
      requestType,
    });
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar solicitudes");
      return;
    }
    setData(res.data ?? []);
    setMeta(res.meta ?? null);
  }, [companyId, page, pageSize, status, requestType]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, meta, loading, error, refresh };
}
