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
    <div className="bg-[linear-gradient(103deg,_#1C4DC8_0%,_#2F63EE_52%,_#3E71F5_100%)] rounded-[20px] px-6 py-5 text-white relative overflow-hidden h-full min-h-[160px]">
      <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-[#4C79F0]/45" />
      <div className="absolute -left-8 -bottom-10 w-24 h-24 rounded-full bg-[#4C79F0]/45" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2.5">
          <span className="w-[18px] h-[18px] rounded-[5px] border border-white/55 bg-white/10 grid place-content-center">
            <Icon icon="tabler:credit-card" className="text-[11px] text-white" />
          </span>
          <h4 className="font-semibold text-[14px] leading-none whitespace-nowrap">
            Créditos consumidos
          </h4>
        </div>

        <div className="flex flex-col gap-1.5 mt-4">
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
              <div className="flex items-baseline gap-1.5">
                <span className="text-[46px] font-bold leading-none tracking-[-0.03em]">
                  {data.creditsUsed}
                </span>
                <span className="text-[20px] text-white/95 leading-none">pesos</span>
              </div>
              <p className="text-white/90 text-[14px] leading-none">
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

