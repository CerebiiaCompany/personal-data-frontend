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
    <div className="shadow-md bg-white rounded-md border border-disabled p-3 flex flex-col gap-2">
      <header className="border-b border-disabled flex items-center justify-between px-2 pb-1">
        <h6 className="text-primary-900 font-medium text-sm">{title}</h6>
        {href && (
          <Link
            href={href}
            className="text-primary-900 hover:underline text-sm flex items-center gap-1"
          >
            Ver más
            <Icon icon={"tabler:chevron-right"} />
          </Link>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2 px-4">
        {loading && (
          <div className="relative w-full h-full">
            <LoadingCover />
          </div>
        )}
        {empty && !loading && (
          <div className="flex flex-col items-center text-center gap-1 text-stone-500 justify-center h-full">
            <Icon icon={"tabler:report"} className="text-6xl" />

            <p className="font-medium">
              No hay datos para mostrar en el mes seleccionado
            </p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center text-center gap-1 text-stone-500 justify-center h-full">
            <Icon
              icon={"material-symbols:report-outline-rounded"}
              className="text-6xl"
            />

            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default DashboardChartCard;
