"use client";

import { useEffect } from "react";
import { useSetupWizardOptional } from "@/components/wizard/SetupWizardContext";

/**
 * Batch 14 (swap) — archivo del asistente de configuración WIZ-01 (5 fases:
 * empresa, representante legal, DPO, ARCO, resumen). Dejó de auto-abrirse
 * como onboarding obligatorio (ver SetupWizardContext.tsx) — el wizard de
 * diagnóstico de riesgo en /wizard/bienvenida ocupa ese lugar ahora. Este
 * asistente sigue existiendo tal cual (no cubre exactamente lo mismo: RUT/
 * dirección de la empresa, representante legal y contactos ARCO no los
 * pregunta el wizard nuevo) y queda accesible acá para quien lo necesite.
 */
export default function WizardLegacyPage() {
  const wizard = useSetupWizardOptional();

  useEffect(() => {
    if (wizard?.canOpen) wizard.openWizard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard?.canOpen]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[700px] flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-lg font-semibold text-primary-900">Asistente de configuración (archivado)</h1>
      <p className="text-sm text-stone-500">
        {wizard?.canOpen
          ? "Abriendo el asistente..."
          : "Este asistente solo está disponible para el administrador de la empresa."}
      </p>
    </div>
  );
}
