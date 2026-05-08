import { fetchCompanyProfile } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";

export function useCompanyProfile(companyId: string | undefined) {
  const [data, setData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchCompanyProfile(companyId);
    setLoading(false);

    if (res.error) {
      setError(parseApiError(res.error));
      return;
    }

    setData(res.data ?? null);
    setError(null);
  }

  useEffect(() => {
    refresh();
  }, [companyId]);

  return { data, loading, error, refresh };
}
