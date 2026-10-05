import { VERIFICATION_STATUS_LABELS, VerificationStatus } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";

const STATUS_STYLE: Record<VerificationStatus, { className: string; icon: string } | null> = {
  // CONFIRMED es el estado normal — no se muestra badge (mismo criterio que
  // "sin filtros activos" en TreatmentsFilters: solo se resalta la excepción).
  CONFIRMED: null,
  PENDING_VERIFICATION: {
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: "tabler:help-circle",
  },
  PENDING_DEACTIVATION: {
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "tabler:alert-triangle",
  },
};

interface Props {
  status: VerificationStatus;
  className?: string;
}

/** Item C-04/N-15 (mecanismo de "Incertidumbre") — badge que solo aparece cuando hay algo por resolver. */
const TreatmentVerificationBadge = ({ status, className }: Props) => {
  const style = STATUS_STYLE[status];
  if (!style) return null;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        style.className,
        className
      )}
    >
      <Icon icon={style.icon} className="text-sm" />
      {VERIFICATION_STATUS_LABELS[status]}
    </span>
  );
};

export default TreatmentVerificationBadge;
