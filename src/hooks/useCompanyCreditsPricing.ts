import { fetchCompanyCreditsPricing } from "@/lib/company.api";
import { CompanyCreditsPricing } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useCompanyCreditsPricing() {
  const [data, setData] = useState<CompanyCreditsPricing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetchCompanyCreditsPricing();

    if (res.error) {
      // En pantallas públicas no queremos forzar logout/redirect ni spamear errores de auth.
      if (
        res.error.code === "auth/unauthenticated" ||
        res.error.code === "auth/unauthorized"
      ) {
        setLoading(false);
        setData(null);
        return;
      }

      const parsed = parseApiError(res.error);
      setError(parsed);
      setLoading(false);
      setData(null);
      toast.error(parsed);
      return;
    }

    setLoading(false);
    setData(res.data ?? null);
  }, []);

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

