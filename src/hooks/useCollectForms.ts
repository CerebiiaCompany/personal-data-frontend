import { fetchCollectForms } from "@/lib/collectForm.api";
import { QueryParams } from "@/types/api.types";
import { CollectForm } from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCollectForms<T = CollectForm[]>({
  companyId,
  id,
}: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    (async () => {
      setLoading(true);
      const fetchedData = await fetchCollectForms({ companyId, id });

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
  }, [companyId]);

  return {
    data,
    loading,
    error,
  };
}
