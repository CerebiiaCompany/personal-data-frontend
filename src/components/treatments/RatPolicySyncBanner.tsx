"use client";

import Button from "@/components/base/Button";
import { useSetupWizardOptional } from "@/components/wizard/SetupWizardContext";
import { useWizardPolicySync } from "@/hooks/useWizardPolicySync";
import { acknowledgeWizardPolicySync } from "@/lib/wizard.api";
import { useSessionStore } from "@/store/useSessionStore";
import { WizardPolicySyncBannerStatus } from "@/types/wizard.types";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId?: string;
  className?: string;
  /** Datos precargados (evita doble fetch si el padre ya los tiene). */
  sync?: WizardPolicySyncBannerStatus | null;
  onAcknowledged?: () => void;
}

export default function RatPolicySyncBanner({
  companyId,
  className = "",
  sync,
  onAcknowledged,
}: Props) {
  const role = useSessionStore((s) => s.user?.role);
  const isAdmin = role === "COMPANY_ADMIN" || role === "SUPERADMIN";
  const wizard = useSetupWizardOptional();

  const hook = useWizardPolicySync({
    companyId,
    enabled: Boolean(companyId) && sync === undefined,
  });

  const data = sync ?? hook.data;
  const pending = Boolean(data?.pending);
  const [saving, setSaving] = useState(false);

  if (!pending || !data) return null;

  async function handleAcknowledge() {
    if (!companyId) return;
    setSaving(true);
    const res = await acknowledgeWizardPolicySync(companyId);
    setSaving(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    toast.success("Cambios del RAT registrados como revisados");
    if (sync === undefined) {
      await hook.refresh();
    }
    onAcknowledged?.();
    await wizard?.refreshStatus();
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between ${className}`}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon
          icon="tabler:refresh-alert"
          className="mt-0.5 shrink-0 text-xl text-amber-700"
        />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-amber-950">
            El RAT cambió desde que generaste la política de privacidad
          </p>
          <p className="text-xs leading-relaxed text-amber-900/90 sm:text-sm">
            Versión al generar la política:{" "}
            <strong>v{data.baselineRatVersion ?? "—"}</strong>
            {" · "}
            Versión actual: <strong>v{data.currentRatVersion ?? "—"}</strong>.
            {" "}
            Los formularios y el portal público ya muestran los datos actualizados;
            revisa si debes informar cambios materiales a titulares con consentimiento previo.
          </p>
          {data.treatmentId && (
            <Link
              href={`/admin/tratamientos/${data.treatmentId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
            >
              Ver tratamiento afectado
              <Icon icon="tabler:arrow-right" className="text-sm" />
            </Link>
          )}
        </div>
      </div>

      {isAdmin ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
          {wizard?.canOpen && (
            <Button
              type="button"
              hierarchy="secondary"
              className="border-amber-300! bg-white!"
              onClick={wizard.openPolicySyncReview}
            >
              Abrir Fase 5
            </Button>
          )}
          <Button type="button" loading={saving} onClick={handleAcknowledge}>
            Marcar como revisado
          </Button>
        </div>
      ) : (
        <p className="shrink-0 text-xs font-medium text-amber-900/80 sm:max-w-[220px] sm:text-right">
          Solo el administrador de la empresa puede cerrar esta revisión (Fase 5 del
          asistente).
        </p>
      )}
    </div>
  );
}
