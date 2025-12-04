import { fetchCompanyCreditsCurrentMonth } from "@/lib/company.api";
import { CompanyCreditsCurrentMonth } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export function useCompanyCredits() {
  const [data, setData] = useState<CompanyCreditsCurrentMonth | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const fetchedData = await fetchCompanyCreditsCurrentMonth();

    if (fetchedData.error) {
      const parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data ?? null);
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

