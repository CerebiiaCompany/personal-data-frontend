import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React from "react";
import LoadingCover from "../layout/LoadingCover";

interface Props {
  title: string;
  href?: string;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
  children: React.ReactNode /* | React.ReactNode[] */;
}

const DashboardChartCard = ({
  title,
  href,
  children,
  loading,
  error,
  empty,
}: Props) => {
  return (
    <div className="shadow-md bg-white rounded-md border border-disabled p-2.5 sm:p-3 flex flex-col gap-2 min-h-[280px] sm:min-h-[300px] md:min-h-0">
      <header className="border-b border-disabled flex items-center justify-between px-2 sm:px-2.5 pb-1.5">
        <h6 className="text-primary-900 font-medium text-xs sm:text-sm truncate pr-2">{title}</h6>
        {href && (
          <Link
            href={href}
            className="text-primary-900 hover:underline text-xs sm:text-sm flex items-center gap-1 flex-shrink-0"
          >
            Ver más
            <Icon icon={"tabler:chevron-right"} className="text-sm" />
          </Link>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2 sm:p-2.5 md:px-4">
        {loading && (
          <div className="relative w-full h-full">
            <LoadingCover />
          </div>
        )}
        {empty && !loading && (
          <div className="flex flex-col items-center text-center gap-2 text-stone-500 justify-center h-full py-4">
            <Icon icon={"tabler:report"} className="text-5xl sm:text-6xl text-stone-400" />

            <p className="font-medium text-stone-500 text-xs sm:text-sm px-2">
              No hay datos para mostrar en el mes seleccionado
            </p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center text-center gap-2 text-stone-500 justify-center h-full py-4">
            <Icon
              icon={"material-symbols:report-outline-rounded"}
              className="text-5xl sm:text-6xl text-red-400"
            />

            <p className="font-medium text-xs sm:text-sm">Error: {error}</p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default DashboardChartCard;
