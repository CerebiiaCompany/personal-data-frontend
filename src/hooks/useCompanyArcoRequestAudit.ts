import { fetchArcoRequestAudit } from "@/lib/arcoAdmin.api";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { ArcoAuditEvent } from "@/types/arco.admin.types";
import { normalizeArcoAuditEvent } from "@/utils/arcoAdmin.utils";
import { useCallback, useEffect, useState } from "react";

export function useCompanyArcoRequestAudit(
  companyId: string | undefined,
  requestId: string | undefined,
  enabled = true
) {
  const [events, setEvents] = useState<ArcoAuditEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId || !requestId) return;
    setLoading(true);
    setError(null);
    const res = await fetchArcoRequestAudit(companyId, requestId);
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar trazabilidad");
      return;
    }
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : (raw?.events ?? []);
    setEvents(
      list.map((item) =>
        normalizeArcoAuditEvent(item as unknown as Record<string, unknown>)
      )
    );
  }, [companyId, requestId]);

  useEffect(() => {
    if (!enabled || !companyId || !requestId) return;
    refresh();
  }, [enabled, companyId, requestId, refresh]);

  return { events, loading, error, refresh };
}
