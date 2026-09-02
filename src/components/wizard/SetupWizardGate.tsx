"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { SetupWizardProvider } from "./SetupWizardContext";

interface Props {
  children: React.ReactNode;
}

/**
 * El asistente WIZ-01 solo aplica al administrador de la empresa.
 * Usuarios USER (incl. DPO designado), SUPERADMIN en contexto ajeno, etc.
 * no deben ver ni bloquearse por el wizard.
 */
export default function SetupWizardGate({ children }: Props) {
  const role = useSessionStore((store) => store.user?.role);

  if (role !== "COMPANY_ADMIN") {
    return <>{children}</>;
  }

  return <SetupWizardProvider>{children}</SetupWizardProvider>;
}
