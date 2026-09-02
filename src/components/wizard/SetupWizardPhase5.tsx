"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import WizardQuestionCard from "@/components/wizard/WizardQuestionCard";
import WizardModalShell, {
  WizardModalBody,
  WizardModalHeader,
} from "@/components/wizard/WizardModalShell";
import { acknowledgeWizardPolicySync } from "@/lib/wizard.api";
import { WizardPolicySyncStatus } from "@/types/wizard.types";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  companyId: string;
  mode?: "required" | "voluntary";
  policySync?: WizardPolicySyncStatus | null;
  onCompleted: () => void;
  onDismiss?: () => void;
}

export default function SetupWizardPhase5({
  companyId,
  mode = "required",
  policySync,
  onCompleted,
  onDismiss,
}: Props) {
  const [saving, setSaving] = useState(false);

  async function handleAcknowledge() {
    setSaving(true);
    const res = await acknowledgeWizardPolicySync(companyId);
    setSaving(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    toast.success("Cambios del RAT registrados como revisados");
    onCompleted();
  }

  return (
    <WizardModalShell
      mode={mode}
      onDismiss={onDismiss}
      maxWidth="lg"
      accent="amber"
      footer={
        <div className="mt-6 flex justify-end border-t border-[#EEF2F8] pt-5">
          <Button type="button" loading={saving} onClick={handleAcknowledge}>
            Entendido, marcar como revisado
          </Button>
        </div>
      }
    >
      <WizardModalHeader
        icon="tabler:refresh-alert"
        phase={5}
        title="Actualización del RAT"
        subtitle="Modificaste el registro de tratamiento desde que generaste la política."
        accent="amber"
      />

      <WizardModalBody scrollable={false}>
        <WizardQuestionCard
          question="¿Qué significa esto para tu política?"
          hint="Las políticas generadas desde el RAT se actualizan solas en cada consulta pública. Los consentimientos ya firmados conservan la versión que aceptó cada titular."
        >
          <ul className="space-y-3 text-sm text-[#64748B]">
            <li className="flex items-start gap-2.5 rounded-lg border border-[#E8EDF7] bg-white px-3 py-2.5">
              <span className="mt-0.5 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                Antes
              </span>
              <span>
                Versión al generar la política:{" "}
                <strong className="text-[#1A2B5B]">v{policySync?.baselineRatVersion ?? "—"}</strong>
              </span>
            </li>
            <li className="flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2.5">
              <span className="mt-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                Ahora
              </span>
              <span>
                Versión actual del RAT:{" "}
                <strong className="text-amber-950">v{policySync?.currentRatVersion ?? "—"}</strong>
              </span>
            </li>
            <li>El portal y formularios nuevos ya reflejan los datos actualizados.</li>
            <li>
              Revisa si debes informar cambios materiales a titulares que ya dieron su
              consentimiento.
            </li>
          </ul>
        </WizardQuestionCard>
      </WizardModalBody>
    </WizardModalShell>
  );
}
