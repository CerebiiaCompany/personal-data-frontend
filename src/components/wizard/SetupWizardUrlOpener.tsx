"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSetupWizardOptional } from "@/components/wizard/SetupWizardContext";

/** Abre el asistente si la URL incluye ?asistente=1 */
export default function SetupWizardUrlOpener() {
  const searchParams = useSearchParams();
  const wizard = useSetupWizardOptional();

  useEffect(() => {
    if (searchParams.get("asistente") === "1" && wizard?.canOpen) {
      wizard.openWizard();
    }
  }, [searchParams, wizard]);

  return null;
}
