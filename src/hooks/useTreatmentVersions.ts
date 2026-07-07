import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchTreatmentVersions } from "@/lib/treatment.api";
import { TreatmentVersionEntry } from "@/types/treatment.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  treatmentId: string | undefined;
  enabled?: boolean;
}

export function useTreatmentVersions({
  companyId,
  treatmentId,
  enabled = true,
}: Params) {
  const [data, setData] = useState<TreatmentVersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId || !treatmentId) return;
    setLoading(true);
    setError(null);
    const res = await fetchTreatmentVersions(companyId, treatmentId);
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar el historial");
      return;
    }
    setData(res.data ?? []);
  }, [companyId, treatmentId]);

  useEffect(() => {
    if (!enabled || !companyId || !treatmentId) return;
    refresh();
  }, [enabled, companyId, treatmentId, refresh]);

  return { data, loading, error, refresh };
}
