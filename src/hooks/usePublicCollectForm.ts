import { fetchPublicCollectForm } from "@/lib/collectForm.api";
import { QueryParams } from "@/types/api.types";
import { CollectForm } from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePublicCollectForm(params: QueryParams) {
  const [data, setData] = useState<CollectForm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      setLoading(true);
      const fetchedData = await fetchPublicCollectForm(params);

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
  }, [params.id]);

  return {
    data,
    loading,
    error,
  };
}
