"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import {
  dismissOnboarding,
  fetchOnboardingStatus,
  OnboardingStatus,
} from "@/lib/onboarding.api";

/**
 * Estado del checklist de onboarding. No usa un store zustand global: solo
 * lo consume el widget flotante (montado una vez en el layout), así que un
 * hook local con fetch simple alcanza — un store agregaría indirección sin
 * beneficio real (a diferencia de useOwnCompanyStore, compartido entre
 * muchas pantallas).
 *
 * Se refresca al montar, al cambiar de ruta (el admin puede completar un
 * paso en otra pantalla y volver) y al recuperar el foco de la pestaña. No
 * hay SWR/React Query en el repo; agregarlo solo para este widget sería
 * desproporcionado.
 */
export function useOnboardingChecklist() {
  const companyId = useActiveCompanyId();
  const pathname = usePathname();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!companyId) {
      console.warn("[onboarding] Sin companyId: no se puede cargar el checklist");
      return;
    }
    setLoading(true);
    const res = await fetchOnboardingStatus(companyId);
    if (res.data) {
      setStatus(res.data);
    } else if (res.error) {
      console.warn("[onboarding] Error al cargar status:", res.error);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    function onFocus() {
      refresh();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  // Poll suave mientras haya pasos pendientes para que el checklist
  // refleje avances en tiempo casi real (p. ej. tras asignar oficial).
  useEffect(() => {
    if (!status) return;
    if (status.completedCount >= status.totalCount) return;

    const id = window.setInterval(() => {
      refresh();
    }, 4000);

    return () => window.clearInterval(id);
  }, [status, refresh]);

  const dismiss = useCallback(async () => {
    if (!companyId) return;
    await dismissOnboarding(companyId);
    setStatus((prev) => (prev ? { ...prev, dismissed: true } : prev));
  }, [companyId]);

  return { status, loading, refresh, dismiss };
}
