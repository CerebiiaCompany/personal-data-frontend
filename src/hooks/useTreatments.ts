import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchTreatments } from "@/lib/treatment.api";
import { APIResponse } from "@/types/api.types";
import { LegalBasis, Treatment, TreatmentStatus } from "@/types/treatment.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  page?: number;
  pageSize?: number;
  /** Filtros del listado (item B7). */
  status?: TreatmentStatus;
  legalBasis?: LegalBasis;
  containsSensitiveData?: boolean;
  search?: string;
  /** Si es false, no dispara el fetch (útil para gate por permisos). */
  enabled?: boolean;
}

export function useTreatments({
  companyId,
  page = 1,
  pageSize = 10,
  status,
  legalBasis,
  containsSensitiveData,
  search,
  enabled = true,
}: Params) {
  const [data, setData] = useState<Treatment[] | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const res = await fetchTreatments(companyId, {
      page,
      pageSize,
      status,
      legalBasis,
      containsSensitiveData,
      search,
    });
    setLoading(false);
    if (res.error) {
      // 403 sin permisos no debe spamear toasts (mismo criterio que ARCO/Campañas).
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar tratamientos");
      return;
    }
    setData(res.data ?? []);
    setMeta(res.meta ?? null);
  }, [companyId, page, pageSize, status, legalBasis, containsSensitiveData, search]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, meta, loading, error, refresh };
}
