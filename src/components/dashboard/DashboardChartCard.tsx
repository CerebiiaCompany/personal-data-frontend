import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React from "react";
import { DashboardChartSkeleton, DashboardActivitySkeleton } from "./DashboardSkeletons";

interface Props {
  title: string;
  href?: string;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
  children: React.ReactNode;
  /** Tipo de skeleton al cargar */
  skeletonVariant?: "chart" | "activity";
  skeletonRows?: number;
}

const DashboardChartCard = ({
  title,
  href,
  children,
  loading,
  error,
  empty,
  skeletonVariant = "chart",
  skeletonRows,
}: Props) => {
  const showContent = !loading && !empty && !error;

  return (
    <div className="flex min-h-[280px] flex-col gap-2 rounded-2xl border border-[#E6ECF7] bg-white p-3 shadow-[0_8px_24px_rgba(15,35,70,0.06)] sm:min-h-[300px] sm:p-4 md:min-h-0">
      <header className="flex items-center justify-between border-b border-[#E6ECF7] px-1 pb-2">
        <h6 className="truncate pr-2 text-sm font-semibold text-[#0E2451]">
          {title}
        </h6>
        {href && (
          <Link
            href={href}
            className="flex flex-shrink-0 items-center gap-1 text-xs font-medium text-[#2D60E0] hover:underline sm:text-sm"
          >
            Ver más
            <Icon icon={"tabler:chevron-right"} className="text-sm" />
          </Link>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-1 sm:p-2 md:px-3">
        {loading && (
          skeletonVariant === "activity" ? (
            <DashboardActivitySkeleton rows={skeletonRows ?? 3} />
          ) : (
            <DashboardChartSkeleton rows={skeletonRows ?? 4} />
          )
        )}

        {empty && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-4 text-center text-[#6A7EA7]">
            <Icon
              icon={"tabler:report"}
              className="text-5xl text-[#B8C5DF] sm:text-6xl"
            />
            <p className="px-2 text-xs font-medium sm:text-sm">
              No hay datos para mostrar en el mes seleccionado
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-4 text-center text-stone-500">
            <Icon
              icon={"material-symbols:report-outline-rounded"}
              className="text-5xl text-red-400 sm:text-6xl"
            />
            <p className="text-xs font-medium sm:text-sm">Error: {error}</p>
          </div>
        )}

        {showContent && (
          <div className="dashboard-content-in flex flex-1 flex-col gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChartCard;
