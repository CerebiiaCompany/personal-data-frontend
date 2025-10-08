import { fetchCollectFormClasifications } from "@/lib/collectForm.api";
import { QueryParams } from "@/types/api.types";
import { CollectFormClasification } from "@/types/collectForm.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCollectFormClasifications(params: QueryParams) {
  const [data, setData] = useState<CollectFormClasification[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCollectFormClasifications(params);

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
    if (!params.companyId) return;

    fetch();
  }, [params.companyId]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
