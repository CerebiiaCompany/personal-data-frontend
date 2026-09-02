"use client";

import { fetchWizardPolicySync } from "@/lib/wizard.api";
import { WizardPolicySyncBannerStatus } from "@/types/wizard.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId?: string;
  enabled?: boolean;
}

export function useWizardPolicySync(params: Params) {
  const { companyId, enabled = true } = params;
  const [data, setData] = useState<WizardPolicySyncBannerStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled || !companyId) return;
    setLoading(true);
    const res = await fetchWizardPolicySync(companyId);
    setData(res.data ?? null);
    setLoading(false);
  }, [companyId, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    pending: Boolean(data?.pending),
    refresh,
  };
}
