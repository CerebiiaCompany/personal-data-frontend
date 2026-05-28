import { fetchArcoSummary } from "@/lib/arcoAdmin.api";
import { ArcoSummary } from "@/types/arco.admin.types";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { useCallback, useEffect, useState } from "react";

export function useCompanyArcoSummary(
  companyId: string | undefined,
  enabled = true
) {
  const [data, setData] = useState<ArcoSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const res = await fetchArcoSummary(companyId);
    setLoading(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      setError(res.error.message ?? "Error al cargar resumen");
      return;
    }
    setData(res.data ?? null);
  }, [companyId]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, loading, error, refresh };
}
