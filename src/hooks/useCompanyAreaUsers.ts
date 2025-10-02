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

export function useCompanyAreaUsers({ companyId, areaId }: QueryParams) {
  const [data, setData] = useState<CompanyAreaUser[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    if (!areaId) return;

    (async () => {
      setLoading(true);
      const fetchedData = await fetchCompanyAreaUsers({ companyId, areaId });

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
  }, [companyId, areaId]);

  return {
    data,
    loading,
    error,
  };
}
