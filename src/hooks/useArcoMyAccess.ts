import { fetchArcoMyAccess } from "@/lib/arcoAdmin.api";
import { ArcoMyAccess } from "@/types/arco.admin.types";
import { useSessionStore } from "@/store/useSessionStore";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Params {
  companyId: string | undefined;
}

export function useArcoMyAccess({ companyId }: Params) {
  const user = useSessionStore((s) => s.user);
  const [access, setAccess] = useState<ArcoMyAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = useMemo(
    () => user?.role === "COMPANY_ADMIN" || user?.role === "SUPERADMIN",
    [user?.role]
  );

  const refresh = useCallback(async () => {
    if (!companyId) {
      setAccess(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchArcoMyAccess(companyId);
    setLoading(false);
    if (res.data) {
      setAccess(res.data);
      return;
    }
    if (isPlatformAdmin) {
      setAccess({
        canView: true,
        canRespond: true,
        isOfficer: false,
        isAdmin: true,
      });
      return;
    }
    setAccess({
      canView: false,
      canRespond: false,
      isOfficer: false,
      isAdmin: false,
    });
  }, [companyId, isPlatformAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canView = access?.canView ?? isPlatformAdmin;
  const canRespond = access?.canRespond ?? isPlatformAdmin;

  return {
    access,
    loading,
    canView,
    canRespond,
    isOfficer: access?.isOfficer ?? false,
    isAdmin: access?.isAdmin ?? isPlatformAdmin,
    refresh,
  };
}
