"use client";

import Button from "@/components/base/Button";
import { useSetupWizardOptional } from "@/components/wizard/SetupWizardContext";
import { Icon } from "@iconify/react";

interface Props {
  className?: string;
  hierarchy?: "primary" | "secondary" | "tertiary";
  label?: string;
}

/**
 * Abre el asistente de configuración WIZ-01 en modo voluntario.
 * Solo visible para COMPANY_ADMIN cuando el provider está montado.
 */
export default function OpenSetupWizardButton({
  className,
  hierarchy = "secondary",
  label,
}: Props) {
  const wizard = useSetupWizardOptional();

  if (!wizard?.canOpen) return null;

  const resolvedLabel =
    label ??
    (wizard.phase5Pending
      ? "Revisar cambios del RAT"
      : !wizard.phase1Completed
        ? "Asistente de configuración"
        : !wizard.phase2Completed
          ? "Continuar registro de tratamiento"
          : !wizard.phase3Completed
            ? "Generar política de privacidad"
            : !wizard.phase4Completed
              ? "Configurar recolección"
              : "Reconfigurar empresa");

  return (
    <Button
      type="button"
      hierarchy={hierarchy}
      className={className}
      startContent={<Icon icon="tabler:wand" className="text-lg" />}
      onClick={wizard.openWizard}
    >
      {resolvedLabel}
    </Button>
  );
}
