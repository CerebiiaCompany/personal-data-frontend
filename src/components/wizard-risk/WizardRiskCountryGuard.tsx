"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsWizardRiskEnabled } from "@/hooks/useIsWizardRiskEnabled";
import { useSessionStore } from "@/store/useSessionStore";

/**
 * Bloquea todo /wizard/** para empresas no chilenas (p. ej. Colombia), aun
 * si se entra escribiendo la URL a mano: no se monta el WizardProvider (que
 * crea/reanuda la sesión) y se redirige al panel. El backend también lo
 * rechaza con 403 (requireChileanCompany).
 */
export default function WizardRiskCountryGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sessionLoading = useSessionStore((store) => store.loading);
  const { enabled, known } = useIsWizardRiskEnabled();

  const blocked = known && !enabled;

  useEffect(() => {
    if (blocked) router.replace("/admin");
  }, [blocked, router]);

  // Mientras no se sabe el país (sesión cargando), no mostrar nada todavía.
  if (blocked || (!known && sessionLoading)) return null;

  return <>{children}</>;
}
