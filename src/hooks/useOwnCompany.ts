import { fetchOwnCompany } from "@/lib/company.api";
import { Company } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOwnCompany() {
  const [data, setData] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const fetchedData = await fetchOwnCompany();

      if (fetchedData.error) {
        let parsedError = parseApiError(fetchedData.error);
        setError(parsedError);
        setLoading(false);
        toast.error(parsedError);
        return;
      }

      setLoading(false);
      setData(fetchedData.data);
    })();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
