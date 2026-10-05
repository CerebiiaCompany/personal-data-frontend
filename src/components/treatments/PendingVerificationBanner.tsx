"use client";

import Button from "@/components/base/Button";
import { usePendingVerificationCount } from "@/hooks/usePendingVerificationCount";
import { Icon } from "@iconify/react";

interface Props {
  companyId?: string;
  className?: string;
  onFilter: (patch: { verificationStatus: "PENDING_VERIFICATION" | "PENDING_DEACTIVATION" }) => void;
}

/**
 * Item C-04/N-15 (mecanismo de "Incertidumbre") — hasta esta implementación
 * un Treatment podía quedar marcado PENDING_VERIFICATION/PENDING_DEACTIVATION
 * indefinidamente sin que ninguna pantalla lo mostrara (el backend ya lo
 * generaba, ver wizardTreatmentGeneration.ts). Mismo patrón visual que
 * RatPolicySyncBanner: banner que solo aparece si hay algo pendiente.
 */
export default function PendingVerificationBanner({ companyId, className = "", onFilter }: Props) {
  const { verificationCount, deactivationCount, total } = usePendingVerificationCount(companyId);

  if (total === 0) return null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-orange-200/90 bg-orange-50/95 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between ${className}`}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon icon="tabler:help-circle" className="mt-0.5 shrink-0 text-xl text-orange-700" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-orange-950">
            {total === 1
              ? "Hay 1 tratamiento con incertidumbre pendiente de revisión"
              : `Hay ${total} tratamientos con incertidumbre pendiente de revisión`}
          </p>
          <p className="text-xs leading-relaxed text-orange-900/90 sm:text-sm">
            El wizard infirió estos tratamientos de una respuesta, pero un
            administrador todavía no confirmó que los datos son correctos.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
        {verificationCount > 0 && (
          <Button
            type="button"
            hierarchy="secondary"
            className="border-orange-300! bg-white!"
            onClick={() => onFilter({ verificationStatus: "PENDING_VERIFICATION" })}
          >
            Ver {verificationCount} con verificación pendiente
          </Button>
        )}
        {deactivationCount > 0 && (
          <Button
            type="button"
            hierarchy="secondary"
            className="border-orange-300! bg-white!"
            onClick={() => onFilter({ verificationStatus: "PENDING_DEACTIVATION" })}
          >
            Ver {deactivationCount} con desactivación pendiente
          </Button>
        )}
      </div>
    </div>
  );
}
