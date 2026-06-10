import { fetchArcoAudit } from "@/lib/arcoAdmin.api";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { APIResponse } from "@/types/api.types";
import { ArcoCompanyAuditEntry } from "@/types/arco.admin.types";
import { ArcoRequestType } from "@/types/arco.types";
import {
  normalizeArcoCompanyAuditEntry,
} from "@/utils/arcoAdmin.utils";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  page?: number;
  pageSize?: number;
  eventType?: string;
  requestType?: ArcoRequestType;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
}

export function useCompanyArcoAudit(params: Params) {
  const {
    companyId,
    page = 1,
    pageSize = 20,
    eventType,
    requestType,
    dateFrom,
    dateTo,
    enabled = true,
  } = params;

  const [data, setData] = useState<ArcoCompanyAuditEntry[] | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const res = await fetchArcoAudit({
      companyId,
      page,
      pageSize,
      eventType,
      requestType,
      dateFrom,
      dateTo,
    });
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar auditoría ARCO");
      return;
    }
    setData(
      (res.data ?? []).map((item) =>
        normalizeArcoCompanyAuditEntry(item as unknown as Record<string, unknown>)
      )
    );
    setMeta(res.meta ?? null);
  }, [companyId, page, pageSize, eventType, requestType, dateFrom, dateTo]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, meta, loading, error, refresh };
}
