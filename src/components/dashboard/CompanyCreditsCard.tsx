import { Icon } from "@iconify/react";
import React from "react";
import { CompanyCreditsCurrentMonth } from "@/types/company.types";
import { DashboardCreditsCardSkeleton } from "./DashboardSkeletons";

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

  if (loading) {
    return <DashboardCreditsCardSkeleton />;
  }

  return (
    <div className="relative h-full min-h-[160px] overflow-hidden rounded-[20px] bg-[linear-gradient(103deg,_#1C4DC8_0%,_#2F63EE_52%,_#3E71F5_100%)] px-6 py-5 text-white">
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#4C79F0]/45" />
      <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-[#4C79F0]/45" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[18px] w-[18px] place-content-center rounded-[5px] border border-white/55 bg-white/10">
            <Icon icon="tabler:credit-card" className="text-[11px] text-white" />
          </span>
          <h4 className="whitespace-nowrap text-[14px] font-semibold leading-none">
            Créditos consumidos
          </h4>
        </div>

        <div className="dashboard-content-in mt-4 flex flex-col gap-1.5">
          {error && (
            <div className="flex items-center gap-2 text-white/90">
              <Icon
                icon="material-symbols:report-outline-rounded"
                className="flex-shrink-0 text-base sm:text-lg"
              />
              <p className="text-xs font-medium sm:text-sm">Error: {error}</p>
            </div>
          )}

          {!error && data && (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[46px] font-bold leading-none tracking-[-0.03em]">
                  {data.creditsUsed}
                </span>
                <span className="text-[20px] leading-none text-white/95">pesos</span>
              </div>
              <p className="text-[14px] leading-none text-white/90">
                {getMonthName(data.month)} {data.year}
              </p>
            </>
          )}

          {!error && !data && (
            <div className="flex items-center gap-2 text-white/90">
              <Icon
                icon="tabler:report"
                className="flex-shrink-0 text-base sm:text-lg"
              />
              <p className="text-xs font-medium sm:text-sm">
                No hay datos disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCreditsCard;
