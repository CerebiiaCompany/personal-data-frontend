import { TreatmentStatus, TREATMENT_STATUS_LABELS } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";

const STATUS_STYLE: Record<
  TreatmentStatus,
  { className: string; icon: string }
> = {
  DRAFT: {
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "tabler:pencil",
  },
  ACTIVE: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "tabler:circle-check",
  },
  ARCHIVED: {
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: "tabler:archive",
  },
};

interface Props {
  status: TreatmentStatus;
  className?: string;
}

const TreatmentStatusBadge = ({ status, className }: Props) => {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        style.className,
        className
      )}
    >
      <Icon icon={style.icon} className="text-sm" />
      {TREATMENT_STATUS_LABELS[status]}
    </span>
  );
};

export default TreatmentStatusBadge;
