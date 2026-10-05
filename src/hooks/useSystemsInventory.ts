import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchSystemsInventory } from "@/lib/systemInventory.api";
import { APIResponse } from "@/types/api.types";
import {
  SystemInventory,
  SystemInventoryDeployment,
  SystemInventoryDpaStatus,
  SystemInventoryRiskLevel,
} from "@/types/systemInventory.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  page?: number;
  pageSize?: number;
  category?: string;
  country?: string;
  deployment?: SystemInventoryDeployment;
  riskLevel?: SystemInventoryRiskLevel;
  dpaStatus?: SystemInventoryDpaStatus;
  hasExternalAccess?: boolean;
  search?: string;
  /** Si es false, no dispara el fetch (útil para gate por permisos). */
  enabled?: boolean;
}

export function useSystemsInventory({
  companyId,
  page = 1,
  pageSize = 10,
  category,
  country,
  deployment,
  riskLevel,
  dpaStatus,
  hasExternalAccess,
  search,
  enabled = true,
}: Params) {
  const [data, setData] = useState<SystemInventory[] | null>(null);
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const res = await fetchSystemsInventory(companyId, {
      page,
      pageSize,
      category,
      country,
      deployment,
      riskLevel,
      dpaStatus,
      hasExternalAccess,
      search,
    });
    setLoading(false);
    if (res.error) {
      if (res.error.code !== "auth/unauthorized") {
        showApiErrorToast(res.error, res.error.status);
      }
      setError(res.error.message ?? "Error al cargar el inventario de sistemas");
      return;
    }
    setData(res.data ?? []);
    setMeta(res.meta ?? null);
  }, [companyId, page, pageSize, category, country, deployment, riskLevel, dpaStatus, hasExternalAccess, search]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, meta, loading, error, refresh };
}
