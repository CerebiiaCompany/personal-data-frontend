import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchComplianceDashboard } from "@/lib/compliance.api";
import { ComplianceDashboard } from "@/types/compliance.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  enabled?: boolean;
}

export function useComplianceDashboard({ companyId, enabled = true }: Params) {
  const [data, setData] = useState<ComplianceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const res = await fetchComplianceDashboard(companyId);
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar el dashboard de cumplimiento");
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
