import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchTreatment } from "@/lib/treatment.api";
import { Treatment } from "@/types/treatment.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  treatmentId: string | undefined;
  enabled?: boolean;
}

export function useTreatment({
  companyId,
  treatmentId,
  enabled = true,
}: Params) {
  const [data, setData] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId || !treatmentId) return;
    setLoading(true);
    setError(null);
    const res = await fetchTreatment(companyId, treatmentId);
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar el tratamiento");
      return;
    }
    setData(res.data ?? null);
  }, [companyId, treatmentId]);

  useEffect(() => {
    if (!enabled || !companyId || !treatmentId) return;
    refresh();
  }, [enabled, companyId, treatmentId, refresh]);

  return { data, loading, error, refresh };
}
