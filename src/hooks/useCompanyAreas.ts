import { fetchCollectForms } from "@/lib/collectForm.api";
import { fetchCompanyAreas } from "@/lib/companyArea.api";
import { fetchCompanyUsers } from "@/lib/user.api";
import { QueryParams } from "@/types/api.types";
import { CollectForm } from "@/types/collectForm.types";
import { CompanyArea } from "@/types/companyArea.types";
import { SessionUser } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCompanyAreas<T = CompanyArea[]>({
  companyId,
  id,
}: QueryParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const fetchedData = await fetchCompanyAreas({ companyId, id });

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
    if (!companyId) return;

    fetch();
  }, [companyId]);

  return {
    data,
    loading,
    error,
    refresh: fetch,
  };
}
