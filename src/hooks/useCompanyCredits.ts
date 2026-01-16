import { fetchCompanyCreditsByMonth } from "@/lib/company.api";
import { CompanyCreditsCurrentMonth } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export function useCompanyCredits(params?: { year: number; month: number }) {
  const [data, setData] = useState<CompanyCreditsCurrentMonth | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!params?.year || !params?.month) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);

    const fetchedData = await fetchCompanyCreditsByMonth({
      year: params.year,
      month: params.month,
    });

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data ?? null);
  }, [params?.month, params?.year]);

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

