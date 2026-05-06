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
    <div className="bg-white rounded-2xl border border-[#E6ECF7] p-3 sm:p-4 flex flex-col gap-2 min-h-[280px] sm:min-h-[300px] md:min-h-0 shadow-[0_8px_24px_rgba(15,35,70,0.06)]">
      <header className="border-b border-[#E6ECF7] flex items-center justify-between px-1 pb-2">
        <h6 className="text-[#0E2451] font-semibold text-sm truncate pr-2">{title}</h6>
        {href && (
          <Link
            href={href}
            className="text-[#2D60E0] hover:underline text-xs sm:text-sm flex items-center gap-1 flex-shrink-0 font-medium"
          >
            Ver más
            <Icon icon={"tabler:chevron-right"} className="text-sm" />
          </Link>
        )}
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-1 sm:p-2 md:px-3">
        {loading && (
          <div className="relative w-full h-full">
            <LoadingCover />
          </div>
        )}
        {empty && !loading && (
          <div className="flex flex-col items-center text-center gap-2 text-[#6A7EA7] justify-center h-full py-4">
            <Icon icon={"tabler:report"} className="text-5xl sm:text-6xl text-[#B8C5DF]" />

            <p className="font-medium text-xs sm:text-sm px-2">
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
