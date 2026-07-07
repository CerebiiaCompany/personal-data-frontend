import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchPublicHolidays } from "@/lib/publicHoliday.api";
import { PublicHoliday } from "@/types/publicHoliday.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  /** Si se indica, filtra por país (código ISO). */
  countryCode?: string;
  enabled?: boolean;
}

export function usePublicHolidays({ countryCode, enabled = true }: Params = {}) {
  const [data, setData] = useState<PublicHoliday[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchPublicHolidays(countryCode);
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar feriados");
      return;
    }
    setData(res.data ?? []);
  }, [countryCode]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  return { data, loading, error, refresh };
}
