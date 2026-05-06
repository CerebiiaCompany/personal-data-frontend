import {
  fetchAcceptedPoliciesByMonth,
  fetchCompanyCollectFormsCount,
} from "@/lib/collectForm.api";
import { parseApiError } from "@/utils/parseApiError";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useCompanyCollectFormsCount(params?: { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  const [data, setData] = useState<{ totalForms: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    const fetchedData = await fetchCompanyCollectFormsCount();

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);

      if (fetchedData.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    setData(fetchedData.data ?? null);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}

export function useAcceptedPoliciesByMonth(params: {
  year: number;
  month: number;
  enabled?: boolean;
}) {
  const enabled = params.enabled ?? true;
  const [data, setData] = useState<{
    acceptedCount: number;
    month: number;
    year: number;
    period: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled || !params.year || !params.month) return;

    setLoading(true);
    setError(null);

    const fetchedData = await fetchAcceptedPoliciesByMonth({
      year: params.year,
      month: params.month,
    });

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);

      if (fetchedData.error.code !== "auth/unauthorized") {
        toast.error(parsedError);
      }
      return;
    }

    setData(fetchedData.data ?? null);
    setLoading(false);
  }, [enabled, params.year, params.month]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
