import { fetchTreatments } from "@/lib/treatment.api";
import { useCallback, useEffect, useState } from "react";

interface Result {
  verificationCount: number;
  deactivationCount: number;
  total: number;
  loading: boolean;
  refresh: () => void;
}

/**
 * Item C-04/N-15 — cuenta tratamientos con incertidumbre pendiente para el
 * banner de la lista. pageSize:1 porque solo se necesita meta.totalCount, no
 * las filas; dos llamadas (una por cada estado) en vez de tocar el backend
 * para aceptar un array en `verificationStatus` (el filtro solo admite un
 * valor, igual que status/legalBasis en el mismo endpoint).
 */
export function usePendingVerificationCount(companyId: string | undefined, enabled = true) {
  const [verificationCount, setVerificationCount] = useState(0);
  const [deactivationCount, setDeactivationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!companyId || !enabled) return;
    setLoading(true);
    const [verificationRes, deactivationRes] = await Promise.all([
      fetchTreatments(companyId, { verificationStatus: "PENDING_VERIFICATION", pageSize: 1 }),
      fetchTreatments(companyId, { verificationStatus: "PENDING_DEACTIVATION", pageSize: 1 }),
    ]);
    setLoading(false);
    if (!verificationRes.error) setVerificationCount(verificationRes.meta?.totalCount ?? 0);
    if (!deactivationRes.error) setDeactivationCount(deactivationRes.meta?.totalCount ?? 0);
  }, [companyId, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    verificationCount,
    deactivationCount,
    total: verificationCount + deactivationCount,
    loading,
    refresh,
  } satisfies Result;
}
