import { fetchCollectForms } from "@/lib/collectForm.api";
import { fetchCompanyAreaUsers } from "@/lib/companyArea.api";
import { fetchCompanyUsers } from "@/lib/user.api";
import { QueryParams } from "@/types/api.types";
import { CollectForm } from "@/types/collectForm.types";
import { CompanyAreaUser } from "@/types/companyArea.types";
import { SessionUser } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCompanyAreaUsers(params: QueryParams) {
  const [data, setData] = useState<CompanyAreaUser[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.companyId) return;
    if (!params.areaId) return;

    (async () => {
      setLoading(true);
      const fetchedData = await fetchCompanyAreaUsers(params);

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
  }, [params.companyId, params.areaId]);

  return {
    data,
    loading,
    error,
  };
}
