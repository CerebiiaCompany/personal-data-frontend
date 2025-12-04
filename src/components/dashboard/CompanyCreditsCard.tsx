import { Icon } from "@iconify/react";
import React from "react";
import LoadingCover from "../layout/LoadingCover";
import { CompanyCreditsCurrentMonth } from "@/types/company.types";

interface Props {
  data: CompanyCreditsCurrentMonth | null;
  loading: boolean;
  error: string | null;
}

const CompanyCreditsCard = ({ data, loading, error }: Props) => {
  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1] || "";
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-lg px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-white relative flex items-center justify-between overflow-hidden shadow-lg">
      {/* Decoración de fondo */}
      <div className="w-20 sm:w-24 md:w-32 aspect-square absolute right-[-12px] sm:right-[-15px] md:right-[-20px] top-[-12px] sm:top-[-15px] md:top-[-20px] rounded-full border-white/20 border border-dashed" />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-3 md:gap-4">
        {/* Título */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon icon="mdi:credit-card-outline" className="text-lg sm:text-xl md:text-2xl flex-shrink-0" />
          <h4 className="font-semibold text-sm sm:text-base whitespace-nowrap">Créditos Consumidos</h4>
        </div>

        {/* Contenido dinámico */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap sm:flex-nowrap">
          {loading && (
            <div className="relative w-20 h-6">
              <LoadingCover size="sm" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-white/90">
              <Icon icon="material-symbols:report-outline-rounded" className="text-base sm:text-lg flex-shrink-0" />
              <p className="font-medium text-xs sm:text-sm">Error: {error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none">{data.creditsUsed}</span>
                <span className="text-xs sm:text-sm text-white/90">créditos</span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm">
                {getMonthName(data.month)} {data.year}
              </p>
            </>
          )}

          {!loading && !error && !data && (
            <div className="flex items-center gap-2 text-white/90">
              <Icon icon="tabler:report" className="text-base sm:text-lg flex-shrink-0" />
              <p className="font-medium text-xs sm:text-sm">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCreditsCard;

