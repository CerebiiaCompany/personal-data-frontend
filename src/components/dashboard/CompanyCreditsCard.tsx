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
    <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-lg px-5 py-3 text-white relative flex items-center justify-between overflow-hidden shadow-lg">
      {/* Decoración de fondo */}
      <div className="w-32 aspect-square absolute right-[-20px] top-[-20px] rounded-full border-white/20 border border-dashed" />

      {/* Contenido */}
      <div className="relative z-10 flex items-center justify-between w-full gap-4">
        {/* Título */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon icon="mdi:credit-card-outline" className="text-xl" />
          <h4 className="font-semibold text-base whitespace-nowrap">Créditos Consumidos</h4>
        </div>

        {/* Contenido dinámico */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {loading && (
            <div className="relative w-20 h-6">
              <LoadingCover size="sm" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-white/90">
              <Icon icon="material-symbols:report-outline-rounded" className="text-lg" />
              <p className="font-medium text-sm">Error: {error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{data.creditsUsed}</span>
                <span className="text-sm text-white/80">créditos</span>
              </div>
              <p className="text-white/80 text-xs whitespace-nowrap">
                {getMonthName(data.month)} {data.year}
              </p>
            </>
          )}

          {!loading && !error && !data && (
            <div className="flex items-center gap-2 text-white/90">
              <Icon icon="tabler:report" className="text-lg" />
              <p className="font-medium text-sm">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCreditsCard;

