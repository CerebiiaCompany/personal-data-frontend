import { ArcoSummary } from "@/types/arco.admin.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

interface Props {
  summary: ArcoSummary | null;
  loading?: boolean;
  activeFilter?: string;
  onFilterClick?: (status: string) => void;
}

const CARDS = [
  {
    key: "pending",
    label: "Pendientes",
    icon: "tabler:clock",
    color: "text-amber-700 bg-amber-50 border-amber-200/80",
    filter: "PENDING",
  },
  {
    key: "inProgress",
    label: "En proceso",
    icon: "tabler:progress",
    color: "text-blue-700 bg-blue-50 border-blue-200/80",
    filter: "IN_PROGRESS",
  },
  {
    key: "resolved",
    label: "Resueltas",
    icon: "tabler:circle-check",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    filter: "RESOLVED",
  },
  {
    key: "rejected",
    label: "Rechazadas",
    icon: "tabler:circle-x",
    color: "text-red-700 bg-red-50 border-red-200/80",
    filter: "REJECTED",
  },
  {
    key: "overdue",
    label: "Vencidas",
    icon: "tabler:alert-triangle",
    color: "text-orange-800 bg-orange-50 border-orange-200/80",
    filter: "overdue",
  },
] as const;

const ArcoSummaryCards = ({
  summary,
  loading,
  activeFilter,
  onFilterClick,
}: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => {
        const value = summary?.[card.key as keyof ArcoSummary] ?? 0;
        const isActive = activeFilter === card.filter;
        const clickable = Boolean(onFilterClick);

        return (
          <button
            key={card.key}
            type="button"
            disabled={loading || !clickable}
            onClick={() => onFilterClick?.(card.filter)}
            className={clsx(
              "rounded-2xl border p-4 text-left transition-all",
              card.color,
              clickable && "hover:shadow-md hover:-translate-y-0.5",
              isActive && "ring-2 ring-primary-900/20",
              loading && "opacity-60"
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <Icon icon={card.icon} className="text-xl" />
              <span className="text-2xl font-bold tabular-nums">{value}</span>
            </div>
            <p className="text-sm font-medium">{card.label}</p>
          </button>
        );
      })}
    </div>
  );
};

export default ArcoSummaryCards;
