import { fetchArcoRequestDetail } from "@/lib/arcoAdmin.api";
import { ArcoAdminRequestDetail } from "@/types/arco.admin.types";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { useCallback, useEffect, useState } from "react";

export function useCompanyArcoRequestDetail(
  companyId: string | undefined,
  requestId: string | undefined,
  enabled = true
) {
  const [data, setData] = useState<ArcoAdminRequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId || !requestId) return;
    setLoading(true);
    setError(null);
    const res = await fetchArcoRequestDetail(companyId, requestId);
    setLoading(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      setError(res.error.message ?? "Error al cargar solicitud");
      return;
    }
    setData(res.data ?? null);
  }, [companyId, requestId]);

  useEffect(() => {
    if (!enabled || !companyId || !requestId) return;
    refresh();
  }, [enabled, companyId, requestId, refresh]);

  return { data, loading, error, refresh };
}
