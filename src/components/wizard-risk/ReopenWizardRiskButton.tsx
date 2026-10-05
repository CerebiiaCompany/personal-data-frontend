"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useSessionStore } from "@/store/useSessionStore";
import { useWizardRiskStatus } from "@/hooks/useWizardRiskStatus";
import { createOrResumeWizardSession, reopenWizardSession } from "@/lib/wizardSession.api";

interface Props {
  className?: string;
  hierarchy?: "primary" | "secondary" | "tertiary";
}

/**
 * Item N-15 — reemplaza a OpenSetupWizardButton (wizard de configuración
 * WIZ-01, ya no es el flujo real de la empresa desde el swap a
 * wizard-risk) en el Perfil de Empresa. Reabre el diagnóstico ya activado
 * (COMPLETED -> EDITING) para que el admin corrija Bloques 1 a 4 y
 * actualice sus RATs — el Bloque 5/DPO no se reabre.
 *
 * Solo tiene sentido mostrarlo cuando ya existe un diagnóstico activado
 * (COMPLETED) o una edición a medio camino (EDITING, ej. otra pestaña):
 * mientras el wizard-risk está IN_PROGRESS o no existe, el redirect de
 * onboarding (SetupWizardProvider) ya lleva a /wizard/bienvenida solo.
 */
export default function ReopenWizardRiskButton({ className, hierarchy = "primary" }: Props) {
  const router = useRouter();
  const role = useSessionStore((store) => store.user?.role);
  const companyId = useActiveCompanyId();
  const { status, loading } = useWizardRiskStatus(companyId);
  const [isOpening, setIsOpening] = useState(false);

  if (role !== "COMPANY_ADMIN") return null;
  if (loading || !companyId) return null;
  if (status !== "COMPLETED" && status !== "EDITING") return null;

  async function handleClick() {
    if (!companyId) return;
    setIsOpening(true);

    if (status === "COMPLETED") {
      const session = await createOrResumeWizardSession(companyId);
      if (session.data?.sessionId) {
        await reopenWizardSession(companyId, session.data.sessionId);
      }
      // Si reopen falló (carrera con otra pestaña, etc.), /wizard/bienvenida
      // igual resuelve un estado consistente contra lo que quedó en el
      // backend — no hace falta bloquear la navegación por el resultado acá.
    }

    router.push("/wizard/bienvenida");
  }

  return (
    <Button
      type="button"
      hierarchy={hierarchy}
      className={className}
      startContent={<Icon icon="tabler:refresh" className="text-lg" />}
      onClick={handleClick}
      loading={isOpening}
    >
      Actualizar diagnóstico y tratamientos
    </Button>
  );
}
