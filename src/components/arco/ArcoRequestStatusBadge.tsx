import { ArcoRequestStatus } from "@/types/arco.types";
import { formatArcoStatusLabel } from "@/utils/arcoAdmin.utils";
import clsx from "clsx";

const STATUS_STYLES: Record<ArcoRequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200/80",
  IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-200/80",
  RESOLVED: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  REJECTED: "bg-red-50 text-red-800 border-red-200/80",
};

interface Props {
  status: ArcoRequestStatus;
  overdue?: boolean;
  className?: string;
}

const ArcoRequestStatusBadge = ({ status, overdue, className }: Props) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {formatArcoStatusLabel(status)}
      {overdue && status !== "RESOLVED" && status !== "REJECTED" && (
        <span className="font-semibold text-red-600">· Vencida</span>
      )}
    </span>
  );
};

export default ArcoRequestStatusBadge;
