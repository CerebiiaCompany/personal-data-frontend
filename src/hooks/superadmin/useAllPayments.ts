import { fetchAllPayments, fetchCompanyPayments } from "@/lib/payment.api";
import { QueryParams } from "@/types/api.types";
import { CompanyPayment } from "@/types/payment.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useAllPayments<T = CompanyPayment[]>(params: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchAllPayments(params);

    if (fetchedData.error) {
      let parsedError = parseApiError(fetchedData.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return;
    }

    setLoading(false);
    setData(fetchedData.data);
  }

  useEffect(() => {
    fetch();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
