"use client";

import { useCallback, useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { fetchInitialSetupStatus, InitialSetupStatus } from "@/lib/initialSetup.api";
import InitialSetupForm from "./InitialSetupForm";

interface Props {
  children: React.ReactNode;
}

/**
 * OBS-03b (ONB-01) — a diferencia de OnboardingChecklistGate (widget
 * flotante, no bloqueante), este gate SÍ reemplaza `children` por un
 * formulario a pantalla completa mientras
 * Company.initialSetupCompletedAt sea NULL. Hoy eso solo ocurre en empresas
 * legacy/migradas con datos incompletos (ver migración
 * 20260821201822_add_company_initial_setup_completed_at) — el resto ya quedó
 * backfilleado.
 *
 * Mismo criterio de rol que OnboardingChecklistGate: compara
 * `role === "COMPANY_ADMIN"` literal (no usePermissionCheck().isCompanyAdmin,
 * que también es true para SUPERADMIN) porque un SUPERADMIN nunca debe
 * quedar bloqueado por el setup inicial de una empresa ajena.
 */
export default function InitialSetupGate({ children }: Props) {
  const role = useSessionStore((store) => store.user?.role);

  if (role !== "COMPANY_ADMIN") return <>{children}</>;

  return <CompanyAdminInitialSetupGate>{children}</CompanyAdminInitialSetupGate>;
}

function CompanyAdminInitialSetupGate({ children }: Props) {
  const companyId = useActiveCompanyId();
  const [status, setStatus] = useState<InitialSetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchInitialSetupStatus(companyId);
    if (res.data) {
      setStatus(res.data);
      setErrored(false);
    } else if (res.error) {
      console.warn("[initial-setup] Error al cargar status:", res.error);
      setErrored(true);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Fail-open: si el fetch falla o todavía no hay companyId resuelto, no se
  // bloquea el acceso — mejor dejar pasar que dejar a un admin legítimo sin
  // poder entrar por un error de red transitorio.
  if (loading || errored || !status || status.completed) {
    return <>{children}</>;
  }

  return (
    <InitialSetupForm
      companyId={companyId!}
      initialCompany={status.company}
      onCompleted={() => setStatus((prev) => (prev ? { ...prev, completed: true } : prev))}
    />
  );
}
