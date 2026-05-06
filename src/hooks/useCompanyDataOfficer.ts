"use client";

import {
  assignCompanyDataOfficer,
  fetchCompanyDataOfficer,
} from "@/lib/company.api";
import { CompanyDataOfficer } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Params {
  companyId?: string;
  enabled?: boolean;
}

export function useCompanyDataOfficer(params: Params) {
  const { companyId, enabled = true } = params;
  const [data, setData] = useState<CompanyDataOfficer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !companyId) return;
    setLoading(true);
    setError(null);

    const res = await fetchCompanyDataOfficer(companyId);
    if (res.error) {
      const parsed = parseApiError(res.error);
      setError(parsed);
      setLoading(false);
      return;
    }

    setData(res.data ?? null);
    setLoading(false);
  }, [companyId, enabled]);

  const assign = useCallback(
    async (userId: string) => {
      if (!companyId) return false;
      setSaving(true);
      const res = await assignCompanyDataOfficer(companyId, userId);
      if (res.error) {
        toast.error(parseApiError(res.error));
        setSaving(false);
        return false;
      }
      setData(res.data ?? null);
      setSaving(false);
      toast.success("Oficial de datos asignado correctamente");
      return true;
    },
    [companyId]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    saving,
    error,
    refresh,
    assign,
  };
}

